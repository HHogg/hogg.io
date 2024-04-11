import { Ref, createContext, useContext } from 'react';

type ProjectWindowContextProps = {
  activeTab: null | string;
  activeTabContentHeight: number;
  fullScreenEnter: () => void;
  fullScreenExit: () => void;
  height: number;
  hideTab: () => void;
  isFullScreen: boolean;
  isTabContentVisible: boolean;
  maxTabContentHeight: number;
  refCanvas: Ref<HTMLDivElement>;
  refTabs: Ref<HTMLDivElement>;
  refWindow: Ref<HTMLDivElement>;
  selectTab: (tab: string) => void;
  setActiveTabContentHeight: (height: number) => void;
  width: number;
};

export const ProjectWindowContext = createContext<ProjectWindowContextProps>({
  activeTab: null,
  activeTabContentHeight: 0,
  fullScreenEnter: () => {},
  fullScreenExit: () => {},
  height: 0,
  hideTab: () => {},
  isFullScreen: false,
  isTabContentVisible: false,
  maxTabContentHeight: 0,
  refCanvas: { current: null },
  refTabs: { current: null },
  refWindow: { current: null },
  selectTab: () => {},
  setActiveTabContentHeight: () => {},
  width: 0,
});

export default function useProjectWindowContext() {
  return useContext(ProjectWindowContext);
}
