import * as React from 'react';
import { Box, Label, Labels, Text } from 'preshape';
import { DateTime } from 'luxon';
import { Experience } from '../../Types';

interface Props extends Experience {
  current?: boolean;
}

const ExperienceComponent = (props: Props) => {
  const { current, company, date, description, tags, role } = props;

  return (
    <Box
        flex="horizontal"
        gap="x6"
        margin="x2">
      <Box
          flex="vertical"
          gap="x2">
        { current && (
          <Box>
            <Text
                backgroundColor="accent-shade-2"
                borderRadius="x1"
                paddingHorizontal="x2"
                paddingVertical="x1"
                size="x1"
                strong
                textColor="light-shade-1">
              Now
            </Text>
          </Box>
        ) }

        <Box
            alignChildrenHorizontal="middle"
            flex="horizontal"
            grow>
          <Box
              alignChildrenHorizontal="middle"
              flex="vertical">
            <Box
                backgroundColor="accent-shade-2"
                grow
                width="2px" />
          </Box>
        </Box>

        <Box>
          <Text
              backgroundColor="accent-shade-2"
              borderRadius="x1"
              paddingHorizontal="x2"
              paddingVertical="x1"
              size="x1"
              strong
              textColor="light-shade-1">
            { DateTime.fromISO(date).toFormat('yyyy') }
          </Text>
        </Box>
      </Box>

      <Box backgroundColor="background-shade-2" basis="0" grow padding="x6">
        <Text size="x3" strong>{ company }</Text>
        <Text strong>{ role }</Text>
        <Text margin="x2">{ description }</Text>
        <Labels margin="x3">
          { tags.map((tag) =>
            <Label key={ tag }>{ tag } </Label>
          ) }
        </Labels>
      </Box>
    </Box>
  );
};

export default ExperienceComponent;
