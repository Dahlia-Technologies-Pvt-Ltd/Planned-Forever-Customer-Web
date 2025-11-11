import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getCustomFieldLibrary = async (data) => {
  try {
    let response = await axios.get(GET.GET_CUSTOM_FIELD_LIBRARY, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addCustomFieldLibrary  = async (data) => {
  try {
    let response = await axios.post(POST.CUSTOM_FIELD_LIBRARY, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateCustomFieldLibrary  = async (id, data) => {
  try {
    let response = await axios.post(`${POST.CUSTOM_FIELD_LIBRARY}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteCustomFiledLibrary  = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_CUSTOM_FIELD_LIBRARY}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
