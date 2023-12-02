import { CircleArtGalleryItem } from '../../types';
import FoxJson from './Fox.json';
import FoxImage from './Fox.svg';
import MonkeyJson from './Monkey.json';
import MonkeyImage from './Monkey.svg';
import MushroomJson from './Mushroom.json';
import MushroomImage from './Mushroom.svg';
import ProfileJson from './Profile.json';
import ProfileImage from './Profile.svg';
import WhaleJson from './Whale.json';
import WhaleImage from './Whale.svg';

const data: CircleArtGalleryItem[] = [
  {
    author: 'Dorota Pankoska',
    authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
    config: FoxJson,
    name: 'Fox',
    thumbnail: FoxImage,
  },
  {
    author: 'Dorota Pankoska',
    authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
    config: MonkeyJson,
    name: 'Monkey',
    thumbnail: MonkeyImage,
  },
  {
    author: 'Dorota Pankoska',
    authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
    config: WhaleJson,
    name: 'Whale',
    thumbnail: WhaleImage,
  },
  {
    author: 'Unknown',
    authorUrl:
      'https://www.reddit.com/r/Damnthatsinteresting/comments/963j4n/magic_of_circles',
    config: ProfileJson,
    name: 'Profile',
    thumbnail: ProfileImage,
  },
  {
    author: 'Me',
    authorUrl: 'https://hogg.io',
    config: MushroomJson,
    name: 'Mushroom',
    thumbnail: MushroomImage,
  },
];

export default data;
