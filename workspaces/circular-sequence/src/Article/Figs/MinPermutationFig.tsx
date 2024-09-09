import { ArticleFigCodeBlock } from '@hogg/common';
import { useWasmApi, WasmApiLoadingScreen } from '@hogg/wasm';
import { useEffect, useState } from 'react';
import { Sequence } from '../../types';

const SymmetricalSequence: Sequence = [4, 6, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0];
const AsymmetricalSequenceForwards: Sequence = [
  6, 12, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
const AsymmetricalSequenceBackwards: Sequence = [
  4, 12, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const useMinPermutation = (sequence: Sequence) => {
  const { api } = useWasmApi();
  const [minPermutation, setMinPermutation] = useState<number[]>([]);

  useEffect(() => {
    api.getSequenceMinPermutation([sequence]).then(setMinPermutation);
  }, [api, sequence]);

  return minPermutation;
};

function MinPermutationFig() {
  const symmetricalMinPermutation = useMinPermutation(SymmetricalSequence);
  const asymmetricalMinPermutationForwards = useMinPermutation(
    AsymmetricalSequenceForwards
  );
  const asymmetricalMinPermutationBackwards = useMinPermutation(
    AsymmetricalSequenceBackwards
  );

  return (
    <ArticleFigCodeBlock
      id="min-permutations"
      description="Outputs of the get_min_permutation function"
      language="rust"
    >
      {`
// Symmetrical sequence
get_min_permutation([${SymmetricalSequence}]),
// outputs >> [${symmetricalMinPermutation}]

// Asymmetrical sequence - forwards
get_min_permutation([6, 12, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0])
// outputs >> [${asymmetricalMinPermutationForwards}]

// Asymmetrical sequence - backwards
get_min_permutation([4, 12, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0])
// outputs >> [${asymmetricalMinPermutationBackwards}]
`}
    </ArticleFigCodeBlock>
  );
}

export default function MinPermutationFigWithLoadingScreen() {
  return (
    <WasmApiLoadingScreen>
      <MinPermutationFig />
    </WasmApiLoadingScreen>
  );
}
