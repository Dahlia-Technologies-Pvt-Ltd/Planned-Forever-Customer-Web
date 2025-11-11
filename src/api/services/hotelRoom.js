import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getHotelById= async (id) => {
  try {
    let response = await axios.get(`${GET.GET_HOTEL}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getHotelRoom = async (data) => {
  try {
    let response = await axios.get(GET.GET_HOTEL_ROOM, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addHotelRoom = async (data) => {
  try {
    let response = await axios.post(POST.HOTEL_ROOM, data);
    return response;
  } catch (err) {
    throw err;
  }
};
export const addBulkHotelRoom = async (data) => {
  try {
    let response = await axios.post(POST.HOTEL_ROOM_BULK, data);
    return response;
  } catch (err) {
    throw err;
  }
};
export const updateHotelRoom = async (id, data) => {
  try {
    let response = await axios.post(`${POST.HOTEL_ROOM}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteHotelRoom = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_HOTEL_ROOM}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getHotelRoomsReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_HOTEL_ROOMS_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const updateHotelRoomStatus = async (id) => {
  try {
    let response = await axios.get(`${GET.UPDATE_HOTEL_ROOM}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getRoomTypeByHotel = async (id) => {
  try {
    let response = await axios.get(`${GET.ROOM_TYPE_BY_HOTEL}/${id}/room-types`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getRoomsByHotelAndRoomType = async (data) => {
  try {
    let response = await axios.get(GET.GET_ROOM_BY_HOTEL_AND_ROOM_TYPE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};
