import { PropsWithChildren, useState } from 'react';
import { ProjectWindowContext } from './useProjectWindowContext';

type ProjectWindowProviderProps = {
  height: number;
  width: number;
  tabsContentHeight: number;
};

export default function ProjectWindowProvider({
  children,
  height,
  tabsContentHeight,
  width,
}: PropsWithChildren<ProjectWindowProviderProps>) {
  const [activeTab, setActiveTab] = useState<null | string>(null);
  const [activeTabContentHeight, setActiveTabContentHeight] = useState(0);
  const [isTabContentVisible, setIsTabContentVisible] = useState(false);

  const selectTab = (name: string) => {
    if (activeTab === name) {
      setIsTabContentVisible((p) => !p);
      return;
    }

    setActiveTab(name);
    setIsTabContentVisible(true);
  };

  const hideTab = () => {
    setIsTabContentVisible(false);
    setActiveTab(null);
  };

  const value = {
    activeTab,
    activeTabContentHeight,
    height,
    isTabContentVisible,
    tabsContentHeight,
    width,
    hideTab,
    selectTab,
    setActiveTabContentHeight,
  };

  return (
    <ProjectWindowContext.Provider value={value}>
      {children}
    </ProjectWindowContext.Provider>
  );
}
