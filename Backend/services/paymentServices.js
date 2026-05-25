export const calculatePaymentStatus = (
  amountPaid,
  totalAmount
) => {
  if (amountPaid >= totalAmount) {
    return "completed";
  }

  if (amountPaid > 0) {
    return "partial";
  }

  return "pending";
};

export const splitTransportCost = (
  farmerWeight,
  totalWeight,
  totalCost
) => {
  return (farmerWeight / totalWeight) * totalCost;
};