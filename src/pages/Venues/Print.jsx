import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import { VENUES } from "../../routes/Names";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/common/Button";
import React, { useEffect, useRef, useState } from "react";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const VenuePrint = () => {
  // translation
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD_VENUE = [
    t("venues.venueName"),
    t("venues.city"),
    t("venues.state"),
    t("venues.country"),
    t("venues.pin"),
    t("Timezone"),
    t("venues.venueAddress"),
    t("venues.contactPerson"),
    t("venues.countryCode"),
    t("Phone Number"),
  ];

  const { eventSelect, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allVenueList, setAllVenueList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  //   Get Menu List to Print
  const getVenueListToPrint = async (type) => {
    let payload = {
      type,
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.venues.getVenueReport(payload);
      if (result.data.code === 200) {
        setAllVenueList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVenueListToPrint();
  }, []);

  const PrintableVenueList = React.forwardRef(({ allVenueList, loading }, ref) => (
    <div ref={ref} className="pr-2 printableVenueList">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD_VENUE.map((head) => (
              <th className="p-4 bg-white border-b border-gray-100 first:pl-6">
                <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="10">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allVenueList && allVenueList.length > 0 ? (
            allVenueList.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pr-4 pl-6">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.name || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.city || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.state || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.country || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.pin || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.time_zone || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.address || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.contact_person_name || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.contact_numbers[0]?.country_code || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.contact_numbers?.[0]?.mobile || "-"}</p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="10">
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
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Venues")) && (
        <div onClick={() => navigate(VENUES)} className={`flex mb-5 text-base font-medium cursor-pointer text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 w-4 h-6 text-secondary" />
          <span> Back to Venue list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Venue</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden">
          <div className="overflow-x-auto -mx-6 mb-8">
            <PrintableVenueList ref={componentRef} allVenueList={allVenueList} loading={loading} />
          </div>
        </div>

        <div className="flex justify-end items-center mt-4">
          <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default VenuePrint;
