import * as React from 'react';
import { Flex, Label, Labels, Text } from 'preshape';
import { DateTime } from 'luxon';
import { Experience } from '../../Types';

interface Props extends Experience {
  current?: boolean;
}

const ExperienceComponent = (props: Props) => {
  const { current, company, date, description, tags, role } = props;

  return (
    <Flex
        direction="horizontal"
        gap="x6"
        margin="x2">
      <Flex
          direction="vertical"
          gap="x2">
        { current && (
          <Flex>
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
          </Flex>
        ) }

        <Flex
            alignChildrenHorizontal="middle"
            direction="horizontal"
            grow>
          <Flex
              alignChildrenHorizontal="middle"
              direction="vertical">
            <Flex
                backgroundColor="accent-shade-2"
                grow
                width="2px" />
          </Flex>
        </Flex>

        <Flex>
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
        </Flex>
      </Flex>

      <Flex backgroundColor="background-shade-2" basis="none" grow padding="x6">
        <Text strong>{ company }</Text>
        <Text size="x1" strong>{ role }</Text>
        <Text margin="x2" size="x1">{ description }</Text>
        <Labels margin="x3">
          { tags.map((tag) =>
            <Label key={ tag } size="x1">{ tag } </Label>
          ) }
        </Labels>
      </Flex>
    </Flex>
  );
};

export default ExperienceComponent;
