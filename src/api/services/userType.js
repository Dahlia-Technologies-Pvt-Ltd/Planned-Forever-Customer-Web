import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const AddUserType = async (data) => {
  try {
    let response = await axios.post(POST.ADD_USER_TYPE, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const GetAllUserType = async (data) => {
  try {
    let response = await axios.get(GET.GET_USER_TYPE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const UpdateUserType = async (id,data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_USER_TYPE}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};


export const deleteUserType = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_USER_TYPE}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};