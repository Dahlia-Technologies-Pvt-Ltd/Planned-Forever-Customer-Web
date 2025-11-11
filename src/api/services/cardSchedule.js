import { axios } from "../axios";
import { GET, POST, DELETE } from "../endpoints";

export const getScheduleInvitationList = async (data) => {
  try {
    let response = await axios.get(GET.SEND_SCHEDULE_INVITATION_LIST, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const SendScheduleInvitation = async (data) => {
  try {
    let response = await axios.post(POST.SEND_SCHEDULE_INVITATION, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateScheduleInvitation = async (id, data) => {
  try {
    let response = await axios.post(`${POST.UPDATE_SEND_SCHEDULE_INVITATION}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteScheduleInvitation = async (id) => {
  try {
    let response = await axios.delete(`${DELETE.DELETE_CARD_INVITATION}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};
