import { axios } from "../axios";
import { GET, POST } from "../endpoints";

export const sendEmail = async (data) => {
  try {
    let response = await axios.post(POST.SEND_EMAIL, data);
    return response;
  } catch (err) {
    throw err;
  }
};
