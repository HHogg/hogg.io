use std::cell::RefCell;
use std::rc::Rc;
use web_sys::OffscreenCanvas;

use crate::sim;

thread_local! {
  pub static CANVAS: RefCell<Option<OffscreenCanvas>> = const { RefCell::new(None) };
  pub static DATA_CONFIG: RefCell<Option<sim::data::Config>> = const { RefCell::new(None) };
  pub static SIMULATION_WIDTH: RefCell<Option<u32>> = const { RefCell::new(None) };
  pub static SIMULATION_HEIGHT: RefCell<Option<u32>> = const { RefCell::new(None) };
  pub static SIMULATION_LOOP: RefCell<Option<Rc<RefCell<sim::Loop>>>> = const { RefCell::new(None) };
  pub static SIMULATION_PROGRAM: RefCell<Option<Rc<RefCell<sim::Program>>>> = const { RefCell::new(None) };
}

pub fn set_canvas(canvas: OffscreenCanvas) {
  CANVAS.with(|c| {
    *c.borrow_mut() = Some(canvas);
  });
}

pub fn get_canvas() -> Option<OffscreenCanvas> {
  CANVAS.with(|c| c.borrow().clone())
}

pub fn set_data_config(config: sim::data::Config) {
  DATA_CONFIG.with(|d| {
    *d.borrow_mut() = Some(config);
  });
}

pub fn get_data_config() -> Option<sim::data::Config> {
  DATA_CONFIG.with(|d| d.borrow().clone())
}

pub fn set_simulation_program(program_rc: Rc<RefCell<sim::Program>>) {
  SIMULATION_PROGRAM.with(|s| {
    *s.borrow_mut() = Some(program_rc);
  });
}

pub fn get_simulation_program() -> Option<Rc<RefCell<sim::Program>>> {
  SIMULATION_PROGRAM.with(|s| s.borrow().clone())
}

pub fn get_simulation_loop() -> Option<Rc<RefCell<sim::Loop>>> {
  SIMULATION_LOOP.with(|l| l.borrow().clone())
}

pub fn set_simulation_loop(loop_rc: Rc<RefCell<sim::Loop>>) {
  SIMULATION_LOOP.with(|l| {
    *l.borrow_mut() = Some(loop_rc);
  });
}

pub fn set_simulation_dimensions(width: u32, height: u32) {
  SIMULATION_WIDTH.with(|w| {
    *w.borrow_mut() = Some(width);
  });
  SIMULATION_HEIGHT.with(|h| {
    *h.borrow_mut() = Some(height);
  });
}

pub fn get_simulation_dimensions() -> Option<(u32, u32)> {
  SIMULATION_WIDTH.with(|w| {
    SIMULATION_HEIGHT.with(|h| {
      w.borrow()
        .and_then(|width| h.borrow().map(|height| (width, height)))
    })
  })
}
