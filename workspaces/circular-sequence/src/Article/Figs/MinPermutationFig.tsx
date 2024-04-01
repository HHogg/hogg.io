import { ArticleFigCodeBlock } from '@hogg/common';
import WasmApi from '../WasmApi/WasmApi';
import useWasmApi from '../WasmApi/useWasmApi';

const MinPermutationFig = () => {
  const wasmApi = useWasmApi();

  return (
    <ArticleFigCodeBlock
      id="min-permutations"
      description="Outputs of the get_min_permutation function"
      language="rust"
    >
      {`
// Symmetrical sequence
get_min_permutation([4, 6, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0]),
// outputs >> [${wasmApi.getMinPermutation([
        4, 6, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0,
      ])}]

// Asymmetrical sequence - forwards
get_min_permutation([6, 12, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0])
// outputs >> [${wasmApi.getMinPermutation([
        6, 12, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ])}]

// Asymmetrical sequence - backwards
get_min_permutation([4, 12, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0])
// outputs >> [${wasmApi.getMinPermutation([
        4, 12, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ])}]
`}
    </ArticleFigCodeBlock>
  );
};

const MinPermutationFigWithWasmApi = () => (
  <WasmApi>
    <MinPermutationFig />
  </WasmApi>
);

export default MinPermutationFigWithWasmApi;
