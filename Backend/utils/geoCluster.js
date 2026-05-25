export const clusterByVillage = (farmers) => {
  const clusters = {};

  farmers.forEach((farmer) => {
    if (!clusters[farmer.village]) {
      clusters[farmer.village] = [];
    }

    clusters[farmer.village].push(farmer);
  });

  return clusters;
};

export const filterNearbyFarmers = (
  farmers,
  village
) => {
  return farmers.filter(
    (farmer) => farmer.village === village
  );
};