use crate::{sort, super_script, Sequence};

#[path = "./to_string_tests.rs"]
#[cfg(test)]
mod tests;

/// Converts sequences to a string.
pub fn to_string(sequences: Vec<Sequence>) -> String {
  flatten_duplicates(
    sort(sequences).iter().copied().map(to_string_one).collect(),
    Some(("(", ")")),
  )
  .join("; ")
}

/// Converts a sequence to a string.
pub fn to_string_one(sequence: Sequence) -> String {
  flatten_duplicates(
    sequence
      .iter()
      .map(|&x| x.to_string())
      .collect::<Vec<String>>(),
    None,
  )
  .join(".")
}

/// Flattens duplicates in a sequence.
fn flatten_duplicates(content: Vec<String>, wrapper: Option<(&str, &str)>) -> Vec<String> {
  let (prefix, suffix) = wrapper.unwrap_or(("", ""));
  let mut flattened_content: Vec<String> = Vec::new();
  let mut index = 0;
  let mut count = 1;

  if content.is_empty() {
    return vec![];
  }

  loop {
    let current = &content[index];
    let next = content.get(index + 1);

    if next.is_none() || Some(current) != next {
      if count > 1 {
        flattened_content.push(format!(
          "{prefix}{current}{suffix}{}",
          super_script::get(count)
        ));
      } else {
        flattened_content.push(current.to_string());
      }

      count = 1;
    } else {
      count += 1;
    }

    index += 1;

    if next.is_none() || next == Some(&"0".to_string()) {
      break;
    }
  }

  flattened_content
}
