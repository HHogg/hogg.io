import { TypeTheme } from "preshape";
import { useEffect, useRef } from "react";
import { useLayoutContext } from "../components/Root";

const useEnforcedTheme = (theme: TypeTheme) => {
  const { onChangeTheme, theme: currentTheme, } = useLayoutContext();
  const refPreviousTheme = useRef(currentTheme);

  useEffect(() => {
    onChangeTheme(theme);

    return () => {
      onChangeTheme(refPreviousTheme.current);
    };
  }, []);
};

export default useEnforcedTheme;
