import { motion } from 'framer-motion';
import {
  themes,
  Box,
  Icon,
  Link,
  Placement,
  PlacementArrow,
  PlacementContent,
  PlacementManager,
  PlacementReference,
  Text,
} from 'preshape';
import React, { useContext } from 'react';
import { RootContext } from '../../../components/Root';

interface Props {
  asIcon?: boolean;
  description: string;
  onClick: () => void;
  number: number;
  title: string;
}

const RuleBox = ({ asIcon, description, onClick, number, title }: Props) => {
  const { theme } = useContext(RootContext);
  const {
    colorBackgroundShade1,
    colorTextShade1,
  } = themes[theme];

  return (
    <motion.div
        initial={ {
          backgroundColor: colorBackgroundShade1,
          color: colorTextShade1,
        } }
        style={ {
          borderRadius: 4,
        } }
        whileHover={ {
          backgroundColor: colorTextShade1,
          color: colorBackgroundShade1,
          scale: 1.05,
        } }>
      <PlacementManager trigger={ asIcon ? 'hover' : undefined }>
        <PlacementReference>
          { (props) => (
            <Text { ...props }
                alignChildrenVertical="middle"
                borderRadius="x3"
                clickable
                flex="horizontal"
                gap="x6"
                onClick={ onClick }
                paddingHorizontal="x6"
                paddingVertical="x3"
                size="x2">
              <Box>
                <Text size="x4" strong>{ number }</Text>
              </Box>

              { !asIcon && (
                <>
                  <Box basis="0" grow>
                    <Text strong>{ title }</Text>
                    <Text>{ description }</Text>
                  </Box>

                  <Box>
                    <Link
                        borderRadius="x2"
                        color="accent"
                        padding="x4">
                      <Icon name="ChevronDown" size="2rem" />
                    </Link>
                  </Box>
                </>
              ) }
            </Text>
          ) }
        </PlacementReference>

        <Placement
            options={ { modifiers: { preventOverflow: { boundariesElement: 'window' } } } }
            placement="top"
            unrender
            visible={ asIcon ? undefined : false }>
          <PlacementArrow backgroundColor="text-shade-1" />
          <PlacementContent
              backgroundColor="text-shade-1"
              borderRadius="x1"
              maxWidth="200px"
              padding="x4"
              textColor="background-shade-1">
            <Text size="x2"><Text inline strong>{ title }</Text> { description }</Text>
          </PlacementContent>
        </Placement>
      </PlacementManager>
    </motion.div>
  );
};

export default RuleBox;
