import { axios } from "../axios";
import { GET, POST } from "../endpoints";

export const getContactGroup = async (data) => {
  try {
    let response = await axios.get(GET.GET_CONTACT_GROUP, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const sendGreetings = async (data) => {
  try {
    let response = await axios.post(POST.SEND_GREETINGS, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateGreetings = async (id, data) => {
  try {
    let response = await axios.post(`${POST.ADD_SAMAGRI}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};
