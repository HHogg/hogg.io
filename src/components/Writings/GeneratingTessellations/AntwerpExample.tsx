import * as React from 'react';
import { scaleLinear } from 'd3-scale';
import { Appear, Flex, colorLightShade1, useIntersectionObserver, themes } from 'preshape';
import { Antwerp, AntwerpProps } from '@hhogg/antwerp';
import { RootContext } from '../../Root';

export default ({ animate, ...rest }: AntwerpProps & { animate?: boolean }) => {
  const [isInView, ref] = useIntersectionObserver<HTMLElement>();
  const { theme } = React.useContext(RootContext);
  const [animateInterval, setAnimateInterval] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(isInView);
  const colorScale = scaleLinear<string>()
    .domain([0, 1])
    .range([colorLightShade1, themes[theme].colorAccentShade3]);

  React.useEffect(() => {
    if (isInView) {
      setIsVisible((isVisible) => isVisible || isInView);
    }

    if (animate) {
      setAnimateInterval(isInView ? 300 : 0);
    }
  }, [animate, isInView]);

  return (
    <Flex grow ref={ ref } >
      <Appear visible={ isVisible }>
        <Antwerp { ...rest }
            animateInterval={ animateInterval }
            colorScale={ colorScale }
            height="300px"
            width="100%" />
      </Appear>
    </Flex>
  );
};
