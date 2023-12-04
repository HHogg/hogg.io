import {
  ArrangementProvider,
  ColorMode,
  NotationProvider,
  Player,
  getRandomNotation,
} from '@hogg/tilings';
import { useMemo } from 'react';
import ProjectPage from '../../components/ProjectPage/ProjectPage';
import ProjectPageProvider from '../../components/ProjectPage/ProjectPageProvider';
import { ProjectKey } from '../../types';
import Article from './Article';

export default function EuclideanTilings() {
  const notation = useMemo(() => getRandomNotation(''), []);

  return (
    <ProjectPageProvider id={ProjectKey.EuclideanTilings}>
      <ProjectPage
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
    </ProjectPageProvider>
  );
}
