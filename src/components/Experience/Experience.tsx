import * as React from 'react';
import { Flex, Text } from 'preshape';
import { DateTime } from 'luxon';

interface Props {
  company: string;
  date: number;
  description: string;
  labels: string[];
  present?: boolean;
  role: string;
}

const Experience = (props: Props) => {
  const { company, date, description, present, role } = props;

  return (
    <Flex
        direction="horizontal"
        gap="x6"
        margin="x2">
      <Flex
          direction="vertical"
          gap="x2">
        <Flex>
          <Text
              backgroundColor="accent-shade-2"
              borderRadius="x1"
              paddingHorizontal="x2"
              paddingVertical="x1"
              size="x1"
              strong
              textColor="light-shade-1">
            { DateTime.fromMillis(date).toFormat('yyyy') }
          </Text>
        </Flex>

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

            { present && (
              <Flex
                  backgroundColor="accent-shade-2"
                  borderRadius="full"
                  height="12px"
                  width="12px" />
            ) }
          </Flex>
        </Flex>

        <Flex>
        </Flex>
      </Flex>

      <Flex basis="none" grow paddingVertical="x2">
        <Text strong>{ company }</Text>
        <Text size="x1" strong>{ role }</Text>
        <Text paddingVertical="x2" size="x1">{ description }</Text>
      </Flex>
    </Flex>
  );
};

export default Experience;
