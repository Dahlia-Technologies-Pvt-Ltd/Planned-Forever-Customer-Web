import moment from "moment";
import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import { CARS, HOTELS } from "../../routes/Names";
import Button from "../../components/common/Button";
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const HotelPrint = () => {
  const { t } = useTranslation("common");
  // Table Head
  const TABLE_HEAD = [t("hotels.hotelName"), t("hotels.roomType"), t("hotels.rooms"), t("hotels.fromDate"), t("hotels.toDate"), t("headings.notes")];

  const { eventSelect, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allHotelList, setAllHotelList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getHotelListToPrint = async () => {
    let payload = {
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.hotels.getHotelReport(payload);
      if (result.data.code === 200) {
        setAllHotelList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHotelListToPrint();
  }, []);

  const PrintableHotelsList = React.forwardRef(({ allHotelList, loading }, ref) => (
    <div ref={ref} className="printableHotelsList pr-2">
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
          ) : allHotelList?.length > 0 ? (
            allHotelList?.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name || "-"}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.room_type || "-"}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.room_no || "-"}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{moment.unix(item?.check_in).format("D MMM YYYY")}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{moment.unix(item?.check_out).format("D MMM YYYY")}</p>
                </td>

                <td className="max-w-52 py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.notes || "-"}</p>
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
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Hotels")) && (
        <div onClick={() => navigate(HOTELS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span>{t("hotels.backToHotelList")}</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Hotels</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto  overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableHotelsList ref={componentRef} allHotelList={allHotelList} loading={loading} />
          </div>
        </div>

        {allHotelList?.length > 0 && (
          <div className="mt-4 flex items-center justify-end">
            <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
          </div>
        )}
      </div>
    </>
  );
};

export default HotelPrint;
