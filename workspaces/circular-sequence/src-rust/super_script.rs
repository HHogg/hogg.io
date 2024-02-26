const SUPERSCRIPT_DIGITS: [char; 10] = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

pub fn get(n: usize) -> String {
  let mut n = n;
  let mut result = String::new();

  while n > 0 {
    result.push(SUPERSCRIPT_DIGITS[n % 10]);
    n /= 10;
  }

  result
}
