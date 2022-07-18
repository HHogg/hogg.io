import { Antwerp, AntwerpProps } from '@hhogg/antwerp';
import { scaleLinear } from 'd3-scale';
import {
  Appear,
  Box,
  colorLightShade1,
  useIntersectionObserver,
  themes,
} from 'preshape';
import React, { useContext, useEffect, useState } from 'react';
import { RootContext } from '../../Root';

const AntwerpExample = ({
  animate,
  ...rest
}: AntwerpProps & { animate?: boolean }) => {
  const [isInView, ref] = useIntersectionObserver<HTMLElement>();
  const { theme } = useContext(RootContext);
  const [animateInterval, setAnimateInterval] = useState(0);
  const [isVisible, setIsVisible] = useState(isInView);
  const colorScale = scaleLinear<string>()
    .domain([0, 1])
    .range([colorLightShade1, themes[theme].colorAccentShade5]);

  useEffect(() => {
    if (isInView) {
      setIsVisible((isVisible) => isVisible || isInView);
    }

    if (animate) {
      setAnimateInterval(isInView ? 300 : 0);
    }
  }, [animate, isInView]);

  return (
    <Box grow ref={ref}>
      <Appear visible={isVisible}>
        <Antwerp
          {...rest}
          animateInterval={animateInterval}
          colorScale={colorScale}
          height="300px"
          width="100%"
        />
      </Appear>
    </Box>
  );
};

export default AntwerpExample;
