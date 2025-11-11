import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getSubCategory = async (data) => {
  try {
    let response = await axios.get(GET.GET_SUB_CATEGORY, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getSubCategoryByCategory = async (id, payload) => {
  try {
    let response = await axios.get(`${GET.GET_BY_CATEGORY}/${id}`, {
      params: payload,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addSubCategory = async (data) => {
  try {
    let response = await axios.post(POST.POST_SUB_CATEGORY, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateSubCategory = async (id, data) => {
  try {
    let response = await axios.post(`${POST.POST_SUB_CATEGORY}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteSubCategory = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_SUB_CATEGORY}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
