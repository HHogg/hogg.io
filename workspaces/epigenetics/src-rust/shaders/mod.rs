// Vertex shader - renders a full-screen quad
// Loaded from separate .glsl file for IDE syntax highlighting
pub const VERTEX_SHADER: &str = include_str!("vertex.glsl");

// Compute fragment shader - performs GPU computation
// Loaded from separate .glsl file for IDE syntax highlighting
pub const COMPUTE_FRAGMENT_SHADER: &str = include_str!("compute_fragment.glsl");

// Render fragment shader - samples from compute texture
// Loaded from separate .glsl file for IDE syntax highlighting
pub const RENDER_FRAGMENT_SHADER: &str = include_str!("render_fragment.glsl");
