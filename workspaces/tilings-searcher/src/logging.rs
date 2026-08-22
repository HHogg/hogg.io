use tracing::Level;
use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::fmt::format;

pub fn setup(max_level: Level, log_to_file: bool) -> Option<WorkerGuard> {
  let event_format = format()
    .with_ansi(false)
    .with_file(false)
    .with_level(true)
    .with_line_number(false)
    .with_source_location(false)
    .with_target(false)
    .with_thread_ids(false)
    .with_thread_names(false);

  if log_to_file {
    let file_appender = tracing_appender::rolling::hourly("logs", "output.log");
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

    tracing_subscriber::fmt()
      .event_format(event_format)
      .with_max_level(max_level)
      .with_writer(non_blocking)
      .init();

    tracing::info!(%max_level, "log_level");

    return Some(_guard);
  }

  tracing_subscriber::fmt()
    .event_format(event_format)
    .with_max_level(max_level)
    .with_writer(std::io::stdout)
    .init();

  tracing::info!(%max_level, "log_level");

  None
}
