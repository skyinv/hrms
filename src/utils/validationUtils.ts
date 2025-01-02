export const validatePunchOut = (date: Date) => {
  const minTime = new Date();
  minTime.setHours(18, 30, 0);
  return date >= minTime;
};

export const validateEmployeeData = (data: {
  name: string;
  email: string;
  employeeCode: string;
  password: string;
}) => {
  if (!data.name || !data.email || !data.employeeCode || !data.password) {
    throw new Error('All fields are required');
  }

  if (!data.email.includes('@')) {
    throw new Error('Invalid email format');
  }

  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
};