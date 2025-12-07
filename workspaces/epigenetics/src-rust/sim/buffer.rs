#[path = "./buffer_tests.rs"]
#[cfg(test)]
mod tests;

use wgpu::util::DeviceExt;

// The Fxx type is used to represent floating-point numbers in the simulation.
// This is so we can see all of the places where values will be passed into
// the simulation and ensure they are all the same type.
// It's also a cental place to change this type if we want to reduce the memory
// usage of the simulation.
pub type Fxx = f32;

#[derive(Clone)]
pub enum Config {
  Topologies(TopologiesConfig),
  Weights(WeightsConfig),
}

impl Config {
  pub fn label(&self) -> &'static str {
    match self {
      Config::Topologies(config) => config.label,
      Config::Weights(config) => config.label,
    }
  }

  pub fn with_write(&self) -> bool {
    match self {
      Config::Topologies(_) => false,
      Config::Weights(config) => config.ping_pong,
    }
  }

  pub fn memory_usage_max(&self) -> u64 {
    match self {
      Config::Topologies(config) => config.memory_usage_max(),
      Config::Weights(config) => config.memory_usage_max(),
    }
  }
}

impl From<TopologiesConfig> for Config {
  fn from(config: TopologiesConfig) -> Self {
    Config::Topologies(config)
  }
}

impl From<WeightsConfig> for Config {
  fn from(config: WeightsConfig) -> Self {
    Config::Weights(config)
  }
}

#[derive(Clone)]
pub struct WeightsConfig {
  pub label: &'static str,
  pub ping_pong: bool,
  pub count: u32,
  pub weight_count: u32,
  pub weight_min: Fxx,
  pub weight_max: Fxx,
}

impl WeightsConfig {
  pub fn memory_usage_max(&self) -> u64 {
    let weight_size = std::mem::size_of::<Fxx>() as u64;
    let weight_size_per_block = self.weight_count as u64 * weight_size;
    let weight_size_total = self.count as u64 * weight_size_per_block;
    // Account for write buffer if needed
    if self.ping_pong {
      weight_size_total * 2
    } else {
      weight_size_total
    }
  }
}

#[derive(Clone)]
pub struct TopologiesConfig {
  pub label: &'static str,
  pub topologies: Vec<TopologyConfig>,
}

#[derive(Clone)]
pub struct TopologyConfig {
  pub metadata: Option<Vec<Fxx>>,
  pub node_count: u32,
  pub edges_index_pool_size: u32,
  pub edges_index_min: f32,
  pub edges_index_max: f32,
  pub weight_min: f32,
  pub weight_max: f32,
}

impl TopologiesConfig {
  pub fn memory_usage_max(&self) -> u64 {
    let mut elements_count = 0;

    for topology in self.topologies.iter() {
      let TopologyConfig {
        node_count,
        metadata,
        edges_index_pool_size,
        edges_index_min: _,
        edges_index_max,
        weight_min: _,
        weight_max: _,
      } = topology;

      let max_edges_count = (edges_index_max * *edges_index_pool_size as f32).round() as usize;

      let topology_size = 0 +
        1 + // NodeCount
        *node_count as usize * 2 + // NodeOffsets
        1 + // NodeMetadataCount
        metadata.as_ref().map_or(0, |metadata| metadata.len()) + // Metadata
        max_edges_count + // EdgesCount(max)
        max_edges_count * 2; // Edges[Index, Weight];}

      elements_count += topology_size;
    }

    let cell_size = std::mem::size_of::<Fxx>();
    (elements_count * cell_size) as u64
  }
}

#[derive(Clone)]
pub struct Buffer {
  pub label: &'static str,
  pub read: wgpu::Buffer,
  pub write: Option<wgpu::Buffer>,
}

impl Buffer {
  pub fn from_config(device: &wgpu::Device, config: impl Into<Config>) -> Self {
    let config = config.into();

    let read = match &config {
      Config::Topologies(config) => Self::create_topologies_buffer(device, &config),
      Config::Weights(config) => Self::create_weights_buffer(device, &config),
    };

    let write = if config.with_write() {
      Some(device.create_buffer(&wgpu::BufferDescriptor {
        label: Some(format!("{}_write", config.label()).as_str()),
        size: read.size() as u64,
        usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
      }))
    } else {
      None
    };

    Self {
      label: config.label(),
      read,
      write,
    }
  }

  pub fn create_topologies_buffer(
    device: &wgpu::Device,
    config: &TopologiesConfig,
  ) -> wgpu::Buffer {
    let TopologiesConfig {
      label,
      topologies: _,
    } = config;

    let topology_data = Self::create_topology_data(config);

    return device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some(format!("{}_read", label).as_str()),
      contents: bytemuck::cast_slice(&topology_data),
      usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
    });
  }

  /// The topology data is a compressed sparse row (CSR) format and has the following structure:
  ///
  /// [
  ///   TopologyCount,
  ///   TopologyOffsets,
  ///   Topology[
  ///     MetadataCount,
  ///     Metadata,
  ///     NodeCount,
  ///     NodeOffsets,
  ///     Nodes[
  ///       EdgesCount,
  ///       Edges[
  ///         EdgeIndex,
  ///         EdgeWeight
  ///       ]
  ///     ]
  ///   ]
  /// ]
  ///
  fn create_topology_data(config: &TopologiesConfig) -> Vec<Fxx> {
    let TopologiesConfig {
      label: _,
      topologies,
    } = config;

    // Get the number of topologies
    let topology_count = topologies.len();

    // Get a sum of all of the metadata elements across all topologies
    let metadata_total_count = topologies
      .iter()
      .map(|topology_config| {
        topology_config
          .metadata
          .as_ref()
          .map_or(0, |metadata| metadata.len())
      })
      .sum::<usize>();

    // Get a sum of all of the nodes across all topologies
    let nodes_total_counts = topologies
      .iter()
      .map(|topology_config| topology_config.node_count as usize)
      .collect::<Vec<usize>>();

    // Get a sum of all of the nodes across all topologies
    let nodes_total_count = nodes_total_counts.iter().sum::<usize>();

    // Create the number of influences for each nested topology element
    let node_edges_counts = topologies
      .iter()
      .map(|topology_config| {
        let TopologyConfig {
          node_count,
          edges_index_pool_size,
          metadata: _,
          edges_index_max,
          edges_index_min,
          weight_min: _,
          weight_max: _,
        } = topology_config;

        let edge_count_min = (edges_index_min * *edges_index_pool_size as f32).round() as u32;
        let edge_count_max = (edges_index_max * *edges_index_pool_size as f32).round() as u32;

        // Each topology config, there's a count of how many topological elements it has.
        // For example, regional environments have multiple points that have influence on the
        // genotype.
        (0..*node_count)
          .map(move |_| fastrand::u32(edge_count_min..=edge_count_max))
          .collect::<Vec<u32>>()
      })
      .collect::<Vec<Vec<u32>>>();

    // Get a size of all the edges
    let node_edges_sums = node_edges_counts
      .iter()
      .map(|edges_count| edges_count.iter().sum::<u32>())
      .collect::<Vec<u32>>();

    // Total edges from all topologies
    let node_edges_total = node_edges_sums.iter().sum::<u32>() as usize;

    // Get a size of an entire topologies buffers.
    let buffer_size = 1 // TopologyCount
      + topology_count // TopologyOffsets
      + topology_count // MetadataCount (one per topology)
      + metadata_total_count // Metadata
      + topology_count // NodeCount (one per topology)
      + nodes_total_count // NodeOffsets (one per node)
      + nodes_total_count // EdgesCount (one per node)
      + node_edges_total * 2; // Edges[Index, Weight]

    // Now we know the size of the buffer, we can create it and fill it with the data
    let mut topology_data: Vec<Fxx> = Vec::with_capacity(buffer_size);

    // Add the topology count
    topology_data.push(topology_count as Fxx);

    // Add the topology offsets for each topology
    let mut topology_offset = 1 + topology_count;
    for (topology_index, topology_config) in topologies.iter().enumerate() {
      let metadata_count = topology_config
        .metadata
        .as_ref()
        .map_or(0, |metadata| metadata.len());

      let topology_size = 0 +
        1 + // MetadataCount
        metadata_count + // Metadata
        1 + // NodeCount
        topology_config.node_count as usize + // NodeOffsets
        topology_config.node_count as usize + // EdgesCount (one per node)
        node_edges_sums[topology_index] as usize * 2; // Edges[Index, Weight];

      topology_data.push(topology_offset as Fxx);
      topology_offset += topology_size;
    }

    // Add each topologies data
    for (topology_index, topology_config) in topologies.iter().enumerate() {
      let TopologyConfig {
        node_count,
        edges_index_pool_size,
        metadata,
        edges_index_max: _,
        edges_index_min: _,
        weight_min,
        weight_max,
      } = topology_config;

      let topology_offset = topology_data[topology_index + 1] as usize;
      let metadata_count = topology_config
        .metadata
        .as_ref()
        .map_or(0, |metadata| metadata.len());

      // Add the metadata count for this topology
      topology_data.push(metadata_count as Fxx);

      // Add the metadata elements for this topology
      if let Some(metadata) = metadata {
        topology_data.extend(metadata.iter());
      }

      // Add the node count for this topology
      topology_data.push(*node_count as Fxx);

      // Add the node offsets for each topology node
      // node_offset points to the start of each node's EdgesCount
      let mut node_offset = 0 +
        topology_offset +  // Start of the topology data
        1 +  // MetadataCount
        metadata_count + // Metadata
        1 +  // NodeCount
        *node_count as usize; // NodeOffsets (one per node);

      for node_edge_count in node_edges_counts[topology_index].iter() {
        let node_size = 0 +
          1 + // EdgesCount
          *node_edge_count as usize * 2; // Edges[Index, Weight]

        topology_data.push(node_offset as Fxx);
        node_offset += node_size;
      }

      // Add the edges for each topology node
      for node_edge_count in node_edges_counts[topology_index].iter() {
        // Add the edges count for this topology node
        topology_data.push(*node_edge_count as Fxx);

        for _ in 0..*node_edge_count {
          let edge_index = fastrand::u32(0..*edges_index_pool_size);
          let edge_weight = *weight_min + fastrand::f32() * (*weight_max - *weight_min);
          topology_data.push(edge_index as Fxx);
          topology_data.push(edge_weight as Fxx);
        }
      }
    }

    topology_data
  }

  pub fn create_weights_buffer(device: &wgpu::Device, config: &WeightsConfig) -> wgpu::Buffer {
    let WeightsConfig {
      label,
      ping_pong: _,
      count,
      weight_count,
      weight_min,
      weight_max,
    } = config;

    let mut random_weights = Vec::with_capacity(*count as usize * *weight_count as usize);

    for _ in 0..*count {
      for _ in 0..*weight_count {
        let random = fastrand::f32();
        let value = *weight_min + random * (*weight_max - *weight_min);
        random_weights.push(value as Fxx);
      }
    }

    // Create buffer with mapped_at_creation to write directly from CPU
    let read = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
      label: Some(format!("{}_read", label).as_str()),
      contents: bytemuck::cast_slice(&random_weights),
      usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
    });

    read
  }

  pub fn read_binding(&self) -> wgpu::BindingResource {
    self.read.as_entire_binding()
  }

  pub fn write_binding(&self) -> wgpu::BindingResource {
    if let Some(write) = &self.write {
      write.as_entire_binding()
    } else {
      self.read.as_entire_binding()
    }
  }

  pub fn memory_usage(&self) -> u64 {
    self.read.size() + self.write.as_ref().map_or(0, |buffer| buffer.size())
  }

  pub fn swap(&mut self) {
    if self.write.is_some() {
      std::mem::swap(&mut self.read, &mut self.write.as_mut().unwrap());
    }
  }
}
