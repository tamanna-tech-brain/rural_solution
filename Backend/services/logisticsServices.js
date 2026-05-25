export const groupFarmersByRegion = (farmers) => {
  const grouped = {};

  farmers.forEach((farmer) => {
    if (!grouped[farmer.region]) {
      grouped[farmer.region] = [];
    }

    grouped[farmer.region].push(farmer);
  });

  return grouped;
};

export const calculateTruckUsage = (
  totalWeight,
  truckCapacity
) => {
  return (totalWeight / truckCapacity) * 100;
};