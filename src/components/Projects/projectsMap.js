import projectsList from './projectsList';

export default projectsList.reduce((projects, project) =>
  ({ ...projects, [project.code]: project })
, {});
