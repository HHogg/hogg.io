import { motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { themes, Box, Link, Text, useThemeContext, Tooltip } from 'preshape';

interface Props {
  asIcon?: boolean;
  description: string;
  onClick: () => void;
  number: number;
  title: string;
}

const RuleBox = ({ asIcon, description, onClick, number, title }: Props) => {
  const { theme } = useThemeContext();
  const { colorBackgroundShade1, colorTextShade1 } = themes[theme];

  return (
    <motion.div
      initial={{
        backgroundColor: colorBackgroundShade1,
        color: colorTextShade1,
      }}
      style={{
        borderRadius: 4,
      }}
      whileHover={{
        backgroundColor: colorTextShade1,
        color: colorBackgroundShade1,
        scale: 1.05,
      }}
    >
      <Tooltip
        content={
          <Text size="x3">
            <Text tag="span" weight="x2">
              {title}
            </Text>{' '}
            {description}
          </Text>
        }
      >
        <Text
          alignChildrenVertical="middle"
          borderRadius="x3"
          clickable
          flex="horizontal"
          gap="x6"
          onClick={onClick}
          paddingHorizontal="x6"
          paddingVertical="x3"
          size="x3"
        >
          <Box grow={asIcon}>
            <Text align="middle" size="x5" weight="x2">
              {number}
            </Text>
          </Box>

          {!asIcon && (
            <>
              <Box basis="0" grow>
                <Text weight="x2">{title}</Text>
                <Text>{description}</Text>
              </Box>

              <Box>
                <Link borderRadius="x2" color="accent" padding="x4">
                  <ChevronDownIcon size="2rem" />
                </Link>
              </Box>
            </>
          )}
        </Text>
      </Tooltip>
    </motion.div>
  );
};

export default RuleBox;
