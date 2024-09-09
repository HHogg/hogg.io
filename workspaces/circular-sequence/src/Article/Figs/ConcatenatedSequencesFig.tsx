import { ArticleFig } from '@hogg/common';
import { WasmApiLoadingScreen } from '@hogg/wasm';
import { Sequence } from '../../types';
import SequenceView from '../SequenceView/SequenceView';

type Props = {};

const symmetricSequence: Sequence = [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0];
const asymmetricSequence: Sequence = [3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0];

export default function ConcatenatedSequencesFig({}: Props) {
  return (
    <ArticleFig
      id="concatenated-sequence"
      description="Concatenated symmetrical and asymmetrical sequences"
      flex="vertical"
      gap="x12"
    >
      <WasmApiLoadingScreen>
        <SequenceView sequence={symmetricSequence} />
        <SequenceView sequence={asymmetricSequence} />
      </WasmApiLoadingScreen>
    </ArticleFig>
  );
}
