import { CircleArtData } from '../EditorProvider';
import FoxJson from './Fox.json';
import MonkeyJson from './Monkey.json';
import MushroomJson from './Mushroom.json';
import ProfileJson from './Profile.json';
import TwitterJson from './Twitter.json';
import WhaleJson from './Whale.json';

export type GalleryItem = {
  author: string;
  authorUrl: string;
  config: CircleArtData;
  name: string;
};

const data: GalleryItem[] = [
  {
    author: 'Dorota Pankoska',
    authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
    config: FoxJson,
    name: 'Fox',
  },
  {
    author: 'Dorota Pankoska',
    authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
    config: MonkeyJson,
    name: 'Monkey',
  },
  {
    author: 'Dorota Pankoska',
    authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
    config: WhaleJson,
    name: 'Whale',
  },
  {
    author: 'Unknown',
    authorUrl:
      'https://www.reddit.com/r/Damnthatsinteresting/comments/963j4n/magic_of_circles',
    config: ProfileJson,
    name: 'Profile',
  },
  {
    author: 'Unknown',
    authorUrl: 'https://twitter.com/thegallowboob/status/1304943534638796801',
    config: TwitterJson,
    name: 'Twitter',
  },
  {
    author: 'Me',
    authorUrl: 'https://hogg.io',
    config: MushroomJson,
    name: 'Mushroom',
  },
];

export const configurationsByName = data.reduce((acc, item) => {
  acc[item.name] = item;
  return acc;
}, {} as Record<string, GalleryItem>);

export default data;
