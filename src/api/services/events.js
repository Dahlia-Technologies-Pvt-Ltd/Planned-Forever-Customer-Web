import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getEvents = async (data) => {
  try {
    let response = await axios.get(GET.GET_EVENTS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getEventReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_EVENT_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getEventStatsById = async (id, data) => {
  try {
    let response = await axios.get(`${GET.GET_EVENT_STATS}/${id}`, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addEvent = async (data) => {
  try {
    let response = await axios.post(POST.ADD_EVENT, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateEvent = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_EVENT}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteEvent = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_EVENT}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
