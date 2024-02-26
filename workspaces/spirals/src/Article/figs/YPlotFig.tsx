import { ArticleFig, ArticleFigProps, ArticleFigs } from '@hogg/common';
import { CodeBlock } from 'preshape';
import { useCallback, useRef } from 'react';
import { PointAlgorithm, useSpiralsContext } from '../../Presentation';
import YPlot, { YPlotProps } from './YPlot';

type Props = {
  dashed?: boolean;
  dashedGap?: number;
  flip?: boolean;
  pointCount?: number;
  rotate?: boolean;
  r: (t: number, x: number) => number;
  t?: (r: number, x: number) => number;
  withChart?: boolean;
  withCode?: boolean;
  withCodeXY?: boolean;
  onNumberChange?: ArticleFigProps['onNumberChange'];
};

const ArticleFigYPlot = ({
  dashed,
  dashedGap,
  flip,
  rotate = false,
  r,
  t = (r) => r,
  withChart,
  withCode,
  withCodeXY,
  onNumberChange,
}: Props) => {
  const { setPointAlgorithm, setRotate } = useSpiralsContext();

  const tString = t.toString().split('=>')[1];
  const rString = r.toString().split('=>')[1];

  const refR = useRef(r);
  const refT = useRef(t);

  const equations: YPlotProps['equations'] = flip
    ? [
        [`t = ${tString}`, (x) => t(x, x)],
        [`r = ${rString}`, (x) => r(t(x, x), x)],
      ]
    : [
        [`r = ${rString}`, (x) => r(x, x)],
        [`t = ${tString}`, (x) => t(r(x, x), x)],
      ];

  const pointAlgorithm: PointAlgorithm = useCallback(
    (i: number) => {
      const r = refR.current;
      const t = refT.current;

      const [rValue, tValue] = flip
        ? [r(t(i, i), i), t(i, i)]
        : [r(i, i), t(r(i, i), i)];

      const x = rValue * Math.cos(tValue);
      const y = rValue * Math.sin(tValue);

      return [x, y];
    },
    [flip]
  );

  const handleSetAlgorithm = useCallback(() => {
    setRotate(rotate);
    setPointAlgorithm(pointAlgorithm);
  }, [pointAlgorithm, rotate, setPointAlgorithm, setRotate]);

  let codeBlockString = flip
    ? `
const t = ${tString};
const r = ${rString};`
    : `
const r = ${rString};
const t = ${tString};`;

  if (withCodeXY) {
    codeBlockString += `


/** This will be the same for all code snippets going
 * forward, so it will be omitted going forward.
 */
const x = r * Math.cos(t);
const y = r * Math.sin(t);`;
  }

  const visualItems = [];
  const mathItems = [`r = ${rString}`, `t = ${tString}`];

  if (withChart) visualItems.push('chart');
  if (withCode) visualItems.push('code');

  const figDescription = `Shows ${visualItems.join(
    ' and '
  )} for the equation ${mathItems.join(' and ')}.`;

  return (
    <ArticleFigs theme="night">
      <ArticleFig
        description={figDescription}
        padding="x0"
        onEnter={handleSetAlgorithm}
        onNumberChange={onNumberChange}
        maxWidth="100%"
      >
        {withChart && (
          <YPlot dashed={dashed} dashedGap={dashedGap} equations={equations} />
        )}

        {withCode && (
          <CodeBlock
            language="typescript"
            size="x3"
            overflow="auto"
            padding="x6"
          >
            {codeBlockString}
          </CodeBlock>
        )}
      </ArticleFig>
    </ArticleFigs>
  );
};

export default ArticleFigYPlot;
