use std::cell::RefCell;
use std::rc::Rc;
use web_sys::OffscreenCanvas;

use crate::simulation_loop::SimulationLoop;
use crate::simulation_program::SimulationProgram;

thread_local! {
  pub static CANVAS: RefCell<Option<OffscreenCanvas>> = const { RefCell::new(None) };
  pub static SIMULATION_LOOP: RefCell<Option<Rc<RefCell<SimulationLoop>>>> = const { RefCell::new(None) };
  pub static SIMULATION_PROGRAM: RefCell<Option<Rc<RefCell<SimulationProgram>>>> = const { RefCell::new(None) };
}

pub fn set_canvas(canvas: OffscreenCanvas) {
  CANVAS.with(|c| {
    *c.borrow_mut() = Some(canvas);
  });
}

pub fn get_canvas() -> Option<OffscreenCanvas> {
  CANVAS.with(|c| c.borrow().clone())
}

pub fn set_simulation_program(program_rc: Rc<RefCell<SimulationProgram>>) {
  SIMULATION_PROGRAM.with(|s| {
    *s.borrow_mut() = Some(program_rc);
  });
}

pub fn get_simulation_program() -> Option<Rc<RefCell<SimulationProgram>>> {
  SIMULATION_PROGRAM.with(|s| s.borrow().clone())
}

pub fn get_simulation_loop() -> Option<Rc<RefCell<SimulationLoop>>> {
  SIMULATION_LOOP.with(|l| l.borrow().clone())
}

pub fn set_simulation_loop(loop_rc: Rc<RefCell<SimulationLoop>>) {
  SIMULATION_LOOP.with(|l| {
    *l.borrow_mut() = Some(loop_rc);
  });
}
