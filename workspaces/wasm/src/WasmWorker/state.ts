import { v4 } from 'uuid';
import { WasmApi, WasmApiKey } from './WasmWorker';

export type WasmWorkerMessageRequest = {
  id: string;
  key: WasmApiKey;
  args: any[];
};

export type WasmWorkerMessageResponse = {
  id: string;
  key: WasmApiKey;
  result: ReturnType<WasmApi[WasmApiKey]>;
  error?: string;
};

export type WasmWorkerMessagesStore = Record<
  string,
  WasmWorkerMessagesStoreEntry
>;

export type WasmWorkerMessagesStoreEntry = {
  key: WasmApiKey | '_init';
  initiated: number;
  reject?: (reason?: any) => void;
  resolve?: (value: any) => any;
};

export type WasmWorkerState = {
  errors: Partial<Record<WasmApiKey | '_init', string>>;
  loading: Partial<Record<WasmApiKey | '_init', boolean>>;
};

export type WasmWorkerStateListener = (state: WasmWorkerState) => void;

const messages: WasmWorkerMessagesStore = {
  _init: { key: '_init', initiated: Date.now() },
};

const errors: WasmWorkerState['errors'] = {};
const loading: WasmWorkerState['loading'] = { _init: true };
const listeners: Record<string, WasmWorkerStateListener> = {};

export function getMessage(
  response: WasmWorkerMessageResponse
): WasmWorkerMessagesStoreEntry {
  return messages[response.id] ?? messages[response.key];
}

export function getState(): WasmWorkerState {
  return { errors, loading };
}

export function setError(key: WasmApiKey, error: string) {
  errors[key] = error;
}

export function removeError(key: WasmApiKey) {
  delete errors[key];
}

function removeMessage(id: string) {
  delete messages[id];
}

export function setLoading(key: WasmApiKey, value: boolean) {
  loading[key] = value;
  notifyListeners();
}

function notifyListeners() {
  for (const id in listeners) {
    listeners[id](getState());
  }
}

export function onStateChange(
  listener: (state: WasmWorkerState) => void
): () => void {
  const id = v4();
  listeners[id] = listener;
  return () => delete listeners[id];
}

export function createRequest(
  key: WasmApiKey,
  args: any,
  resolve: (value: string | PromiseLike<string>) => void,
  reject: (reason?: any) => void
): WasmWorkerMessageRequest {
  const id = `${Date.now()}-${Math.random()}`;

  messages[id] = {
    key,
    initiated: Date.now(),
    reject,
    resolve,
  };

  setLoading(key, true);

  return { id, key, args };
}

export function handleMessageResponse(response: WasmWorkerMessageResponse) {
  const message = getMessage(response);

  if (!message) {
    console.warn('WasmWorker request not found', response);
    return;
  }

  if (response.error) {
    if (message.reject) {
      message.reject(response.error);
    }

    setError(response.key, response.error);
  } else {
    if (message.resolve) {
      message.resolve(response.result);
    }

    removeError(response.key);
  }

  setLoading(response.key, false);
  removeMessage(response.id);
}
