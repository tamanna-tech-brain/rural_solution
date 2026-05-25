export const validatePhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;

  return regex.test(phone);
};

export const validateRequiredFields = (
  fields
) => {
  for (const key in fields) {
    if (!fields[key]) {
      return `${key} is required`;
    }
  }

  return null;
};

export const validateTrustScore = (
  score
) => {
  return score >= 1 && score <= 10;
};