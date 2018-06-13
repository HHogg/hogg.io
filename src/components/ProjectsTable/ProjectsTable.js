import React, { Component } from 'react';
import { routeTransitionTime, transitionTimeFast, Appear, Grid, GridItem, Link, Responsive } from 'preshape';
import projectsList from '../Projects/projectsList';
import Element from '../Element/Element';

const ELEMENT_TRANSITION_STEP = transitionTimeFast / 2;

const widthSmall = '22rem';
const widthMedium = '42rem';

export const projectTableTransitionTime = routeTransitionTime + (ELEMENT_TRANSITION_STEP * projectsList.length);

export default class ProjectsTable extends Component {
  render() {
    return (
      <Responsive queries={ [widthSmall, widthMedium] }>
        { (match) => (
          <Grid
              columnCount={ match({ [widthSmall]: 3, [widthMedium]: null }) || 2 }
              gutter="x2"
              margin="x6">
            { projectsList.map(({ code, disabled, href, to, x, y, ...rest }, index) => (
              <GridItem
                  column={ match(widthMedium) ? x : null }
                  key={ code }
                  row={ match(widthMedium) ? y : null }>
                <Appear
                    delay={ routeTransitionTime + (ELEMENT_TRANSITION_STEP * index) }>
                  <Link
                      href={ disabled ? null : href }
                      to={ disabled ? null : to }
                      weak>
                    <Element { ...rest }
                        code={ code }
                        disabled={ disabled } />
                  </Link>
                </Appear>
              </GridItem>
            )) }
          </Grid>
        ) }
      </Responsive>
    );
  }
}
