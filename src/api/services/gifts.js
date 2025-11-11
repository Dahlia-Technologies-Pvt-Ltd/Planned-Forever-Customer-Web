import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getGifts = async (data) => {
  try {
    let response = await axios.get(GET.GET_GIFTS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getGiftReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_GIFT_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addGift = async (data) => {
  try {
    let response = await axios.post(POST.ADD_GIFT, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateGift = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_GIFT}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteGift = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_GIFT}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
