export default [{
  author: 'Harrison Hogg',
  config: require('./Mushroom.json'),
  name: 'Mushroom',
  svg: require('./Mushroom.svg'),
}, {
  author: 'Harrison Hogg',
  config: require('./Island.json'),
  name: 'Island',
  svg: require('./Island.svg'),
}, {
  author: 'Dorota Pankoska',
  authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
  config: require('./Fox.json'),
  name: 'Fox',
  svg: require('./Fox.svg'),
}, {
  author: 'Dorota Pankoska',
  authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
  config: require('./Monkey.json'),
  name: 'Monkey',
  svg: require('./Monkey.svg'),
}, {
  author: 'Dorota Pankoska',
  authorUrl: 'http://dorotapankowska.com/13-animals-13-circles.html',
  config: require('./Whale.json'),
  name: 'Whale',
  svg: require('./Whale.svg'),
}, {
  author: 'Unknown',
  authorUrl: 'https://www.reddit.com/r/Damnthatsinteresting/comments/963j4n/magic_of_circles/',
  config: require('./Profile.json'),
  name: 'Profile',
  svg: require('./Profile.svg'),
}, {
  name: 'Complexity Test',
  config: require('./ComplexityTestContent.json'),
  development: true,
}].filter(({ development }) => !development || process.env.NODE_ENV === 'development' );
