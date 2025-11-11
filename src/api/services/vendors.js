import { axios } from "../axios";
import { GET, POST , DELETE } from "../endpoints";

export const getVendors = async (data) => {
  try {
    let response = await axios.get(GET.GET_VENDOR, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getRecommandedVendors = async (data) => {
  try {
    let response = await axios.get(GET.GET_RECOMMANDED_VENDOR, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getVendorReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_VENDOR_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addVendor = async (data) => {
  try {
    let response = await axios.post(POST.ADD_VENDOR, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateVendor = async (id, data) => {
  try {
    let response = await axios.post(`${POST.ADD_VENDOR}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};


export const addRecommandedVendor = async (data) => {
  try {
    let response = await axios.post(POST.ADD_RECOMMANDED_VENDOR, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateRecommandedVendor = async (id, data) => {
  try {
    let response = await axios.post(`${POST.ADD_RECOMMANDED_VENDOR}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteVendor = async (id) => {
  try {
    let response = await axios.delete(`${POST.ADD_VENDOR}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteRecommandedVendor = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_RECOMMANDED_VENDOR}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
