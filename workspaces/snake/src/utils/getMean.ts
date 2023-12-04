export default function getMean(ns: number[]) {
  return ns.length ? ns.reduce((acc, n) => acc + n, 0) / ns.length : 0;
}
