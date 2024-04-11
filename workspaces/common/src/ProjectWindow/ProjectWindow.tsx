import { BoxProps, ThemeProvider } from 'preshape';
import ProjectWindowContents, {
  ProjectWindowContentsProps,
} from './ProjectWindowContents';
import ProjectWindowProvider from './ProjectWindowProvider';

type Props = ProjectWindowContentsProps;

export default function ProjectWindow({
  theme,
  ...rest
}: Omit<BoxProps, 'controls'> & Props) {
  return (
    <ProjectWindowProvider>
      <ThemeProvider theme={theme}>
        <ProjectWindowContents {...rest} />
      </ThemeProvider>
    </ProjectWindowProvider>
  );
}
