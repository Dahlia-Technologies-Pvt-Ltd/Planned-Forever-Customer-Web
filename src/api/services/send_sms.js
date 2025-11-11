import { axios } from "../axios";
import { POST } from "../endpoints";

export const sendSMS = async (data) => {
  try {
    let response = await axios.post(POST.SEND_SMS, data);
    return response;
  } catch (err) {
    throw err;
  }
};



