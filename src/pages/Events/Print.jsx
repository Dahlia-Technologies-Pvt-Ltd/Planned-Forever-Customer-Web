import moment from "moment";
import Lottie from "react-lottie";
import { EVENTS } from "../../routes/Names";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/common/Button";
import React, { useEffect, useRef, useState } from "react";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const EventPrint = () => {
  const { t: commonT } = useTranslation("common");
  
  const { userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allEventList, setAllEventList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  //   Get Menu List to Print
  const getEventListToPrint = async (type) => {
    let payload = {
      type,
    };
    try {
      setLoading(true);
      const result = await ApiServices.events.getEventReport(payload);
      if (result.data.code === 200) {
        setAllEventList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEventListToPrint();
  }, []);

  const PrintableEventList = React.forwardRef(({ allEventList, loading }, ref) => (
    <div ref={ref} className="printableEventList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD_EVENT.map((head) => (
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
          ) : allEventList && allEventList.length > 0 ? (
            allEventList.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${moment.unix(item?.start_date).format("D MMM YYYY hh:mm A")} `}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${moment.unix(item?.end_date).format("D MMM YYYY hh:mm A")}`}</p>
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
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Events")) && (
        <div onClick={() => navigate(EVENTS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span> Back to Event list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Event</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableEventList ref={componentRef} allEventList={allEventList} loading={loading} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={commonT('buttons.print')} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default EventPrint;

const TABLE_HEAD_EVENT = ["Event Name", "Event Start Date & Time", "Event End Date & Time"];
