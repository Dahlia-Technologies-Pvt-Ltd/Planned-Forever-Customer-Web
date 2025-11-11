import { data } from "autoprefixer";
import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getVenues = async (data) => {
  try {
    let response = await axios.get(GET.GET_VENUE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const getVenuesList = async (data) => {
  try {
    let response = await axios.get(GET.GET_RECOMMANDED_VENUE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getVenueByEvent = async (data) => {
  try {
    let response = await axios.get(GET.HELD_AT , {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getVenueReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_VENUE_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addVenue = async (data) => {
  try {
    let response = await axios.post(POST.ADD_VENUE, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateVenue = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_VENUE}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteVenue = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_VENUE}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
