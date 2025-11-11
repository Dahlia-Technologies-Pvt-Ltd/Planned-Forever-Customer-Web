import { axios } from "../axios";
import { GET, POST } from "../endpoints";

export const doubleTicksList = async (data) => {
  try {
    let response = await axios.get(GET.GET_DOUBLE_TICK_LIST, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const templateList = async (data) => {
    try {
      let response = await axios.get(GET.GET_TEMPLATE_LISTS, {
        params: data,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };


  export const sendTemplate = async (data) => {
    try {
      let response = await axios.post(POST.SEND_TEMPLATES, data);
      return response;
    } catch (err) {
      throw err;
    }
  };