import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getVendorTags = async (data) => {
  try {
    let response = await axios.get(GET.GET_VENDOR_TAGS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addVendorTag= async (data) => {
  try {
    let response = await axios.post(POST.UPDATE_VENDOR_TAGS, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateVendorTag = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_VENDOR_TAGS}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteVendorTag = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_VENDOR_TAG}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
