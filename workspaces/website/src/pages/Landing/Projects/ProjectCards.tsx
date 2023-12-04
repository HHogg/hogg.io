import { Grid } from 'preshape';
import data from '../../../data';
import ProjectCard from './ProjectCard';

export default function ProjectCards() {
  return (
    <Grid gap="x16" repeatWidthMin="320px" repeatWidthMax="1fr">
      {data.projects.map((project) => (
        <ProjectCard {...project} key={project.id} />
      ))}
    </Grid>
  );
}
