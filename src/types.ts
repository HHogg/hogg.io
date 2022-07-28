
type ExperienceList =
| 'Pure360' | 'Reedsy' | 'Brandwatch' | 'Bitrise' | 'Spotify';

type ProjectsList =
| 'Antwerp' | 'CircleGraph' | 'CircleArt' | 'Preshape' | 'Snake' | 'Spirals';

type WritingsList =
| 'CircleGraphs' | 'CircleIntersections' | 'SnakeSolution'

type PublicationsList =
| 'Tilings';

export type Experience = {
  company: string;
  date: string;
  description?: string;
  tags?: string[];
  role: string;
}

export type Project = {
  description: string;
  href?: string;
  image: string;
  imageOG?: string;
  tags: string[];
  title: string;
  to?: string;
}

export type Writing = {
  id: string;
  date: string;
  description: string;
  imageOG: string;
  tags: string[];
  title: string;
  to: string;
  unlisted?: boolean;
}

export type Publication = {
  title: string;
  date: string;
  journal: string;
  authors: string[];
  href: string;
  description: string;
};

export interface Data {
  experience: Record<ExperienceList, Experience>;
  projects: Record<ProjectsList, Project>;
  writings: Record<WritingsList, Writing>;
  publications: Record<PublicationsList, Publication>,
}
