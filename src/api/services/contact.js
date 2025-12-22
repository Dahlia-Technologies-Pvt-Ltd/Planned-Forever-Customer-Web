import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getPreference = async (data) => {
  try {
    let response = await axios.get(GET.PREFERENCE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const deleteContactGroup = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_GROUP}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteContactFamily = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_FAMILY}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const AddContact = async (requestData) => {
  try {
    let response = await axios.post(POST.ADD_CONTACT, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};


export const AddBulkContact = async (requestData) => {
  try {
    let response = await axios.post(POST.BULK_INSERT, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};



export const getContactReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_CONTACT_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const contactProfileUpload = async (formData) => {
  try {
    let response = await axios.post(POST.PROFILE_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const AddGroup = async (requestData) => {
  try {
    let response = await axios.post(POST.ADD_GROUP, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const addQuickContact = async (requestData) => {
  try {
    let response = await axios.post(POST.ADD_QUICK_CONTACT, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const GetAllContact = async (data) => {
  try {
    let response = await axios.get(GET.GET_CONTACT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteContact = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_CONTACT}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateContact = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_CONTACT}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const AddFamily = async (requestData) => {
  try {
    let response = await axios.post(POST.ADD_FAMILY, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getFamily = async (data) => {
  try {
    let response = await axios.get(GET.GET_FAMILY , {
      params : data
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getGroup = async (data) => {
  try {
    let response = await axios.get(GET.GET_GROUP , {
      params : data
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getGroupContact = async (id , data) => {
  try {
    let response = await axios.get(`${GET.GET_GROUP_CONTACT}/${id}` ,{
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getGroupContactArrival = async (id , data) => {
  try {
    let response = await axios.get(`${GET.GET_GROUP_CONTACT}/${id}` ,{
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const ImportExcel = async (data) => {
  try {
    let response = await axios.post(POST.IMPORT_EXCEL, data);
    return response.data;
  } catch (err) {
    throw err;
  }
};


export const getColorCodes = async (data) => {
  try {
    let response = await axios.get(GET.GET_COLOR_CODES , {
      params : data
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const AddColorCode = async (requestData) => {
  try {
    let response = await axios.post(POST.ADD_COLOR_CODE, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const deleteContactColorCode = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_COLOR_CODE}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const SendOTP = async (requestData) => {
  try {
    let response = await axios.post(POST.SEND_OTP, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const VerifyOTPAndGetContact = async (requestData) => {
  try {
    let response = await axios.post(POST.VERIFY_OTP_LOGIN, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};