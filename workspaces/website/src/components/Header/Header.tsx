import { Lines } from '@hogg/common';
import { GithubIcon, LinkedinIcon } from 'lucide-react';
import { Box, BoxProps, Link } from 'preshape';
import { PropsWithChildren } from 'react';
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher';
import Ascii from './Ascii';

export default function Header({
  children,
  ...rest
}: PropsWithChildren<BoxProps>) {
  return (
    <Box {...rest} flex="horizontal" gap="x8">
      {children}

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
            gap="x4"
            paddingHorizontal="x8"
            textColor="text-shade-1"
          >
            <Box backgroundColor="background-shade-1">
              <Link href="https://github.com/HHogg" target="Github">
                <GithubIcon size={28} />
              </Link>
            </Box>

            <Box backgroundColor="background-shade-1">
              <Link
                href="https://linkedin.com/in/harrison-hogg"
                target="LinkedIn"
              >
                <LinkedinIcon size={28} />
              </Link>
            </Box>

            <Box backgroundColor="background-shade-1">
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
