use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[typeshare]
#[serde(rename_all = "camelCase")]
pub struct Config {
  pub cell_size: u32,
  pub genotype_size: u32,
  pub phenotype_size: u32,
  pub epistasis_enabled: bool,
  pub epistasis_gain: f32,
  pub epistasis_edges_min: f32,
  pub epistasis_edges_max: f32,
  pub phenotype_gain: f32,
  pub phenotype_edges_min: f32,
  pub phenotype_edges_max: f32,
  pub regional_env_enabled: bool,
  pub regional_env_count: u32,
  pub regional_env_overlap: f32,
  pub regional_env_epi_gain: f32,
  pub regional_env_epi_edges_min: f32,
  pub regional_env_epi_edges_max: f32,
  pub regional_env_fit_gain: f32,
  pub regional_env_fit_edges_min: f32,
  pub regional_env_fit_edges_max: f32,
  pub global_env_enabled: bool,
  pub global_env_epi_gain: f32,
  pub global_env_epi_edges_min: f32,
  pub global_env_epi_edges_max: f32,
  pub global_env_fit_gain: f32,
  pub global_env_fit_edges_min: f32,
  pub global_env_fit_edges_max: f32,
  pub partnership_opportunities_max: u32,
  pub partnership_fitness_amplification: f32,
  pub partnership_fitness_edges_min: f32,
  pub partnership_fitness_edges_max: f32,
  pub partnership_monogamy_amplification: f32,
  pub partnership_monogamy_edges_min: f32,
  pub partnership_monogamy_edges_max: f32,
}

impl Config {
  /// Calculate the number of cells based on pixel dimensions and cell size
  pub fn get_cell_count(&self, width: u32, height: u32) -> u32 {
    (width / self.cell_size) * (height / self.cell_size)
  }

  pub fn create() -> Self {
    Self {
      cell_size: 10,
      genotype_size: 10,
      epistasis_enabled: true,
      epistasis_gain: 1.0,
      epistasis_edges_min: 0.25,
      epistasis_edges_max: 0.75,
      phenotype_gain: 1.0,
      phenotype_size: 25,
      phenotype_edges_min: 0.25,
      phenotype_edges_max: 0.75,
      regional_env_enabled: true,
      regional_env_epi_gain: 1.0,
      regional_env_count: 3,
      regional_env_overlap: 0.25,
      regional_env_epi_edges_min: 0.25,
      regional_env_epi_edges_max: 0.75,
      regional_env_fit_gain: 1.0,
      regional_env_fit_edges_min: 0.25,
      regional_env_fit_edges_max: 0.75,
      global_env_enabled: true,
      global_env_epi_gain: 1.0,
      global_env_epi_edges_min: 0.25,
      global_env_epi_edges_max: 0.75,
      global_env_fit_gain: 1.0,
      global_env_fit_edges_min: 0.25,
      global_env_fit_edges_max: 0.75,
      partnership_opportunities_max: 10,
      partnership_fitness_edges_min: 0.25,
      partnership_fitness_edges_max: 0.75,
      partnership_monogamy_edges_min: 0.25,
      partnership_monogamy_edges_max: 0.75,
      partnership_fitness_amplification: 0.0,
      partnership_monogamy_amplification: 0.0,
    }
  }
}
