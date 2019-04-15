import configurations from './configurations.json';

const find = (t, e) => {
  for (const group of configurations) {
    for (const configuration of group.configurations) {
      if (configuration[t] === e) {
        return configuration;
      }
    }
  }
};

export const findByA = (e) => find('a', e);
export const findByB = (e) => find('b', e);
