const MAX_TRACK = -50;

export default class History {
  constructor({ onChange }) {
    this.history = [];
    this.onChange = onChange;
  }

  commit() {
    this.history = [];
    this.onChange(this.history);
  }

  push(action, ...args) {
    this.history.push([action, args]);

    if (this.history.length > MAX_TRACK) {
      this.history = this.history.slice(MAX_TRACK);
    }

    this.onChange(this.history);
  }

  pop() {
    const [action, args] = this.history.pop();

    this.onChange(this.history);

    return {
      addShape: ['removeShape', args],
      removeShape: ['addShape', args],
      setShapeProps: ['setShapeProps', args],
      setIntersectionProps: ['setIntersectionProps', args],
    }[action];
  }
}
