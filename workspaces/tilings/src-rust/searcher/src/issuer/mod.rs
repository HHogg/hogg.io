pub mod messages;

use std::collections::HashMap;
use std::sync::Arc;

use actix::prelude::*;
use anyhow::Result;
use tiling::notation::Path;
use tiling_datastore::state::State;
use tokio::sync::Mutex;

use crate::datastore::{errors, state, tilings, visits};

// This is useful to recover from any previous
// failed searches. Note that any paths here wont
// have the correct p_index.
const INITIAL_BUFFER: [&str; 0] = [];

#[derive(Debug)]
pub struct Issuer {
  // errors_store_addr: Addr<errors::Store>,
  state_store_addr: Addr<state::Store>,
  // tilings_store_addr: Addr<tilings::Store>,
  visits_store_addr: Addr<visits::Store>,

  state: Arc<Mutex<State>>,

  stop_issuing: Arc<Mutex<bool>>,
  buffer_tx: async_channel::Sender<Path>,
  buffer_rx: Box<async_channel::Receiver<Path>>,
  buffer_size: Arc<Mutex<usize>>,
  leases: Arc<Mutex<HashMap<Path, i32>>>,
}

impl Issuer {
  pub async fn with_addresses(
    _errors_store_addr: Addr<errors::Store>,
    state_store_addr: Addr<state::Store>,
    _tilings_store_addr: Addr<tilings::Store>,
    traversal_store_addr: Addr<visits::Store>,
  ) -> Result<Self> {
    let (buffer_tx, buffer_rx) = async_channel::unbounded();
    let state = state_store_addr.send(state::messages::Get).await??;

    tracing::info!(path = %state.path, "starting_from_path");

    Ok(Self {
      // errors_store_addr,
      state_store_addr,
      // tilings_store_addr,
      visits_store_addr: traversal_store_addr,

      state: Arc::new(Mutex::new(state)),

      stop_issuing: Arc::new(Mutex::new(false)),
      buffer_tx,
      buffer_rx: Box::new(buffer_rx),
      buffer_size: Arc::new(Mutex::new(0)),
      leases: Arc::new(Mutex::new(HashMap::default())),
    })
  }
}

impl Actor for Issuer {
  type Context = Context<Self>;

  fn started(&mut self, _ctx: &mut Self::Context) {
    let buffer_tx = self.buffer_tx.clone();
    let buffer_rx = self.buffer_rx.clone();
    let buffer_size = self.buffer_size.clone();
    let state = self.state.clone();
    let leases = self.leases.clone();
    let stop_issuing = self.stop_issuing.clone();

    actix::spawn(async move {
      // Load the initial buffer
      {
        let mut state = state.lock().await;
        let mut leases = leases.lock().await;

        for path_string in INITIAL_BUFFER {
          let path = Path::default().from_string(path_string, false).unwrap();

          state.path_index += 1;
          leases.insert(path.clone(), state.path_index);
          buffer_tx.try_send(path).ok();
        }
      }

      loop {
        if *stop_issuing.lock().await {
          break;
        }

        let buffer_size = *buffer_size.lock().await;

        if buffer_rx.len() < buffer_size {
          let mut state = state.lock().await;
          state.path.next_path();
          state.path_index += 1;
          leases
            .lock()
            .await
            .insert(state.path.clone(), state.path_index);
          buffer_tx.try_send(state.path.clone()).ok();
        }
      }
    });
  }
}
