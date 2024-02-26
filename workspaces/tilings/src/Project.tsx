import { ProjectPage, ProjectPageProps } from '@hogg/common';
import { useMemo } from 'react';
import Article from './Article';
import {
  ArrangementProvider,
  NotationProvider,
  Player,
  getRandomNotation,
} from './Presentation';
import { ColorMode } from './types';

export default function Project(props: ProjectPageProps) {
  const notation = useMemo(() => getRandomNotation(''), []);

  return (
    <ProjectPage
      {...props}
      article={<Article />}
      presentation={
        <NotationProvider notation={notation}>
          <ArrangementProvider>
            <Player
              options={{
                autoRotate: true,
                speed: 1,
                colorMode: ColorMode.VaporWave,
                isPlaying: true,
              }}
              shadow
            />
          </ArrangementProvider>
        </NotationProvider>
      }
    />
  );
}
