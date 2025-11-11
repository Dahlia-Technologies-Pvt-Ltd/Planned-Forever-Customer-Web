import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getSamagri = async (data) => {
  try {
    let response = await axios.get(GET.GET_SAMAGRI, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getSamagriReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_SAMAGRI_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const getSamagriList = async (data) => {
  try {
    let response = await axios.get(GET.GET_RECOMMANDED_SAMAGRI, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addSamagri = async (data) => {
  try {
    let response = await axios.post(POST.ADD_SAMAGRI, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateSamagri = async (id, data) => {
  try {
    let response = await axios.post(`${POST.ADD_SAMAGRI}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteSamagri = async (id) => {
  try {
    let response = await axios.delete(`${POST.ADD_SAMAGRI}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const updateSamagrListItem = async (id) => {
  try {
    let response = await axios.get(`${GET.UPDATE_SAMAGRI_LIST}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
