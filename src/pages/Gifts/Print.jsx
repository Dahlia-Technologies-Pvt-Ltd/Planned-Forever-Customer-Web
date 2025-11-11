import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import { GIFTS, VENUES } from "../../routes/Names";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/common/Button";
import React, { useEffect, useRef, useState } from "react";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import Badge from "../../components/common/Badge";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const GiftPrint = () => {
  // translation
  const { t } = useTranslation("common");

  // table head
  const TABLE_HEAD_GIFT = [t("gift.giftName"), t("gift.giftValue"), t("gift.tags"), t("headings.notes")];

  const { eventSelect, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allGiftList, setAllGiftList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  //   Get Menu List to Print
  const getGiftListToPrint = async () => {
    let payload = {
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.gifts.getGiftReport(payload);
      if (result.data.code === 200) {
        setAllGiftList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGiftListToPrint();
  }, []);

  const PrintableGiftList = React.forwardRef(({ allGiftList, loading }, ref) => (
    <div ref={ref} className="printableGiftList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD_GIFT.map((head) => (
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
          ) : allGiftList && allGiftList.length > 0 ? (
            allGiftList.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.value || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  {item?.tags && item.tags.length > 0 ? (
                    item.tags.map((tag, index) => (
                      <span key={index}>
                        <Badge title={tag} />
                      </span>
                    ))
                  ) : (
                    <span className="text-primary-color-200 text-xs font-normal 3xl:text-sm">-</span>
                  )}
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.description || "-"}</p>
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
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Gifts")) && (
        <div onClick={() => navigate(GIFTS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span>{t("backToGiftList")}</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">{t("printGift")}</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden ">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableGiftList ref={componentRef} allGiftList={allGiftList} loading={loading} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default GiftPrint;
