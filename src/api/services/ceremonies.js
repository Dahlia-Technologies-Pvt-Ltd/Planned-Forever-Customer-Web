import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getCeremonies = async (data) => {
  try {
    let response = await axios.get(GET.GET_CEREMONY, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const getActions = async (data) => {
  try {
    let response = await axios.get(GET.GET_ACTIONS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getVenueById = async (id , data) => {
  try {
    let response = await axios.get(`${GET.GET_VENUE_BY_ID}/${id}`, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addAction = async (data) => {
  try {
    let response = await axios.post(POST.ADD_ACTIONS, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const getCeremonyReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_CEREMONY_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addCeremony = async (data) => {
  try {
    let response = await axios.post(POST.ADD_CEREMONY, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateCeremony = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_CEREMONY}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteCeremony = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_CEREMONY}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getCeremoniesReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_CEREMONY_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};