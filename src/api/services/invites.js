import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getContactsByGroup = async (data) => {
  try {
    let response = await axios.get(GET.GET_CONTACT_BY_GROUP, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addInvitee = async (data) => {
  try {
    let response = await axios.post(POST.ADD_INVITEE, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateEvent = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_EVENT}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteEvent = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_EVENT}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
