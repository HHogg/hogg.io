use web_sys::{Window, WorkerGlobalScope};

pub enum GlobalProxy {
  Window(Window),
  WorkerGlobalScope(WorkerGlobalScope),
}

impl GlobalProxy {
  // fn create_image_bitmap_with_image_data(
  //   &self,
  //   a_image: &ImageData,
  // ) -> Result<js_sys::Promise, JsValue> {
  //   match self {
  //     GlobalProxy::Window(window) => window.create_image_bitmap_with_image_data(a_image),
  //     GlobalProxy::WorkerGlobalScope(scope) => scope.create_image_bitmap_with_image_data(a_image),
  //     //... more of that
  //   }
  // }
}

// fn self_() -> Result<GlobalProxy, JsValue> {
//   let global = js_sys::global();
//   // how to properly detect this in wasm_bindgen?
//   if js_sys::eval("typeof WorkerGlobalScope !== 'undefined'")?.as_bool().unwrap() {
//       Ok(global.dyn_into::<WorkerGlobalScope>().map(GlobalProxy::WorkerGlobalScope)?)
//   }
//   else {
//       Ok(global.dyn_into::<Window>().map(GlobalProxy::Window)?)
//   }
// }
