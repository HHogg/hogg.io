import { MoonIcon, SunIcon } from 'lucide-react';
import {
  TypeTheme,
  useThemeContext,
  Appear,
  Link,
  LinkProps,
  Box,
} from 'preshape';

type ThemeSwitcherProps = Omit<LinkProps, 'size'> & {
  size?: number;
  onChange?: (theme: TypeTheme) => void;
  theme?: TypeTheme;
};

export const ThemeSwitcher = (props: ThemeSwitcherProps) => {
  const {
    onChange: onChangeProps,
    size = 28,
    theme: themeProps,
    ...rest
  } = props;
  const {
    theme: themeContext,
    onChange: onChangeContext,
    themeOpposite,
  } = useThemeContext();
  const theme = themeProps || themeContext;
  const onChange = onChangeProps || onChangeContext;

  return (
    <Link
      {...rest}
      flex="horizontal"
      container
      onClick={() => onChange(themeOpposite)}
    >
      <Appear animation="Pop" visible={theme === 'night'}>
        <MoonIcon size={size} />
      </Appear>

      <Box absolute="center">
        <Appear animation="Pop" visible={theme === 'day'}>
          <SunIcon size={size} />
        </Appear>
      </Box>
    </Link>
  );
};
