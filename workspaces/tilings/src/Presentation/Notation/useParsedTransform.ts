import { Transform, useWasmApi } from '@hogg/wasm';
import { useEffect, useState } from 'react';
import { useNotationContext } from '../Notation/useNotationContext';

export default function useParsedTransform(transformString: string) {
  const { api } = useWasmApi();
  const { path } = useNotationContext();
  const [transform, setTransform] = useState<Transform | null>(null);

  useEffect(() => {
    api.tilings.parseTransform([transformString, path]).then(setTransform);
  }, [api, path, transformString]);

  return transform;
}
