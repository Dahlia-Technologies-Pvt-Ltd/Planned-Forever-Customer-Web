import { axios } from "../axios";
import { GET, POST, DELETE, PUT } from "../endpoints";

export const getHotelRooms = async (data) => {
  try {
    let response = await axios.get(GET.GET_SETUP_ROOM, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const createHotelRoom = async (data) => {
  try {
    let response = await axios.post(POST.SETUP_ROOM, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateHotelRoom = async (id, data) => {
  try {
    let response = await axios.post(`${POST.SETUP_ROOM}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteHotelRoom = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_SETUP_ROOM}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const ImportExcel = async (data) => {
  try {
    let response = await axios.post(POST.IMPORT_HOTEL_ROOM_EXCEL, data);
    return response.data;
  } catch (err) {
    throw err;
  }
};