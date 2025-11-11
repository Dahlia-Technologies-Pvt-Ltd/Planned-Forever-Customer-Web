import { axios } from "../axios";
import { POST } from "../endpoints";

export const loginUser = async (data) => {
  try {
    let response = await axios.post(POST.LOGIN, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const forgotPassword = async (data) => {
  try {
    let response = await axios.post(POST.FORGOT_PASSWORD, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const resetPassword = async (data) => {
  try {
    let response = await axios.post(POST.RESET_PASSWORD, data);
    return response;
  } catch (err) {
    throw err;
  }
};
