import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import {
  Appear,
  Box,
  Button,
  Motion,
  Text,
  TransitionBox,
  useResizeObserver,
} from 'preshape';
import { PropsWithChildren, useEffect, useState } from 'react';
import useProjectWindowContext from './useProjectWindowContext';

type ProjectTabProps = {
  Icon: LucideIcon;
  name: string;
};

export default function ProjectTab({
  Icon,
  children,
  name,
}: PropsWithChildren<ProjectTabProps>) {
  const {
    activeTab,
    isTabContentVisible,
    maxTabContentHeight,
    selectTab,
    setActiveTabContentHeight,
  } = useProjectWindowContext();
  const [isHovered, setIsHovered] = useState(false);
  const [contentSize, contentRef] = useResizeObserver<HTMLDivElement>();
  const isActive = activeTab === name;

  useEffect(() => {
    if (isActive) {
      setActiveTabContentHeight(contentSize.height);
    }
  }, [isActive, contentSize.height, setActiveTabContentHeight]);

  return (
    <Box>
      <Motion container layout="position" zIndex={2}>
        <Button
          backgroundColor="transparent"
          backgroundColorActive="transparent"
          backgroundColorHover="transparent"
          borderSize="x0"
          onClick={() => selectTab(name)}
          padding="x0"
          variant="secondary"
        >
          <TransitionBox
            alignChildren="middle"
            backgroundColor="background-shade-2"
            borderSize="x1"
            borderTop
            borderLeft
            borderRight
            borderColor="background-shade-4"
            clickable
            flex="horizontal"
            paddingVertical="x3"
            paddingLeft="x6"
            style={{
              borderRadius: 8,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          >
            <Box alignChildren="middle" flex="horizontal" gap="x2">
              <Icon size="1rem" />
              <Text weight="x3">{name}</Text>
            </Box>

            <Box paddingLeft="x3" paddingRight="x3">
              {((isActive && isTabContentVisible) ||
                (isHovered && !isTabContentVisible)) && (
                <Appear>
                  {isActive && isTabContentVisible ? (
                    <ChevronDown size="1rem" />
                  ) : (
                    <ChevronUp size="1rem" />
                  )}
                </Appear>
              )}
            </Box>
          </TransitionBox>
        </Button>
      </Motion>

      <Box
        backgroundColor="background-shade-2"
        borderColor="background-shade-4"
        borderSize="x1"
        borderTop
        style={{
          position: 'absolute',
          height: maxTabContentHeight,
          left: 0,
          right: 0,
          overflow: 'auto',
          zIndex: isActive ? 1 : 0,
        }}
      >
        <div ref={contentRef}>
          <Box padding="x6">{children}</Box>
        </div>
      </Box>
    </Box>
  );
}
