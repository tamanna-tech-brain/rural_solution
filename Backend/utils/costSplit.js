export const calculateShareCost = (
  farmerWeight,
  totalWeight,
  totalTransportCost
) => {
  return (farmerWeight / totalWeight) * totalTransportCost;
};