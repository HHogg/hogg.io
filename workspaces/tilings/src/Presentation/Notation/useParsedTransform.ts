import { useWasmApi } from '@hogg/wasm';
import { useEffect, useState } from 'react';
import { Transform } from '../../types';
import { useNotationContext } from '../Notation/useNotationContext';

export default function useParsedTransform(transformString: string) {
  const { api } = useWasmApi();
  const { path } = useNotationContext();
  const [transform, setTransform] = useState<Transform | null>(null);

  useEffect(() => {
    api.parseTransform([transformString, path]).then(setTransform);
  }, [api, path, transformString]);

  return transform;
}
