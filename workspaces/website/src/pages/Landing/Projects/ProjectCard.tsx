import { ImageCover, Project, getProjectRoutePath } from '@hogg/common';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Box, Button, Link, Text } from 'preshape';
import { useState } from 'react';

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  const { name, description, href, image, imageDark } = project;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      borderRadius="x3"
      href={href}
      flex="vertical"
      gap="x6"
      grow
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      to={href ? undefined : getProjectRoutePath(project)}
      textColorActive="text-shade-1"
      textColorHover="text-shade-1"
      underline={false}
    >
      <Box>
        {image || imageDark ? (
          <ImageCover
            backgroundColor="text-shade-1"
            borderRadius="x2"
            borderSize="x1"
            borderColor="background-shade-4"
            height="140px"
            margin="x4"
            src={image}
            srcDark={imageDark}
          />
        ) : (
          <Box
            flex="vertical"
            alignChildren="middle"
            backgroundColor="background-shade-4"
            height="156px"
            margin="x4"
            borderRadius="x1"
            borderSize="x1"
            borderColor="background-shade-4"
            padding="x2"
          >
            <Text size="x4" weight="x5">
              WIP
            </Text>
          </Box>
        )}

        <Text size="x4" weight="x4" margin="x1" paddingHorizontal="x1">
          {name}
        </Text>

        <Text
          margin="x2"
          size="x3"
          textColor="text-shade-2"
          paddingHorizontal="x1"
        >
          {description}
        </Text>
      </Box>

      <Box alignChildren="start" flex="horizontal" gap="x3">
        <Button
          active={isHovered}
          borderSize="x1"
          borderRadius="20px"
          backgroundColor="background-shade-1"
          backgroundColorActive="text-shade-1"
          backgroundColorHover="text-shade-1"
          textColor="text-shade-1"
          textColorHover="background-shade-1"
          textColorActive="background-shade-1"
          borderColor="text-shade-1"
          borderColorActive="text-shade-1"
          borderColorHover="text-shade-1"
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
            animate={{ rotate: isHovered ? 0 : -45 }}
            initial={{ rotate: 0 }}
          >
            <ArrowRight size="1.25rem" />
          </motion.div>
        </Button>
      </Box>
    </Link>
  );
}
