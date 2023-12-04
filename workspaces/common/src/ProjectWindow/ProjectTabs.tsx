import { Motion, useThemeContext } from 'preshape';
import { PropsWithChildren } from 'react';
import useProjectWindowContext from './useProjectWindowContext';

export default function ProjectTabs({ children }: PropsWithChildren<{}>) {
  const { theme } = useThemeContext();
  const { activeTabContentHeight, isTabContentVisible, tabsContentHeight } =
    useProjectWindowContext();

  return (
    <Motion
      flex="horizontal"
      gap="x2"
      paddingHorizontal="x2"
      initial={{
        transform: 'translateY(0)',
      }}
      animate={{
        transform: `translateY(${
          isTabContentVisible
            ? Math.min(activeTabContentHeight, tabsContentHeight) * -1
            : 0
        }px)`,
      }}
      style={{
        filter:
          theme === 'night'
            ? 'drop-shadow(0px 0px 60px black)'
            : 'drop-shadow(0px 0px 60px rgba(0, 0, 0, 0.05))',
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 30 }}
    >
      {children}
    </Motion>
  );
}
