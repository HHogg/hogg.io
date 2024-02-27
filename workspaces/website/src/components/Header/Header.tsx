import { Lines } from '@hogg/common';
import { GithubIcon, LinkedinIcon } from 'lucide-react';
import { Box, BoxProps, Link, useMatchMedia } from 'preshape';
import { PropsWithChildren } from 'react';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import Ascii from './Ascii';

export default function Header({
  children,
  ...rest
}: PropsWithChildren<BoxProps>) {
  const match = useMatchMedia(['600px']);
  const isSmall = !match('600px');

  return (
    <Box {...rest} flex="horizontal" gap="x8">
      <Box flex="vertical">{children}</Box>

      <Box
        borderRadius="x2"
        container
        flex="vertical"
        gap="x2"
        grow
        overflow="hidden"
      >
        <Ascii />

        <Box alignChildrenVertical="middle" flex="horizontal">
          <Box grow>
            <Lines count={4} />
          </Box>

          <Box
            flex="horizontal"
            gap={isSmall ? 'x4' : 'x8'}
            paddingHorizontal={isSmall ? 'x2' : 'x8'}
          >
            <Box backgroundColor="background-shade-1" style={{ padding: 2 }}>
              <Link href="https://github.com/HHogg" target="Github">
                <GithubIcon size={28} />
              </Link>
            </Box>

            <Box backgroundColor="background-shade-1" style={{ padding: 2 }}>
              <Link
                href="https://linkedin.com/in/harrison-hogg"
                target="LinkedIn"
              >
                <LinkedinIcon size={28} />
              </Link>
            </Box>

            <Box backgroundColor="background-shade-1" style={{ padding: 2 }}>
              <ThemeSwitcher size={28} />
            </Box>
          </Box>
        </Box>

        <Box>
          <Lines count={4} />
        </Box>
      </Box>
    </Box>
  );
}
