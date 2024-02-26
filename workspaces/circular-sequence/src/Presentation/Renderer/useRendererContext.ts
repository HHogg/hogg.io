import { createContext, useContext } from 'react';
import { Sequence } from '../WasmApi/useWasmApi';

export type RendererContextProps = {
  sequences: Sequence[];
};

export const RendererContext = createContext<RendererContextProps>({
  sequences: [],
});

export const useRendererContext = () => useContext(RendererContext);
