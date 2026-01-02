#[cfg(test)]
mod tests {
  use crate::sim::buffer::*;

  #[test]
  fn test_empty_topology() {
    let topology_data = Buffer::create_topology_data(&TopologiesConfig {
      label: "test",
      topologies: vec![],
    });

    assert!(matches!(topology_data.as_slice(), [0.0]));
  }

  #[test]
  fn test_one_topology_with_one_node_one_edge() {
    let topology_data = Buffer::create_topology_data(&TopologiesConfig {
      label: "test",
      topologies: vec![TopologyConfig {
        node_count: 1,
        metadata: None,
        edges_index_pool_size: 1,
        edges_index_min: 1.0,
        edges_index_max: 1.0,
        weight_type: WeightType::RandomMinMax { min: 0.5, max: 0.5 },
      }],
    });

    let topology_data = topology_data.as_slice();

    assert!(
      matches!(
        topology_data,
        [
          1.0, // TopologyCount
          2.0, // TopologyOffset
          0.0, // MetadataCount
          1.0, // NodeCount
          5.0, // NodeOffset
          1.0, // EdgesCount
          0.0, // EdgeIndex
          0.5, // EdgeWeight
        ]
      ),
      "Does not match: {:?}",
      topology_data
    );
  }

  #[test]
  fn test_one_topology_with_one_node_one_edge_with_metadata() {
    let topology_data = Buffer::create_topology_data(&TopologiesConfig {
      label: "test",
      topologies: vec![TopologyConfig {
        node_count: 1,
        metadata: Some(vec![0.3, 0.3]),
        edges_index_pool_size: 1,
        edges_index_min: 1.0,
        edges_index_max: 1.0,
        weight_type: WeightType::RandomMinMax { min: 0.5, max: 0.5 },
      }],
    });

    let topology_data = topology_data.as_slice();

    assert!(
      matches!(
        topology_data,
        [
          1.0, // TopologyCount
          2.0, // TopologyOffset
          2.0, // MetadataCount
          0.3, // Metadata1
          0.3, // Metadata2
          1.0, // NodeCount
          7.0, // NodeOffset
          1.0, // EdgesCount
          0.0, // EdgeIndex
          0.5, // EdgeWeight
        ]
      ),
      "Does not match: {:?}",
      topology_data
    );
  }

  #[test]
  fn test_one_topology_with_multiple_nodes_multiple_edge() {
    let topology_data = Buffer::create_topology_data(&TopologiesConfig {
      label: "test",
      topologies: vec![TopologyConfig {
        node_count: 3,
        metadata: None,
        edges_index_pool_size: 2,
        edges_index_min: 1.0,
        edges_index_max: 1.0,
        weight_type: WeightType::RandomMinMax { min: 0.5, max: 0.5 },
      }],
    });

    let topology_data = topology_data.as_slice();

    assert!(
      matches!(
        topology_data,
        [
          1.0,  // TopologyCount
          2.0,  // TopologyOffset
          0.0,  // MetadataCount
          3.0,  // NodeCount
          7.0,  // Node1Offset
          12.0, // Node2Offset
          17.0, // Node3Offset
          // Node1
          2.0, // EdgesCount
          _,   // EdgeIndex
          0.5, // EdgeWeight
          _,   // EdgeIndex
          0.5, // EdgeCount
          // Node2
          2.0, // EdgesCount
          _,   // EdgeIndex
          0.5, // EdgeWeight
          _,   // EdgeIndex
          0.5, // EdgeWeight
          // Node3
          2.0, // EdgesCount
          _,   // EdgeIndex
          0.5, // EdgeWeight
          _,   // EdgeIndex
          0.5, // EdgeWeight
        ],
      ),
      "Does not match: {:?}",
      topology_data
    );
  }

  #[test]
  fn test_multiple_topologies_with_multiples_nodes_multiple_edges_with_metadata() {
    let topology_data = Buffer::create_topology_data(&TopologiesConfig {
      label: "test",
      topologies: vec![
        TopologyConfig {
          node_count: 2,
          metadata: Some(vec![0.3, 0.3]),
          edges_index_pool_size: 2,
          edges_index_min: 1.0,
          edges_index_max: 1.0,
          weight_type: WeightType::RandomMinMax { min: 0.5, max: 0.5 },
        },
        TopologyConfig {
          node_count: 2,
          metadata: Some(vec![0.6, 0.6]),
          edges_index_pool_size: 2,
          edges_index_min: 1.0,
          edges_index_max: 1.0,
          weight_type: WeightType::RandomMinMax { min: 0.5, max: 0.5 },
        },
      ],
    });

    let topology_data = topology_data.as_slice();

    assert!(
      matches!(
        topology_data,
        [
          2.0,  // TopologyCount
          3.0,  // Topology1Offset
          19.0, // Topology2Offset
          // Topology 1
          2.0,  // MetadataCount
          0.3,  // Metadata1
          0.3,  // Metadata2
          2.0,  // NodeCount
          9.0,  // Node1Offset
          14.0, // Node2Offset
          // Node 1
          2.0, // EdgesCount
          _,   // EdgeIndex
          0.5, // EdgeWeight
          _,   // EdgeIndex
          0.5, // EdgeWeight
          // Node 2
          2.0, // EdgesCount
          _,   // EdgeIndex
          0.5, // EdgeWeight
          _,   // EdgeIndex
          0.5, // EdgeWeight
          // Topology 2
          2.0,  // MetadataCount
          0.6,  // Metadata1
          0.6,  // Metadata2
          2.0,  // NodeCount
          25.0, // Node1Offset
          30.0, // Node2Offset
          // Node 1
          2.0, // EdgesCount
          _,   // EdgeIndex
          0.5, // EdgeWeight
          _,   // EdgeIndex
          0.5, // EdgeWeight
          // Node 2
          2.0, // EdgesCount
          _,   // EdgeIndex
          0.5, // EdgeWeight
          _,   // EdgeIndex
          0.5, // EdgeWeight
        ]
      ),
      "Does not match: {:?}",
      topology_data
    );
  }
}
