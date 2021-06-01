import * as React from 'react';
import {
  Appear,
  Button,
  Buttons,
  Flex,
  Icon,
  Separator,
  Text,
  useResizeObserver,
} from 'preshape';
import data from '../../../data';
import { RootContext } from '../../Root';
import ProjectPage from '../../ProjectPage/ProjectPage';
import PlanetVisual from './PlanetVisual';
import getGeometry from './getGeometry/getGeometry';

export interface LayerSettings {
  mode: 'points' | 'lines' | 'faces';
  visible: boolean;
}

export type GeometriesSettings = Record<string, LayerSettings>;

const defaultLayerSettings: LayerSettings = {
  mode: 'faces',
  visible: true,
};

const Planet = () => {
  const { onChangeTheme, theme } = React.useContext(RootContext);
  const refTheme = React.useRef(theme);
  const [size, ref] = useResizeObserver();
  const [geometries] = React.useState(() => getGeometry());
  const [layerSettings, setLayerSettings] = React.useState<GeometriesSettings>({});

  const handleSetLayerSettings = (layer: string, settingsUpdate: Partial<LayerSettings> = {}) => {
    setLayerSettings((settings) => ({
      ...settings,
      [layer]: {
        ...defaultLayerSettings,
        ...settings[layer],
        ...settingsUpdate,
      },
    }));
  };

  React.useEffect(() => {
    geometries.forEach(({ name }) => handleSetLayerSettings(name));
  }, [geometries]);

  React.useEffect(() => {
    onChangeTheme('night');

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      onChangeTheme(refTheme.current);
    };
  }, [onChangeTheme]);

  return (
    <ProjectPage { ...data.projects.Planet } themeable={ false }>
      <Flex
          basis="none"
          container
          direction="horizontal"
          gap="x4"
          grow
          padding="x4">
        <Flex container grow minHeight="35rem">
          <Flex
              absolute="edge-to-edge"
              direction="vertical"
              grow
              ref={ ref }>
            { !!(size.height && size.width) && (
              <PlanetVisual
                  geometries={geometries}
                  geometriesSettings={layerSettings}
                  height={ size.height }
                  width={ size.width } />
            ) }
          </Flex>
        </Flex>

        <Flex
            direction="vertical"
            gap="x8">
          <Flex>
            <Flex alignChildrenVertical="middle" direction="horizontal" gap="x2">
              <Flex>
                <Icon name="Layers" size="1rem" />
              </Flex>

              <Flex>
                <Text strong>Layers</Text>
              </Flex>
            </Flex>

            <Separator margin="x2" />
          </Flex>

          <Flex>
            {geometries.map(({ name }) => (
              <Flex
                  alignChildrenVertical="middle"
                  direction="horizontal"
                  gap="x3"
                  margin="x1"
                  key={ name }>
                <Flex grow>
                  <Text ellipsis size="x1" strong>{ name }</Text>
                </Flex>

                { layerSettings[name] && (
                  <>
                    <Flex>
                      <Buttons joined>
                        <Button
                            active={ layerSettings[name].visible }
                            gap="x1"
                            onClick={ () => handleSetLayerSettings(name, { visible: !layerSettings[name].visible }) }>
                          <Icon name="Eye" size="0.75rem" />
                        </Button>
                      </Buttons>
                    </Flex>

                    <Flex>
                      <Buttons joined>
                        <Button
                            active={ layerSettings[name].mode === 'points' }
                            gap="x1"
                            onClick={ () => handleSetLayerSettings(name, { mode: 'points' }) }>
                          <Icon name="Circle" size="0.75rem" />
                        </Button>
                        <Button
                            active={ layerSettings[name].mode === 'lines' }
                            gap="x1"
                            onClick={ () => handleSetLayerSettings(name, { mode: 'lines' }) }>
                          <Icon name="Menu" size="0.75rem" />
                        </Button>
                        <Button
                            active={ layerSettings[name].mode === 'faces' }
                            gap="x1"
                            onClick={ () => handleSetLayerSettings(name, { mode: 'faces' }) }>
                          <Icon name="Triangle" size="0.75rem" />
                        </Button>
                      </Buttons>
                    </Flex>
                  </>
                ) }
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </ProjectPage>
  );
};

export default Planet;
