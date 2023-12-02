import { Box, useMatchMedia, useResizeObserver } from 'preshape';
import { useEffect, useState } from 'react';
import data from '../../../data';
import ProjectPage from '../../ProjectPage/ProjectPage';
import { TypeAlgorithm, getFermatSpiral } from './Algorithms';
import SpiralsControls from './SpiralsControls';
import SpiralsVisual from './SpiralsVisual';
import { TypeVectorWithSize, getVectors } from './getVectors';

export interface Config {
  algorithm: TypeAlgorithm;
  padding: number;
  shapeCount: number;
  showShapes: boolean;
  showVectors: boolean;
  vectorCount: number;
}

const defaultConfig: Config = {
  algorithm: getFermatSpiral,
  padding: 5,
  shapeCount: 100,
  showShapes: true,
  showVectors: true,
  vectorCount: 5000,
};

const Spirals = () => {
  const match = useMatchMedia(['600px']);
  const [size, ref] = useResizeObserver();
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [vectors, setState] = useState<TypeVectorWithSize[]>([]);

  useEffect(() => {
    setState(getVectors(config, size));
  }, [config, size]);

  return (
    <ProjectPage {...data.projects.Spirals}>
      <Box flex={match('600px') ? 'horizontal' : 'vertical'} gap="x8" grow>
        <Box
          alignChildrenVertical="end"
          backgroundColor="dark-shade-2"
          basis={match('600px') ? '0' : undefined}
          borderRadius="x3"
          flex="vertical"
          gap="x4"
          grow
          minHeight="35rem"
          padding="x4"
          textColor="light-shade-1"
        >
          <Box container grow>
            <Box absolute="edge-to-edge" ref={ref}>
              {!!(size.height && size.width) && (
                <SpiralsVisual
                  height={size.height}
                  vectors={vectors}
                  width={size.width}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Box>
          <SpiralsControls
            config={config}
            onConfigChange={(update: Partial<Config>) =>
              setConfig({ ...config, ...update })
            }
          />
        </Box>
      </Box>
    </ProjectPage>
  );
};

export default Spirals;
