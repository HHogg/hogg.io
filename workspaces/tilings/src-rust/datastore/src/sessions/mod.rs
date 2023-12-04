mod close;
mod get_all;
mod insert;

use std::net::{IpAddr, Ipv4Addr};

use local_ip_address::local_ip;
use serde::{Deserialize, Serialize};
use sqlx::types::chrono::{NaiveDateTime, Utc};
use sqlx::FromRow;
use sysinfo::{CpuExt, System, SystemExt};
use typeshare::typeshare;

pub use self::close::close;
pub use self::get_all::get_all;
pub use self::insert::insert;

#[derive(Clone, Default, FromRow, Serialize)]
#[serde(rename = "Session", rename_all = "camelCase")]
#[typeshare]
pub struct Session {
  pub id: String,
  pub worker_count: i32,
  pub sys_info: SysInfo,
  #[typeshare(serialized_as = "string")]
  pub timestamp_start: NaiveDateTime,
  #[typeshare(serialized_as = "Option<string>")]
  pub timestamp_stop: Option<NaiveDateTime>,
}

impl Session {
  pub fn with_id(self, id: String) -> Self {
    Self {
      id,
      timestamp_start: Utc::now().naive_utc(),
      ..self
    }
  }

  pub fn with_worker_count(self, worker_count: usize) -> Self {
    Self {
      worker_count: worker_count as i32,
      ..self
    }
  }

  pub fn with_sys_info(self, sys_info: SysInfo) -> Self {
    Self { sys_info, ..self }
  }
}

#[derive(Clone, Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "sys_info")]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct SysInfo {
  pub hostname: String,
  pub ip_address: String,
  pub os: String,
  pub os_version: String,
  pub cpu: String,
}

impl Default for SysInfo {
  fn default() -> Self {
    let system = System::new_all();
    let cpu = system
      .cpus()
      .iter()
      .fold(std::collections::HashMap::new(), |mut map, cpu| {
        *map.entry(cpu.brand()).or_insert(0) += 1;
        map
      })
      .into_iter()
      .map(|(cpu, count)| format!("{cpu} (x{count})"))
      .collect::<Vec<_>>()
      .join(", ");

    let lan_ip_address = local_ip()
      .ok()
      .unwrap_or(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)));

    SysInfo {
      hostname: system.host_name().unwrap_or_default(),
      ip_address: lan_ip_address.to_string(),
      os: system.distribution_id(),
      os_version: system.os_version().unwrap_or_default(),
      cpu,
    }
  }
}
