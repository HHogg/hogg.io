import { createContext, useContext } from 'react';

type ProjectWindowContextProps = {
  activeTab: null | string;
  activeTabContentHeight: number;
  height: number;
  isTabContentVisible: boolean;
  tabsContentHeight: number;
  width: number;
  hideTab: () => void;
  selectTab: (tab: string) => void;
  setActiveTabContentHeight: (height: number) => void;
};

export const ProjectWindowContext = createContext<ProjectWindowContextProps>({
  activeTab: null,
  activeTabContentHeight: 0,
  height: 0,
  isTabContentVisible: false,
  tabsContentHeight: 0,
  width: 0,
  hideTab: () => {},
  selectTab: () => {},
  setActiveTabContentHeight: () => {},
});

export default function useProjectWindowContext() {
  return useContext(ProjectWindowContext);
}
