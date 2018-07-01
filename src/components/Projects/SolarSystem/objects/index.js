export const units = {
  radius: 'km',
  semiMajorAxis: 'km',
  period: 'days',
};

export const exponents = {
  radius: 0,
};

export const objects = [
  require('./data/sun.json'),
  require('./data/mercury.json'),
  require('./data/venus.json'),
  require('./data/earth.json'),
  require('./data/mars.json'),
  require('./data/jupiter.json'),
  require('./data/saturn.json'),
  require('./data/uranus.json'),
  require('./data/neptune.json'),
  require('./data/pluto.json'),
  ...require('./data/earth_moons.json'),
  ...require('./data/mars_moons.json'),
  ...require('./data/saturn_moons.json'),
  ...require('./data/uranus_moons.json'),
  ...require('./data/neptune_moons.json'),
  ...require('./data/pluto_moons.json'),
].map((object, index, objects) => ({
  ...object,
  id: `${object.orbits}/${object.name}`,
  orbitingObjects: objects
    .filter(({ orbits }) => object.name === orbits)
    .map(({ name }) => name),
}));

export const objectsMap = objects
  .reduce((o, object) => ({ ...o, [object.name]: object }), {});

export const orbitingObjects = objects
  .filter(({ orbits }) => orbits);
