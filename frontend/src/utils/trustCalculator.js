export const calculateTrust = (user) => {
  let score = user.trustScore || 5;

  if (user.cancelCount > 3) score -= 2;
  if (user.completedBookings > 10) score += 1;
  if (user.disputes > 0) score -= user.disputes;

  if (score > 10) score = 10;
  if (score < 1) score = 1;

  return score;
};