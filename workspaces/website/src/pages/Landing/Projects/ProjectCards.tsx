import { Grid } from 'preshape';
import { projects, shouldShowProject } from '../../../projects';
import ProjectCard from './ProjectCard';

export default function ProjectCards() {
  return (
    <Grid gap="x16" repeatWidthMin="320px" repeatWidthMax="1fr">
      {projects
        .filter(({ meta }) => shouldShowProject(meta))
        .map((project) => (
          <ProjectCard project={project.meta} key={project.meta.id} />
        ))}
    </Grid>
  );
}
