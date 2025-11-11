import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getCategory = async (data) => {
  try {
    let response = await axios.get(GET.GET_CATEGORY, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addCategory = async (data) => {
  try {
    let response = await axios.post(POST.POST_CATEGORY, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateCategory = async (id, data) => {
  try {
    let response = await axios.post(`${POST.POST_CATEGORY}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteCategory = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_CATEGORY}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
