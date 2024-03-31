import {
  Appear,
  Box,
  BoxProps,
  ThemeProvider,
  useResizeObserver,
} from 'preshape';
import ProjectBackground, { ProjectBackgroundProps } from './ProjectBackground';
import ProjectWindowProvider from './ProjectWindowProvider';

type Props = {
  backgroundPattern?: ProjectBackgroundProps['pattern'];
  backgroundPatternGap?: ProjectBackgroundProps['patternGap'];
  backgroundPatternSize?: ProjectBackgroundProps['patternSize'];
  controls?: JSX.Element;
  controlsVisible?: boolean;
  controlsPosition?: 'top' | 'bottom';
  tabs?: JSX.Element;
  tabsRevealPercentage?: number;
  shadow?: boolean;
};

export default function ProjectWindow({
  alignChildren,
  alignChildrenHorizontal,
  alignChildrenVertical,
  backgroundColor,
  backgroundPattern,
  backgroundPatternGap,
  backgroundPatternSize,
  children,
  controls,
  controlsVisible,
  controlsPosition = 'bottom',
  gap,
  gapHorizontal,
  gapVertical,
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
  tabsRevealPercentage = 0.75,
  theme,
  ...rest
}: Omit<BoxProps, 'controls'> & Props) {
  const [sizeWindow, refWindow] = useResizeObserver<HTMLDivElement>();
  const [sizeTabs, refTabs] = useResizeObserver<HTMLDivElement>();

  const tabsContentHeight =
    (sizeWindow.height - sizeTabs.height) * tabsRevealPercentage;

  return (
    <ProjectWindowProvider
      height={sizeWindow.height}
      width={sizeWindow.width}
      tabsContentHeight={tabsContentHeight}
    >
      <ThemeProvider theme={theme}>
        <Box
          {...rest}
          backgroundColor="background-shade-2"
          basis="0"
          borderSize="x1"
          borderColor="background-shade-4"
          borderRadius="x3"
          flex="vertical"
          grow
          onClick={onClick}
          theme={theme}
        >
          {controls && controlsPosition === 'top' && (
            <Appear
              animation="Expand"
              borderBottom
              borderColor="background-shade-4"
              visible={controlsVisible}
            >
              {controls}
            </Appear>
          )}

          <Box
            borderRadius="x3"
            container
            flex="vertical"
            grow
            ref={refWindow}
            overflow="hidden"
          >
            <ProjectBackground
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
                        Math.max(sizeWindow.width, sizeWindow.height) / 7
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
            </ProjectBackground>
          </Box>

          {controls && controlsPosition === 'bottom' && (
            <Appear
              animation="Expand"
              borderTop
              borderColor="background-shade-4"
              visible={controlsVisible}
            >
              {controls}
            </Appear>
          )}
        </Box>
      </ThemeProvider>
    </ProjectWindowProvider>
  );
}
