import { WasmApiLoadingScreen } from '@hogg/wasm';
import { Box } from 'preshape';
import { useEffect, useState } from 'react';
import Library from './Presentation/Library/Library';
import NotationProvider from './Presentation/Notation/NotationProvider';
import { useNotationContext } from './Presentation/Notation/useNotationContext';

export default function TilingLibraryPage() {
  const [notation, setNotation] = useState('');

  return (
    <WasmApiLoadingScreen>
      <NotationProvider notation={notation} onChange={setNotation}>
        <TilingLibraryPageContent />
      </NotationProvider>
    </WasmApiLoadingScreen>
  );
}

function TilingLibraryPageContent() {
  const { notation } = useNotationContext();

  useEffect(() => {
    console.log(notation);
  }, [notation]);

  return (
    <Box padding="x6">
      <Library size="240px" />
    </Box>
  );
}
