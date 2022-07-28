import { Circle } from "../IntersectionExplorer/useGraph";

export type CircleArtData = {
  width: number;
  height: number;
  circles: Circle[];
  fills: Record<string, boolean>;
};

export type CircleArtGalleryItem = {
  author: string;
  authorUrl: string;
  config: CircleArtData;
  name: string;
  thumbnail: string;
};
