import { CircleArtGalleryItem } from "../../types";

const data: CircleArtGalleryItem[] = [{
  author: 'Dorota Pankoska',
  authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
  config: require('./Fox.json'),
  name: 'Fox',
  thumbnail: require('./Fox.svg'),
}, {
  author: 'Dorota Pankoska',
  authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
  config: require('./Monkey.json'),
  name: 'Monkey',
  thumbnail: require('./Monkey.svg'),
}, {
  author: 'Dorota Pankoska',
  authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
  config: require('./Whale.json'),
  name: 'Whale',
  thumbnail: require('./Whale.svg'),
}, {
  author: 'Unknown',
  authorUrl: 'https://www.reddit.com/r/Damnthatsinteresting/comments/963j4n/magic_of_circles',
  config: require('./Profile.json'),
  name: 'Profile',
  thumbnail: require('./Profile.svg'),
}, {
  author: 'Me',
  authorUrl: 'https://hogg.io',
  config: require('./Mushroom.json'),
  name: 'Mushroom',
  thumbnail: require('./Mushroom.svg'),
}];

export default data;
