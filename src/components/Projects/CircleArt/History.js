const MAX_TRACK = 100;

export default class History {
  constructor({ onChange }) {
    this.history = [];
    this.future = [];
    this.onChange = onChange;
  }

  handleOnChange() {
    this.onChange({
      future: this.future,
      history: this.history,
    });
  }

  commit() {
    this.history = [];
    this.future = [];

    this.handleOnChange();
  }

  push(actions) {
    this.future = [];
    this.history.push(actions);

    if (this.history.length > MAX_TRACK) {
      this.history = this.history.slice(MAX_TRACK * -1);
    }

    this.handleOnChange();
  }

  pop() {
    const actions = this.history.pop();

    this.future.push(actions);
    this.handleOnChange();

    return [actions[2], actions[3]];
  }

  replay() {
    const actions = this.future.pop();

    this.history.push(actions);
    this.handleOnChange();

    return [actions[0], actions[1]];
  }
}
