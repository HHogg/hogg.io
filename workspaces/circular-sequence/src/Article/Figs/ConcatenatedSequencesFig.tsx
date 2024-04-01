import { ArticleFig } from '@hogg/common';
import SequenceView from '../SequenceView/SequenceView';
import WasmApi from '../WasmApi/WasmApi';
import { Sequence } from '../WasmApi/useWasmApi';

type Props = {};

const symmetricSequence: Sequence = [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0];
const asymmetricSequence: Sequence = [3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0];

const ConcatenatedSequencesFig = ({}: Props) => {
  return (
    <ArticleFig
      id="concatenated-sequence"
      description="Concatenated symmetrical and asymmetrical sequences"
      flex="vertical"
      gap="x12"
    >
      <SequenceView sequence={symmetricSequence} />
      <SequenceView sequence={asymmetricSequence} />
    </ArticleFig>
  );
};

const ConcatenatedSequencesFigWithWasmApi = () => (
  <WasmApi>
    <ConcatenatedSequencesFig />
  </WasmApi>
);

export default ConcatenatedSequencesFigWithWasmApi;
