import * as React from 'react';
import openColor from 'open-color';
import { SeriesPointXY, Viz, VizSVG, VizSVGAxisX, VizSVGAxisY, VizSVGCircles, VizSVGGridLinesAxisX, VizSVGGridLinesAxisY, VizSVGLine } from '@bitrise/bitviz';
import { sizeX8Px, themes, Flex, List, ListItem, Text } from 'preshape';
import numbro from 'numbro';

const format = (v: number) => numbro(v).format({
  average: true,
  totalLength: 1,
  trimMantissa: true,
});


const names: string[] = [
  'Manhattan Distance',
  'Euclidean Distance',
  'Hamiltonian Cycle',
  'Tail Escape',
];

const colors: string[] = [
  openColor.indigo[5],
  openColor.cyan[5],
  openColor.teal[5],
  openColor.lime[5],
];

interface Props {
  series: SeriesPointXY[][];
  seriesPoints: SeriesPointXY[];
  title: string;
  xDomain: number[];
  yDomain: number[];
}

export default (props: Props) => {
  const { series, seriesPoints, title, xDomain, yDomain } = props;

  return (
    <Flex basis="none" direction="vertical" gap="x3" grow>
      <Flex>
        <Text align="middle" margin="x2" size="x1" strong>{ title }</Text>

        <Flex direction="horizontal">
          <Flex basis="none" grow>
            <Viz
                height={ 300 }
                paddingBottom={ sizeX8Px }
                paddingLeft={ sizeX8Px }
                xDomain={ xDomain }
                yDomain={ yDomain }>
              <VizSVG>
                <VizSVGGridLinesAxisX
                    stroke={ themes.day.colorTextShade3 }
                    strokeDasharray="4 4"
                    strokeOpacity="0.1" />

                <VizSVGGridLinesAxisY
                    stroke={ themes.day.colorTextShade3 }
                    strokeDasharray="4 4"
                    strokeOpacity="0.1" />

                { series.map((series, index) => (
                  <VizSVGLine
                      curve="curveBasis"
                      key={ names[index] }
                      series={ series }
                      stroke={ colors[index] }
                      strokeWidth="2" />
                )) }

                { names.map((name, index) => (
                  <VizSVGCircles
                      fill={ colors[index] }
                      key={ name }
                      r={ 3 }
                      series={ [seriesPoints[index]] } />
                )) }

                <VizSVGAxisX
                    fill={ themes.day.colorTextShade3 }
                    fontWeight="bold"
                    format={ format }
                    stroke={ themes.day.colorTextShade3 }
                    strokeWidth="2" />

                <VizSVGAxisY
                    fill={ themes.day.colorTextShade3 }
                    fontWeight="bold"
                    format={ format }
                    stroke={ themes.day.colorTextShade3 }
                    strokeWidth="2" />
              </VizSVG>
            </Viz>
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="horizontal">
        <List alignChildren="middle" basis="none" gap="x1" grow>
          { names.map((name, index) => (
            <ListItem key={ name } padding="x1" separator="">
              <Flex alignChildren="middle" direction="horizontal" gap="x2">
                <Flex>
                  <Flex
                      borderRadius="full"
                      height="12px"
                      style={ { backgroundColor: colors[index] } }
                      width="12px" />
                </Flex>

                <Flex>
                  <Text size="x1" strong>
                    { name }
                  </Text>
                </Flex>
              </Flex>
            </ListItem>
          )) }
        </List>
      </Flex>
    </Flex>
  );
};
