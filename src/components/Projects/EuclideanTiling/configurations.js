const fs = require('fs');
const path = require('path');
const { parse } = require('papaparse');

const mergeRowIntoConfiguration = (configurations, row) => {
  const a = row['Cundy & Rollett'];
  const b = row['New Nomenclature'];
  const name = row['Group'];
  let group = configurations.find((group) => group.name === name);

  if (!group) {
    configurations.push(group = {
      name: name,
      configurations: [],
    });
  }

  group.configurations.push({ a, b });

  return configurations;
};

const { data } = parse(fs.readFileSync(path.resolve(__dirname, './configurations.csv'), 'utf8'), {
  header: true,
});

const configurations = data
  .filter((row) => row['New Nomenclature'])
  .reduce((configurations, row) =>
    mergeRowIntoConfiguration(configurations, row)
  , []);

fs.writeFileSync(
  path.resolve(__dirname, './configurations.json'), JSON.stringify(configurations, null, 2));
