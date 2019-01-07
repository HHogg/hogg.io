import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Base,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
} from 'preshape';
import { DateTime, Info } from 'luxon';

const months = Info.months();
const standardYear = new DateTime.local().set({ year: 2018 }).startOf('year');

const getDayMonth = (days) => {
  const date = standardYear.plus({ days });
  const day = date.get('day');
  const month = date.get('month');

  return `${day} ${months[month - 1]}`;
};

const lastIndex = (data) => {
  const probabilities = data.map(({ probability }) => probability).reverse();
  const firstNon100 = probabilities.findIndex((p) => p !== 1);

  return (data.length - firstNon100) + 1;
};

export default class BirthdayParadoxTable extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    simulations: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      n: lastIndex(props.data),
    };
  }

  render() {
    const { n } = this.state;
    const { data, simulations } = this.props;

    return (
      <Base margin="x16">
        <Text margin="x4" size="x3" strong>Results after { simulations } Simulations</Text>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell sorted>No. People</TableHeaderCell>
              <TableHeaderCell>Highest Collisions Date</TableHeaderCell>
              <TableHeaderCell>Highest No. Collisions</TableHeaderCell>
              <TableHeaderCell>Probability</TableHeaderCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            { data.slice(0, n).map(({ date, collisions, people, probability }, index) => (
              <TableRow key={ index }>
                <TableCell sorted>{ people }</TableCell>
                <TableCell>{ date ? getDayMonth(date) : 'N/A' }</TableCell>
                <TableCell>{ collisions }</TableCell>
                <TableCell>{ probability }</TableCell>
              </TableRow>
            )) }

            { n !== data.length && (
              <TableRow>
                <TableCell colSpan={ 4 }>
                  <Text align="middle">
                    <Link onClick={ () => this.setState({ n: data.length }) }>
                      Show all results
                    </Link>
                  </Text>
                </TableCell>
              </TableRow>
            ) }
          </TableBody>
        </Table>
      </Base>
    );
  }
}
