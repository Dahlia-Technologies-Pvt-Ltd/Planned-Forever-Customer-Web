import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getFurtherClassification = async (data) => {
  try {
    let response = await axios.get(GET.GET_FURTHER_CLASSIFICATION, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addFurtherClassification = async (data) => {
  try {
    let response = await axios.post(POST.POST_FURTHER_CLASSIFICATION, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const addFurtherClassificationByIds = async (data) => {
  try {
    let response = await axios.get(GET.POST_FURTHER_CLASSIFICATION_BY_IDS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateFurtherClassification = async (id, data) => {
  try {
    let response = await axios.post(`${POST.POST_FURTHER_CLASSIFICATION}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteFurtherClassification = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_FURTHER_CLASSIFICATION}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
