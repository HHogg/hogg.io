import { Box, BoxProps } from 'preshape';
import { useProjectWindowContext } from '..';
import PatternBackground, { PatternBackgroundProps } from './PatternBackground';

export type ProjectWindowContentsProps = {
  backgroundPattern?: PatternBackgroundProps['pattern'];
  backgroundPatternGap?: PatternBackgroundProps['patternGap'];
  backgroundPatternSize?: PatternBackgroundProps['patternSize'];
  controls?: JSX.Element;
  header?: JSX.Element;
  tabs?: JSX.Element;
  shadow?: boolean;
};

export default function ProjectWindowContents({
  alignChildren,
  alignChildrenHorizontal,
  alignChildrenVertical,
  backgroundColor,
  backgroundPattern,
  backgroundPatternGap,
  backgroundPatternSize,
  children,
  controls,
  gap,
  gapHorizontal,
  gapVertical,
  header,
  onClick,
  padding = 'x6',
  paddingBottom,
  paddingHorizontal,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingVertical,
  shadow,
  tabs,
  theme,
  ...rest
}: Omit<BoxProps, 'controls'> & ProjectWindowContentsProps) {
  const { height, isFullScreen, refCanvas, refTabs, refWindow, width } =
    useProjectWindowContext();

  return (
    <Box
      {...rest}
      backgroundColor="background-shade-2"
      basis="0"
      borderSize="x1"
      borderColor="background-shade-4"
      borderRadius={isFullScreen ? undefined : 'x3'}
      flex="vertical"
      grow
      onClick={onClick}
      overflow="hidden"
      style={{ userSelect: 'none' }}
      ref={refWindow}
      theme={theme}
    >
      {header && (
        <Box borderBottom borderColor="background-shade-4">
          {header}
        </Box>
      )}

      <Box container flex="vertical" grow ref={refCanvas} overflow="hidden">
        <PatternBackground
          backgroundColor={backgroundColor}
          flex="vertical"
          grow
          pattern={backgroundPattern}
          patternGap={backgroundPatternGap}
          patternSize={backgroundPatternSize}
        >
          <Box
            flex="vertical"
            grow
            style={{
              filter: shadow
                ? `drop-shadow(5px 5px ${
                    Math.max(width, height) / 7
                  }px rgba(20, 0, 20, ${
                    theme === 'night' ? 0.8 : 0.2
                  })) drop-shadow(1px 3px ${2}px rgba(20, 0, 20, ${
                    theme === 'night' ? 0.8 : 0.4
                  }))`
                : undefined,
            }}
            alignChildren={alignChildren}
            alignChildrenHorizontal={alignChildrenHorizontal}
            alignChildrenVertical={alignChildrenVertical}
            padding={padding}
            paddingBottom={paddingBottom}
            paddingHorizontal={paddingHorizontal}
            paddingLeft={paddingLeft}
            paddingRight={paddingRight}
            paddingTop={paddingTop}
            paddingVertical={paddingVertical}
            gap={gap}
            gapHorizontal={gapHorizontal}
            gapVertical={gapVertical}
          >
            {children}
          </Box>

          <Box absolute="bottom" ref={refTabs} width="100%">
            {tabs}
          </Box>
        </PatternBackground>
      </Box>

      {controls && (
        <Box borderTop borderColor="background-shade-4">
          {controls}
        </Box>
      )}
    </Box>
  );
}
