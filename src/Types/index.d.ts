export interface Experience {
  company: string;
  date: string;
  description?: string;
  tags?: string[];
  role: string;
}

export interface Project {
  description: string;
  href?: string;
  image: string;
  imageOG?: string;
  tags: string[];
  title: string;
  to?: string;
}

export interface Writing {
  id: string;
  date: string;
  description: string;
  imageOG: string;
  tags: string[];
  title: string;
  to: string;
  unlisted?: boolean;
}

export interface Data<E extends string, P extends string, W extends string> {
  experience: Record<E, Experience>;
  projects: Record<P, Project>;
  writings: Record<W, Writing>;
}
