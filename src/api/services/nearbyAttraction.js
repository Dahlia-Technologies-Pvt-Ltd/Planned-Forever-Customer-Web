import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getNearbyAttractionList = async (data) => {
  try {
    let response = await axios.get(GET.GET_NEARBY_ATTRACTIONS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addNearbyAttraction = async (data) => {
  try {
    let response = await axios.post(POST.ADD_NEARBY_ATTRACTIONS, data);
    return response;
  } catch (err) {
    throw err;
  }
};


export const addLiveEvent = async (data) => {
    try {
      let response = await axios.post(POST.CREATE_LIVE_EVENT, data);
      return response;
    } catch (err) {
      throw err;
    }
  };

export const updateNearbyAttraction = async (id, data) => {
  try {
    let response = await axios.post(`${POST.ADD_NEARBY_ATTRACTIONS}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteNearbyAttraction = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_NEARBY_ATTRACTIONS}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
