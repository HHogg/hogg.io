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

type WasmWorkerMessageEvent = {
  key: WasmApiKey;
  data: ReturnType<WasmApi[WasmApiKey]>;
};

type WasmWorkerMessagesStore = Record<string, WasmWorkerMessagesStoreEntry>;

type WasmWorkerMessagesStoreEntry = {
  key: WasmApiKey | '_init';
  initiated: number;
  reject?: (reason?: any) => void;
  resolve?: (value: any) => any;
};

export type WasmWorkerState = {
  errors: Partial<Record<WasmApiKey | '_init', string>>;
  loadings: Partial<Record<WasmApiKey | '_init', boolean>>;
  isLoading: boolean;
};

type WasmWorkerStateListener = (state: WasmWorkerState) => void;
type WasmWorkerEventListener = (event: WasmWorkerMessageEvent['data']) => void;

const messages: WasmWorkerMessagesStore = {
  _init: { key: '_init', initiated: Date.now() },
};

const errors: WasmWorkerState['errors'] = {};
const loadings: WasmWorkerState['loadings'] = { _init: true };
const eventListeners: Record<string, WasmWorkerEventListener[]> = {};
const stateChangeListeners: Record<string, WasmWorkerStateListener> = {};

export function isWorkerMessageResponse(
  message: WasmWorkerMessageResponse | WasmWorkerMessageEvent
): message is WasmWorkerMessageResponse {
  return 'result' in message;
}

function getMessage(
  response: WasmWorkerMessageResponse
): WasmWorkerMessagesStoreEntry {
  return messages[response.id] ?? messages[response.key];
}

export function getState(): WasmWorkerState {
  return { errors, loadings, isLoading: getIsLoading(loadings) };
}

function getIsLoading(loading: WasmWorkerState['loadings']): boolean {
  return Object.values(loading).every((l) => l);
}

function setError(key: WasmApiKey, error: string) {
  errors[key] = error;
}

function removeError(key: WasmApiKey) {
  delete errors[key];
}

function removeMessage(id: string) {
  delete messages[id];
}

function setLoading(key: WasmApiKey, value: boolean) {
  loadings[key] = value;
}

function notifyStateChangeListeners() {
  for (const id in stateChangeListeners) {
    stateChangeListeners[id](getState());
  }
}

export function addStateChangeListener(
  listener: (state: WasmWorkerState) => void
): () => void {
  const id = v4();
  stateChangeListeners[id] = listener;
  return () => delete stateChangeListeners[id];
}

export function addEventListener(
  key: string,
  listener: WasmWorkerEventListener
): () => void {
  const id = v4();

  if (!eventListeners[key]) {
    eventListeners[key] = [];
  }

  eventListeners[key].push(listener);

  return () => delete eventListeners[id];
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
  notifyStateChangeListeners();

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
  notifyStateChangeListeners();
}

export function handleMessageEvent(response: WasmWorkerMessageEvent) {
  const { key, data } = response;

  if (eventListeners[key]) {
    eventListeners[key].forEach((listener) => listener(data));
  }
}
