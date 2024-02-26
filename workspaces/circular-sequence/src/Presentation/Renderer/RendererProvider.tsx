import { PropsWithChildren, useState } from 'react';
import { Sequence } from '../WasmApi/useWasmApi';
import { RendererContext } from './useRendererContext';

type Props = {
  sequences?: Sequence[];
};

export default function RendererProvider({
  sequences: sequencesProps = [],
  ...props
}: PropsWithChildren<Props>) {
  const [sequences, setSequences] = useState(sequencesProps);

  return <RendererContext.Provider value={{ sequences }} {...props} />;
}
