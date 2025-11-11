import { axios } from "../axios";
import { GET, POST } from "../endpoints";

export const getInvitationCards = async (data) => {
  try {
    let response = await axios.get(GET.INVITATION_CARDS, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getInvitationCardReport = async (data) => {
  try {
    let response = await axios.get(GET.GET_INVITATION_CARD_REPORT, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const addInvitationCard = async (data) => {
  try {
    let response = await axios.post(POST.ADD_INVITATION_CARD, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const updateInvitationCard = async (id, data) => {
  try {
    let response = await axios.post(`${POST.ADD_INVITATION_CARD}/${id}`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteInvitationCard = async (id) => {
  try {
    let response = await axios.delete(`${POST.ADD_INVITATION_CARD}/${id}`);
    return response;
  } catch (err) {
    throw err;
  }
};


export const getInvitationCardReportUser = async (data) => {
  try {
    let response = await axios.post(POST.INVITATION_CARD_REPORT_USER,data)
    return response;
  } catch (err) {
    throw err;
  }
};