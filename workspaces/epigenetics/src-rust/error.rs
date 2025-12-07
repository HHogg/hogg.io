use thiserror::Error;
use wasm_bindgen::JsValue;

#[derive(Debug, Error)]
pub enum SimulationError {
  #[error("WebGPU instance creation failed: {0}")]
  InstanceCreation(String),

  #[error("Failed to create surface: {0}")]
  SurfaceCreation(String),

  #[error("Failed to request adapter: {0}")]
  AdapterRequest(String),

  #[error("Failed to get device: {0}")]
  DeviceRequest(String),

  #[error("Failed to get surface texture: {0}")]
  SurfaceTexture(String),

  #[error("Attempted to create simulation program without a canvas")]
  MissingCanvas,

  #[error("Attempted to create simulation program without a data config")]
  MissingDataConfig,

  #[error("Attempted to create simulation program without dimensions")]
  MissingDimensions,

  #[error("Simulation program not found")]
  ProgramNotFound,

  #[error("Simulation loop is not running")]
  LoopNotRunning,

  #[error("Simulation loop has not been created")]
  LoopNotCreated,

  #[error("Simulation loop already exists")]
  LoopAlreadyExists,

  #[error("Failed to stop simulation loop: {0}")]
  LoopStopFailed(String),

  #[error("Failed to schedule animation frame: {0}")]
  AnimationFrameFailed(String),

  #[error("Failed to clear timeout: {0}")]
  ClearTimeoutFailed(String),

  #[error("Simulation step creation failed: {0}")]
  StepCreation(String),

  #[error("Simulation step execution failed: {0}")]
  StepExecution(String),

  #[error("Resize operation failed: {0}")]
  ResizeFailed(String),
}

impl From<SimulationError> for JsValue {
  fn from(err: SimulationError) -> Self {
    JsValue::from_str(&err.to_string())
  }
}
