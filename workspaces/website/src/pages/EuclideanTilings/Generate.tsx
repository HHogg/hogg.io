import {
  ArrangementProvider,
  NotationProvider,
  Renderer,
  ScaleMode,
} from '@hogg/tilings';
import { useParams, useSearchParams } from 'react-router-dom';
import Page from '../../components/Page/Page';

export default function GeneratePage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const notation = params['*'];
  const isCropped = searchParams.get('cropped') === 'true';

  if (!notation) {
    return null;
  }

  return (
    <Page
      title="Euclidean tiling"
      description="Full page euclidean tiling rendering"
    >
      <NotationProvider notation={notation}>
        <ArrangementProvider>
          <Renderer
            scale={3}
            options={
              isCropped
                ? {
                    autoRotate: true,
                    scaleMode: ScaleMode.Fixed,
                    scaleSize: 60,
                    expansionPhases: 5,
                  }
                : {
                    autoRotate: true,
                    expansionPhases: 5,
                  }
            }
          />
        </ArrangementProvider>
      </NotationProvider>
    </Page>
  );
}
