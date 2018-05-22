const DAYS = 365;

onmessage = ({ data }) => {
  const { simulations } = data;
  const probabilities = [];

  for (let mp = 1; mp <= DAYS + 1; mp++) {
    let collisions = 0;
    let highestCollisionDate = null;
    let highestNumberOfCollisions = 0;

    for (let s = 0; s < simulations; s++) {
      let hasCollision = false;
      const birthdays = {};

      for (let p = 0; p < mp; p++) {
        const date = Math.floor((Math.random() * DAYS) + 1).toString();

        birthdays[date] = birthdays[date] === undefined ? -1 : birthdays[date];
        birthdays[date]++;

        if (birthdays[date]) {
          hasCollision = true;

          if (birthdays[date] > highestNumberOfCollisions) {
            highestCollisionDate = date;
            highestNumberOfCollisions = birthdays[date];
          }
        }
      }

      if (hasCollision) {
        collisions++;
      }
    }

    probabilities.push({
      date: highestCollisionDate,
      collisions: highestNumberOfCollisions,
      people: mp,
      probability: collisions / simulations,
    });
  }

  postMessage({
    probabilities,
    simulations,
  });
};
