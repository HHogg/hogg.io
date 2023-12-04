import { motion } from 'framer-motion';
import { Appear, Text } from 'preshape';
import { PropsWithChildren } from 'react';

type Props = {
  isVisible: boolean;
  x: number;
  y: number;
};

const GraphLabel = (props: PropsWithChildren<Props>) => {
  const { children, isVisible, x, y } = props;

  return (
    <motion.g animate={{ x, y }} transition={{ ease: 'easeOut' }}>
      <motion.foreignObject
        className="Graph__label"
        height="24"
        pointerEvents="none"
        width="64"
      >
        <Appear animation="FadeSlideLeft" visible={isVisible}>
          <Text
            backgroundColor="text-shade-1"
            borderRadius="x2"
            data-bounding-element
            display="inline-block"
            paddingHorizontal="x1"
            paddingVertical="x0"
            size="x3"
            weight="x2"
            style={{
              pointerEvents: 'none',
            }}
            textColor="background-shade-1"
          >
            {children}
          </Text>
        </Appear>
      </motion.foreignObject>
    </motion.g>
  );
};

export default GraphLabel;
