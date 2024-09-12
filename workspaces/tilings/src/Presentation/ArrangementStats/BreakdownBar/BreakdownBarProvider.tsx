import { createContext, useContext } from 'react';

type BreakdownBarContextType = {};

export const BreakdownBarContext = createContext<BreakdownBarContextType>({});

export function useBreakdownBarContext() {
  return useContext(BreakdownBarContext);
}

export default function BreakdownBarProvider() {
  return null;
}
