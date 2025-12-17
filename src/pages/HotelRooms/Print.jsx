import Lottie from "react-lottie";
import { EVENTS, HOTELROOM, RECEIVED_GIFTS } from "../../routes/Names";
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

const HotelRoomsPrint = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [
    t("hotelRoom.guestName"),
    t("Number"),
    t("hotelRoom.hotelName"),
    t("hotelRoom.roomNo"),
    t("hotelRoom.roomType"),
    t("hotelRoom.CheckIn"),
    t("hotelRoom.CheckOut"),
  ];

  const { eventSelect, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allHotelRoomsList, setAllHotelRoomsList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Get Hotel Room List to Print - Using the same API as the main component
  const getHotelRoomsListToPrint = async () => {
    try {
      setLoading(true);

      let payload = {
        search: "",
        page: 1,
        records_no: 1000, // Get all records for printing
        event_id: eventSelect,
      };

      const res = await ApiServices.hotelRoom.getHotelRoom(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllHotelRoomsList(data.data.data);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHotelRoomsListToPrint();
  }, []);

  const PrintableHotelRoomList = React.forwardRef(({ allHotelRoomsList, loading }, ref) => (
    <div ref={ref} className="printableEventList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th key={head} className="border-b border-gray-100 bg-white p-4 first:pl-6">
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allHotelRoomsList && allHotelRoomsList.length > 0 ? (
            allHotelRoomsList.map((item, index) => (
              <tr key={item?.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {item?.child === null ? item?.user?.first_name + " " + item?.user?.last_name : item?.child?.name}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {item?.child === null ? item?.user?.contact_number?.[0] : item?.child?.contact_number?.[0] || "-"}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.hotel?.name || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.room?.room_no || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.room?.room_type || "-"}</p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {moment.unix(item?.check_in).format("D MMM YYYY h:mm A") || "-"}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {moment.unix(item?.check_out).format("D MMM YYYY h:mm A") || "-"}
                  </p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="7">
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
      {(userData?.role?.display_name === "web_admin" || userData?.role?.permissions?.includes("hotel-room-read")) && (
        <div onClick={() => navigate(HOTELROOM)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span>Back to Hotel Rooms list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Hotel Rooms</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableHotelRoomList ref={componentRef} allHotelRoomsList={allHotelRoomsList} loading={loading} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default HotelRoomsPrint;