import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getMenus = async (data) => {
  try {
    let response = await axios.get(GET.GET_MENU, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};


export const getTrendingMenus = async (data) => {
  try {
    let response = await axios.get(GET.GET_TRENDING_MENU, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getMenuType = async (data) => {
  try {
    let response = await axios.get(GET.GET_MENU_TYPE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getTasteProfile = async (data) => {
  try {
    let response = await axios.get(GET.GET_TASTE_PROFILE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getCuisine = async (data) => {
  try {
    let response = await axios.get(GET.GET_CUISINE, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getPreferenceCount = async (id, data) => {
  try {
    let response = await axios.get(`${GET.GET_PREFERENCE_COUNT}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getMenuReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_MENU_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addMenu = async (data) => {
  try {
    let response = await axios.post(POST.MENU, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateMenu = async (id, data) => {
  try {
    let response = await axios.post(`${POST.MENU}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteMenu = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_MENU}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getCeremonyMenus = async (data) => {
  try {
    let response = await axios.get(GET.GET_CEREMONY_MENU_ITEM, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};
export const getCeremonyTrendingMenus = async (data) => {
  try {
    let response = await axios.get(GET.GET_CEREMONY_TRENDING_MENU_ITEM, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};