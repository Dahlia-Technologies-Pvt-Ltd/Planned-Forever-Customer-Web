import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getArrivalDeparture = async (data) => {
  try {
    let response = await axios.get(GET.GET_ARRIVAL_DEPARTURE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const SendScheduleInvitation = async (data) => {
  try {
    let response = await axios.post(POST.SEND_SCHEDULE_INVITATION, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const SendArrivalDepartureMessage = async (data) => {
  try {
    let response = await axios.post(POST.SEND_ARRIVAL_DEPARTURE_MESSAGE, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getArrivalDepartureReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_ARRIVAL_DEPARTURE_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addArrivalDeparture = async (data) => {
  try {
    let response = await axios.post(POST.ARRIVAL_DEPARTURE, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateArrivalDeparture = async (id, data) => {
  try {
    let response = await axios.post(`${POST.ARRIVAL_DEPARTURE}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteArrivalDeparture = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_ARRIVAL_DEPARTURE}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const updateArrivalDepartureStatus = async (id) => {
  try {
    let response = await axios.get(`${GET.UPDATE_ARRIVAL_DEPARTURE_STATUS}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const ImportExcel = async (data) => {
  try {
    let response = await axios.post(POST.IMPORT_ARRIVAL_DEPARTURE_EXCEL, data);
    return response.data;
  } catch (err) {
    throw err;
  }
};