import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Box, Button, Label, Labels, Link, Text } from 'preshape';
import { useState } from 'react';
import ImageCover from '../../../components/ImageCover/ImageCover';
import { Project } from '../../../types';

export default function ProjectCard({
  name,
  description,
  id,
  image,
  imageDark,
  href,
  tags,
}: Project) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      flex="vertical"
      gap="x4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      to={href ? undefined : `/${id}`}
      textColorActive="text-shade-1"
      textColorHover="text-shade-1"
    >
      <Box>
        <ImageCover margin="x4" src={image} srcDark={imageDark} />

        <Text size="x4" weight="x4" margin="x1">
          {name}
        </Text>

        <Text size="x3">{description}</Text>
      </Box>

      <Box alignChildrenVertical="end" flex="horizontal" gap="x3" grow>
        <Labels basis="0" grow>
          {tags.map((tag) => (
            <Label borderRadius="3px" key={tag} size="x1">
              {tag}
            </Label>
          ))}
        </Labels>

        <Button
          active={isHovered}
          borderSize="x1"
          borderRadius="20px"
          backgroundColor="background-shade-1"
          backgroundColorActive="background-shade-1"
          backgroundColorHover="background-shade-1"
          textColor="text-shade-2"
          paddingHorizontal="x3"
          flex="horizontal"
          alignChildrenHorizontal="end"
          alignChildrenVertical="middle"
          gap="x1"
          padding="x1"
          size="x3"
          weight="x3"
        >
          {href ? 'View project' : 'Read more'}

          <motion.div
            animate={{ rotate: isHovered ? 0 : 45 }}
            initial={{ rotate: 0 }}
          >
            <ArrowRight />
          </motion.div>
        </Button>
      </Box>
    </Link>
  );
}
