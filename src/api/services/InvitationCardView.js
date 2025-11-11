import { axios } from "../axios";
import { GET, POST } from "../endpoints";

export const getInvitationCardUser = async (data) => {
  try {
    let response = await axios.post(POST.INVITATION_CARD_USER, {
      country_code: data.country_code,
      contact_number: data.contact_number
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};