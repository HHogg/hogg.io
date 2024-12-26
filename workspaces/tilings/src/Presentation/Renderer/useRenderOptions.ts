import { DeepPartial } from '@hogg/common';
import { Options } from '@hogg/wasm';
import merge from 'lodash/merge';
import { useThemeContext } from 'preshape';
import { useMemo } from 'react';
import { getDefaultOptionsWithStyles } from './defaultOptions';

export default function useRenderOptions(
  optionsProps?: DeepPartial<Options>
): Options {
  const { colors: themeColors } = useThemeContext();

  const defaultOptions = useMemo<Options>(
    () => getDefaultOptionsWithStyles(themeColors),
    [themeColors]
  );

  const options = useMemo<Options>(
    () => merge({}, defaultOptions, optionsProps),
    [defaultOptions, optionsProps]
  );

  return options;
}
