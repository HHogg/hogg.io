import { DeepPartial } from '@hogg/common';
import { Options } from '@hogg/wasm';
import merge from 'lodash/merge';
import { useThemeContext } from 'preshape';
import { useMemo } from 'react';
import { getDefaultOptionsWithStyles } from './defaultOptions';

export default function useRenderOptions(
  optionsPropsA?: DeepPartial<Options>,
  optionsPropsB?: DeepPartial<Options>
): Options {
  const { colors: themeColors } = useThemeContext();

  const defaultOptions = useMemo<Options>(
    () => getDefaultOptionsWithStyles(themeColors),
    [themeColors]
  );

  const options = useMemo<Options>(
    () => merge({}, defaultOptions, optionsPropsA, optionsPropsB),
    [defaultOptions, optionsPropsA, optionsPropsB]
  );

  return options;
}
