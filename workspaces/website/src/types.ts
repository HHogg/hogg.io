export type Placement = {
  company: string;
  logo: string;
  date: string;
  description: string;
  tags: string[];
  role: string;
};

export type Data = {
  placements: Placement[];
};
