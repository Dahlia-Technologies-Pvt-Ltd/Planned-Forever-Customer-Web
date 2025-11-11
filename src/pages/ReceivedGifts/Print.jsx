import Lottie from "react-lottie";
import { EVENTS, RECEIVED_GIFTS } from "../../routes/Names";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/common/Button";
import React, { useEffect, useRef, useState } from "react";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";


const ReceviedGiftPrint = () => {
  // translation
  const { t } = useTranslation("common");

  const { eventSelect, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allReceivedGiftList, setAllReceivedGiftList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  //   Get Menu List to Print
  const getReceviedgiftListToPrint = async (type) => {
    let payload = {
      type,
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.receivedGift.getReceviedgiftReport(payload);
      if (result.data.code === 200) {
        setAllReceivedGiftList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReceviedgiftListToPrint();
  }, []);

  // Table headers with translations
  const TABLE_HEAD = [t("receivedGifts.receivedGift"), t("receivedGifts.receivedGiftFrom"), t("receivedGifts.receivedOn"), t("receivedGifts.thankYouNoteSentTo"), t("receivedGifts.thankYouNoteSentOn")];

  const PrintableEventList = React.forwardRef(({ allReceivedGiftList, loading, TABLE_HEAD }, ref) => (
    <div ref={ref} className="printableEventList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th className="border-b border-gray-100 bg-white p-4 first:pl-6">
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allReceivedGiftList && allReceivedGiftList.length > 0 ? (
            allReceivedGiftList.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.gift_received || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {item?.contact?.first_name + " " + item?.contact?.last_name || "-"}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${moment.unix(item?.received_on).format("D MMM YYYY")}`}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {item?.contact?.first_name + " " + item?.contact?.last_name}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${moment.unix(item?.note_send_at).format("D MMM YYYY")}`}</p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="6">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <>
      {/* Back navigation */}
      <div onClick={() => navigate(RECEIVED_GIFTS)} className="mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline">
        <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
        <span>{t("receivedGifts.backToReceivedGiftList")}</span>
      </div>

      <div className="card min-h-[76vh]">
        {/* Page title */}
        <h3 className="heading">{t("receivedGifts.printReceivedGifts")}</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableEventList ref={componentRef} allReceivedGiftList={allReceivedGiftList} loading={loading} TABLE_HEAD={TABLE_HEAD} />
          </div>
        </div>

        {/* Print button */}
        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default ReceviedGiftPrint;
