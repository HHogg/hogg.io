import { Grid, GridProps, Text } from 'preshape';
import { Fragment } from 'react';
import terms from './glossary_terms.json';

export default function Glossary(props: GridProps) {
  return (
    <Grid
      {...props}
      gapVertical="x8"
      style={{
        gridTemplateColumns: 'max-content 1fr',
      }}
    >
      {terms.map((term) => (
        <Fragment key={term.term}>
          <Text maxWidth="200px">
            <Text strong>{term.term}</Text>
          </Text>
          <Text>{term.definition}</Text>
        </Fragment>
      ))}
    </Grid>
  );
}
