import moment from "moment";

// Convert local date to unix date
export const toUTCUnixTimestamp = (date) => {
  return moment(date).utc().valueOf() / 1000;
};

// Convert unix date to local date
export const getLocalDateFromUnixTimestamp = (unixTimestamp, format) => {
  return moment.unix(unixTimestamp).format(format);
};

// Login & Forgot Password Validations
export const validateLoginForm = (formData) => {
  let errors = {};

  if (!formData.email) {
    errors.email = "Required";
  }
  if (!formData.password) {
    errors.password = "Required";
  }

  return errors;
};

// Rest Password Validation
export const validateResetPasswordForm = (formData) => {
  let errors = {};

  if (!formData.password) {
    errors.password = "Required";
  }
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Required";
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Password doesn't match!";
  }

  return errors;
};
