import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getHotels = async (data) => {
  try {
    let response = await axios.get(GET.GET_HOTEL, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getHotelReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_HOTEL_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addHotel = async (data) => {
  try {
    let response = await axios.post(POST.HOTEL, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateHotel = async (id, data) => {
  try {
    let response = await axios.post(`${POST.HOTEL}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteHotel = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_HOTEL}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
