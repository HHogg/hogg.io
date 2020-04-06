import * as React from 'react';
import { Flex, Image, Text } from 'preshape';
import WritingSection, { Props as WritingSectionProps } from './WritingSection';

interface Props extends WritingSectionProps {
  figs: {
    description?: string;
    image?: string;
    number: number;
  }[];
}

export default (props: React.PropsWithChildren<Props>) => {
  const { figs, ...rest } = props;

  return (
    <WritingSection { ...rest }
        backgroundColor="light-shade-1"
        padding="x6"
        size="x1"
        textColor="dark-shade-1">
      <Flex
          direction="horizontal"
          gap="x6">
        { figs.map(({ description, image, number }) => (
          <Flex grow key={ number } shrink>
            { image && (
              <Flex alignChildrenHorizontal="middle" direction="horizontal" margin="x2">
                <Image src={ image } />
              </Flex>
            ) }

            <Text margin="x2"><Text inline strong>Fig { number }.</Text> { description }</Text>
          </Flex>
        )) }
      </Flex>
    </WritingSection>
  );
};
