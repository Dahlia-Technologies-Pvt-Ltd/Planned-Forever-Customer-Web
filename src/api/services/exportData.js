import { axios } from "../axios";
import { GET } from "../endpoints";

export const getExportDataList = async (data) => {
  try {
    let response = await axios.get(GET.EXPORT_DATA_LIST, {
      params: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const getDataForExport = async (data) => {
  try {
    let response = await axios.post(GET.DATA_FOR_EXPORTS, data);
    return response;
  } catch (err) {
    throw err;
  }
};
