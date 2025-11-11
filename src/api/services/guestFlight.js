import { axios } from "../axios";
import { GET, POST, DELETE, PUT } from "../endpoints";

export const getGuestFlights = async (data) => {
  try {
    let response = await axios.get(GET.GET_GUEST_FLIGHTS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getGuestFlightReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_GUEST_FLIGHT_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addGuestFlight = async (data) => {
  try {
    let response = await axios.post(POST.GUEST_FLIGHT, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateGuestFlight = async (id, data) => {
  try {
    let response = await axios.put(`${PUT.GUEST_FLIGHT}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteGuestFlight = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_GUEST_FLIGHT}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateGuestFlightWebCheckin = async (id) => {
  try {
    let response = await axios.get(`${GET.UPDATE_GUEST_FLIGHT_WEB_CHECKIN}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const ImportExcel = async (data) => {
  try {
    let response = await axios.post(POST.IMPORT_GUEST_FLIGHT_EXCEL, data);
    return response.data;
  } catch (err) {
    throw err;
  }
};