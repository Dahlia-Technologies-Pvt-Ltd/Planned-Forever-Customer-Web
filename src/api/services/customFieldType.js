import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getCustomFieldType = async (data) => {
  try {
    let response = await axios.get(GET.GET_CUSTOM_FIELD_TYPE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addCustomFieldType = async (data) => {
  try {
    let response = await axios.post(POST.CUSTOM_FIELD_TYPE, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateCustomFieldType = async (id, data) => {
  try {
    let response = await axios.post(`${POST.CUSTOM_FIELD_TYPE}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteCustomFiledType = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_CUSTOM_FIELD_TYPE}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
