import { TypeTheme, useThemeContext } from 'preshape';
import { useEffect, useRef } from 'react';

const useEnforcedTheme = (theme: TypeTheme) => {
  const { onChange, theme: currentTheme } = useThemeContext();
  const refPreviousTheme = useRef(currentTheme);

  useEffect(() => {
    const previousTheme = refPreviousTheme.current;

    onChange(theme);

    return () => {
      onChange(previousTheme);
    };
  }, [onChange, theme]);
};

export default useEnforcedTheme;
