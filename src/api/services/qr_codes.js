import { axios, qrCodesAxios } from "../axios"; 
import { DELETE, GET, POST } from "../endpoints";


export const assignBulkQrCodes = async (data) => {
  try {
    let response = await qrCodesAxios.post(POST.BULK_QR_CODES_ASSIGN, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const userCounts = async (data) => {
  try {
    let response = await qrCodesAxios.post(POST.USER_COUNTS, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getUserAssignedQrCodesList = async () => {
  try {
    let response = await qrCodesAxios.post(POST.USER_ASSIGN_QR_CODE);
    return response;
  } catch (err) {
    throw err;
  }
};

export const registerSubscriber = async (data) => {
  try {
    let response = await qrCodesAxios.post(POST.REGISTER_SUBSCRIBER, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const registerQrSubscriber = async (data) => {
  try {
    let response = await axios.post(POST.REGISTER_QR_SUBSCRIBER, data);
    return response;
  } catch (err) {
    throw err;
  }
};
