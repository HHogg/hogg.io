import { PropertyAtPath } from '@hogg/common';
import { v4 } from 'uuid';
import { WasmWorkerEvent } from '../types';
import { WasmApi, WasmApiKey } from './WasmWorker';

export type WasmWorkerMessageRequest = {
  id: string;
  key: WasmApiKey;
  args: any[];
};

export type WasmWorkerMessageResponse = {
  id: string;
  key: WasmApiKey;
  result: PropertyAtPath<WasmApi, WasmApiKey> | null;
  error?: string;
};

export type WasmWorkerEventName = WasmWorkerEvent['name'] | '__all';

export type WasmWorkerEventByName<TName extends WasmWorkerEventName> = Extract<
  WasmWorkerEvent,
  { name: TName }
>;

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
type WasmWorkerEventListener<TEventName extends WasmWorkerEventName> = (
  event: WasmWorkerEventByName<TEventName>
) => void;

const messages: WasmWorkerMessagesStore = {
  _init: { key: '_init', initiated: Date.now() },
};

const errors: WasmWorkerState['errors'] = {};
const loadings: WasmWorkerState['loadings'] = { _init: true };
const eventListeners: Record<string, WasmWorkerEventListener<any>[]> = {};
const stateChangeListeners: Record<string, WasmWorkerStateListener> = {};

export function isWorkerMessageResponse(
  message: WasmWorkerMessageResponse | WasmWorkerEvent
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
  listener: WasmWorkerEventListener<'__all'>
): () => void;
export function addEventListener<TName extends WasmWorkerEventName>(
  key: TName,
  listener: WasmWorkerEventListener<TName>
): () => void;
export function addEventListener<TName extends WasmWorkerEventName>(
  arg1: WasmWorkerEventListener<TName> | TName,
  arg2?: WasmWorkerEventListener<TName>
): () => void {
  const key = typeof arg1 === 'string' ? arg1 : '__all';
  const listener = typeof arg1 === 'function' ? arg1 : arg2;

  if (!listener) {
    throw new Error('Invalid arguments');
  }

  if (!eventListeners[key]) {
    eventListeners[key] = [];
  }

  eventListeners[key].push(listener);

  return () => {
    eventListeners[key] = eventListeners[key].filter((l) => l !== listener);
  };
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

export function handleMessageEvent(event: WasmWorkerEvent) {
  eventListeners['__all']?.forEach((listener) => listener(event));
  eventListeners[event.name]?.forEach((listener) => listener(event));
}

export function wasmWorkerMessageResponseToString(
  response: WasmWorkerMessageResponse
): string {
  if (response.error) {
    return `[${response.key}] -> ${response.error}`;
  }

  if (response.result) {
    return `[${response.key}] -> ${JSON.stringify(response.result)}`;
  }

  return `[${response.key}]`;
}

export function wasmWorkerMessageRequestToString(
  request: WasmWorkerMessageRequest
): string {
  return request.key;
}
