import { Point, Snake, Values } from './types';

interface MessageData {
  values: Values;
}

interface RunData {
  env: {
    point: Point;
    snake: Snake;
    xMax: number;
    yMax: number;
  };
  fn: string;
}

type ErrorHandler = (error: Error | ErrorEvent) => void;
type MessageHandler = (data: MessageData) => void;

const TIMEOUT = 1000;

export default class SolutionRunner {
  onError?: ErrorHandler;
  onMessage?: MessageHandler;
  timeout?: NodeJS.Timeout;
  worker: Worker;

  constructor() {
    this.worker = new Worker(
      new URL('./SolutionRunnerWorker', import.meta.url),
      {
        type: 'classic',
      }
    );

    this.worker.onerror = (error) => {
      this.reset();

      if (this.onError) {
        this.onError(error);
      }
    };

    this.worker.onmessage = ({ data }: { data: MessageData }) => {
      this.reset();

      if (this.onMessage) {
        this.onMessage(data);
      }
    };
  }

  run(args: RunData) {
    if (!this.timeout) {
      this.worker.postMessage(args);
      this.timeout = setTimeout(() => {
        const error = new Error('Timeout');
        error.message = `⏰ Your code exceeded the maximum ${TIMEOUT} ms run time.`;

        if (this.onError) {
          this.onError(error);
        }
      }, TIMEOUT);
    }
  }

  reset() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      delete this.timeout;
    }
  }

  destroy() {
    this.reset();
    this.worker.terminate();
  }
}
