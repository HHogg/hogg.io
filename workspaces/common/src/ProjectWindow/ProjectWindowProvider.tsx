import { useResizeObserver } from 'preshape';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import screenfull from 'screenfull';
import { ProjectWindowContext } from './useProjectWindowContext';

const MAX_TABS_REVEAL_PERCENTAGE = 0.8;

export default function ProjectWindowProvider({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<null | string>(null);
  const [activeTabContentHeight, setActiveTabContentHeight] = useState(0);
  const [isTabContentVisible, setIsTabContentVisible] = useState(false);
  const [isFullScreen, setIsFullscreen] = useState(false);
  const [sizeCanvas, refCanvas] = useResizeObserver<HTMLDivElement>();
  const [sizeTabs, refTabs] = useResizeObserver<HTMLDivElement>();
  const refWindow = useRef<HTMLDivElement>(null);

  const maxTabContentHeight =
    (sizeCanvas.height - sizeTabs.height) * MAX_TABS_REVEAL_PERCENTAGE;

  const selectTab = (name: string) => {
    if (activeTab === name) {
      setIsTabContentVisible((p) => !p);
      return;
    }

    setActiveTab(name);
    setIsTabContentVisible(true);
  };

  const fullScreenEnter = () => {
    setIsFullscreen(true);
  };

  const fullScreenExit = () => {
    setIsFullscreen(false);
  };

  const hideTab = () => {
    setIsTabContentVisible(false);
    setActiveTab(null);
  };

  useEffect(() => {
    if (screenfull.isEnabled && refWindow.current) {
      if (isFullScreen) {
        screenfull.request(refWindow.current);
      } else {
        screenfull.exit();
      }
    }
  }, [isFullScreen]);

  const value = {
    activeTab,
    activeTabContentHeight,
    fullScreenEnter,
    fullScreenExit,
    height: sizeCanvas.height,
    hideTab,
    isFullScreen,
    isTabContentVisible,
    maxTabContentHeight,
    refCanvas,
    refTabs,
    refWindow,
    selectTab,
    setActiveTabContentHeight,
    width: sizeCanvas.width,
  };

  return (
    <ProjectWindowContext.Provider value={value}>
      {children}
    </ProjectWindowContext.Provider>
  );
}
