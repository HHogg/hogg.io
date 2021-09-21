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

export interface Data {
  experience: { [key: string]: Experience };
  projects: { [key: string]: Project };
  writings: { [key: string]: Writing };
}
