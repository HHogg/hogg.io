import React, { Component } from 'react';
import {
  Bounds,
  Flex,
  Icon,
  Markdown,
  Responsive,
  Text,
} from 'preshape';
import maxBy from 'lodash.maxby';
import { widthSmall, widthMedium } from '../../Root';
import BirthdayParadoxControls from './BirthdayParadoxControls';
import BirthdayParadoxTable from './BirthdayParadoxTable';
import BirthdayParadoxVisual from './BirthdayParadoxVisual';
import Project from '../../Project/Project';

export default class BirthdayParadox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      showTable: false,
      showTableMore: false,
      simulations: 500,
    };
  }

  componentDidMount() {
    this.worker = new Worker('/assets/workers/BirthdayParadox.js');

    this.worker.onmessage = ({ data: { probabilities, simulations } }) => {
      const p50 = probabilities.find(({ probability }) => probability >= 0.50);
      const p99 = probabilities.find(({ probability }) => probability >= 0.99);
      const p100 = probabilities.find(({ probability }) => probability === 1);
      const lNon100Index = probabilities.map(({ probability }) => probability).reverse().findIndex((p) => p !== 1);
      const maxCollision = maxBy(probabilities, ({ collisions }) => collisions);
      const tableN = (probabilities.length - lNon100Index) + 1;

      this.setState({
        data: probabilities,
        isRunning: false,
        lastSimulations: simulations,
        maxCollision: maxCollision,
        p50: p50,
        p99: p99,
        p100: p100,
        tableN: tableN,
      }, () => {
        window.setTimeout(() => {
          this.setState({ showTable: true });
        });
      });
    };

    this.runSimulation();
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  runSimulation() {
    this.setState({
      data: [],
      isRunning: true,
      showTable: false,
      showTableMore: false,
    });

    this.worker.postMessage({
      simulations: this.state.simulations,
    });
  }

  render() {
    const {
      data,
      isRunning,
      lastSimulations,
      maxCollision,
      p50,
      p99,
      p100,
      showTable,
      simulations,
    } = this.state;

    return (
      <Project { ...this.props } maxWidth={ widthMedium }>
        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Flex
                direction={ match(widthSmall) ? 'horizontal' : 'vertical' }
                grow
                gutter="x8">
              <Flex
                  direction="horizontal"
                  grow
                  initial={ match(widthSmall) ? 'none' : null }
                  minHeight="35rem"
                  paddingVertical={ match(widthSmall) ? 'x8' : null }>
                <Flex container grow>
                  { !!data.length && (
                    <Bounds absolute="fullscreen">
                      { ({ width, height }) => width && height && (
                        <BirthdayParadoxVisual
                            data={ data }
                            height={ height }
                            p100={ p100 }
                            p50={ p50 }
                            p99={ p99 }
                            width={ width } />
                      ) }
                    </Bounds>
                  ) }


                  { isRunning && (
                    <Flex
                        absolute="fullscreen"
                        alignChildren="middle"
                        direction="horizontal">
                      <Flex alignChildren="middle" direction="vertical">
                        <Icon name="Progress" size="2rem" spin="slow" />
                        <Text margin="x2" strong>Crunching the numbers... sit tight...</Text>
                      </Flex>
                    </Flex>
                  ) }
                </Flex>
              </Flex>

              { !!data.length && (
                <Flex>
                  <BirthdayParadoxControls
                      isRunning={ isRunning }
                      maxCollision={ maxCollision }
                      onConfigChange={ (config) => this.setState(config) }
                      onRunSimulation={ () => this.runSimulation() }
                      p100={ p100 }
                      p50={ p50 }
                      p99={ p99 }
                      simulations={ simulations } />
                </Flex>
              ) }
            </Flex>
          ) }
        </Responsive>

        <Markdown>{
`> In [probability theory](https://en.wikipedia.org/wiki/Probability_theory), the **birthday problem** or **birthday paradox** concerns the [probability](https://en.wikipedia.org/wiki/Probability) that, in a set of _n_ [randomly](https://en.wikipedia.org/wiki/Random) chosen people, some pair of them will have the same [birthday](https://en.wikipedia.org/wiki/Birthday). By the [pigeonhole principle](https://en.wikipedia.org/wiki/Pigeonhole_principle), the probability reaches 100% when the number of people reaches 367 (since there are only 366 possible birthdays,   [including February 29](https://en.wikipedia.org/wiki/February_29)). However, 99.9% probability is reached with just 70 people, and 50% probability with 23 people.
>
> [WikiPedia - Birthday problem](https://en.wikipedia.org/wiki/Birthday_problem)`
        }</Markdown>

        { showTable && (
          <BirthdayParadoxTable
              data={ data }
              simulations={ lastSimulations } />
        ) }
      </Project>
    );
  }
}
