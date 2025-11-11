import { axios } from "../axios";
import { GET, POST, DELETE, PUT } from "../endpoints";

export const getGuestTrains = async (data) => {
  try {
    let response = await axios.get(GET.GET_GUEST_TRAINS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getGuestTrainReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_GUEST_TRAIN_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addGuestTrain = async (data) => {
  try {
    let response = await axios.post(POST.GUEST_TRAIN, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateGuestTrain = async (id, data) => {
  try {
    let response = await axios.put(`${PUT.GUEST_TRAIN}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteGuestTrain = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_GUEST_TRAIN}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const ImportExcel = async (data) => {
  try {
    let response = await axios.post(POST.IMPORT_GUEST_TRAIN_EXCEL, data);
    return response.data;
  } catch (err) {
    throw err;
  }
};