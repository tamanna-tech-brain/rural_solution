export const groupFarmers = (farmers = []) => {
  const groups = {};

  farmers.forEach((f) => {
    const key = f.village;

    if (!groups[key]) groups[key] = [];

    groups[key].push(f);
  });

  return groups;
};