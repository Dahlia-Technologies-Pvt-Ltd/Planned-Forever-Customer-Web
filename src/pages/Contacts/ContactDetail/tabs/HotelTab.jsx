import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import { useMediaQuery } from "react-responsive";
import { Switch } from "@headlessui/react";
import ApiServices from "../../../../api/services";
import { useThemeContext } from "../../../../context/GlobalContext";
import { useSortableData } from "../../../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../../../utilities/lottieAnimations";
import ConfirmationModal from "../../../../components/common/ConfirmationModal";

const HotelTab = ({ data, t }) => {
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel } = useThemeContext();

  // States
  const [allHotelRooms, setAllHotelRooms] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [openStatusModal, setOpenStatusModal] = useState({ open: false, data: null });

  // Table sorting
  const { items: hotelItems, requestSort: requestHotelSort, sortConfig: hotelSortConfig } = useSortableData(allHotelRooms);

  // Table columns - matching the HotelRooms screen
  const hotelColumns = [
    t("hotelRoom.CheckIn"),
    t("hotelRoom.CheckOut"),
    t("hotelRoom.guestName"),
    t("hotelRoom.hotelName"),
    t("hotelRoom.roomType"),
    t("hotelRoom.roomNo"),
    t("hotelRoom.hasCheckedIn"),
  ];

  // Media Queries for pagination
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Hotel Rooms for specific user
  const getHotelRooms = async () => {
    if (!data?.uuid) return;

    try {
      setLoading(true);

      let payload = {
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
        user_id: data.uuid, // Filter by user UUID
      };

      const res = await ApiServices.hotelRoom.getHotelRoom(payload);
      const { data: responseData, message } = res;

      if (responseData.code === 200) {
        // Filter hotel rooms for this specific user (additional safety check)
        const userHotelRooms = responseData?.data?.data?.filter((room) => room.user_id === data.uuid) || [];

        setAllHotelRooms(userHotelRooms);
        setCurrentPage(responseData?.data?.current_page);
        setTotalPages(Math.ceil(responseData?.data?.total / responseData?.data?.per_page));
      }
    } catch (err) {
      console.error("Error fetching hotel rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Status Change
  const handleStatusChange = (item) => {
    setOpenStatusModal({ open: true, data: item });
  };

  // Confirm Status Change
  const confirmStatusChange = async () => {
    try {
      setBtnLoading(true);

      let payload = {
        hasArrived: openStatusModal.data.hasArrived === false ? true : false,
      };

      const res = await ApiServices.hotelRoom.updateHotelRoom(openStatusModal.data.id, payload);
      const { data: responseData, message } = res;

      if (responseData.code === 200) {
        setBtnLoading(false);
        getHotelRooms();
        setOpenStatusModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("hotelRoom.statusUpdateSuccess") || "Hotel Room status has been updated successfully",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      console.error("Error updating hotel room status:", err);
      setErrorMessage(err.response?.data?.message || "An error occurred while updating hotel room status.");
    } finally {
      setBtnLoading(false);
    }
  };

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    getHotelRooms();
  }, [data?.uuid, currentPage]);

  return (
    <div className="mt-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              {hotelColumns?.map((head) => (
                <th
                  key={head}
                  className="border-b border-gray-100 bg-white p-4 first:pl-6"
                  onClick={() => {
                    let sortKey;
                    if (head === "Check In" || head === t("hotelRoom.CheckIn")) {
                      sortKey = "check_in";
                    } else if (head === "Check Out" || head === t("hotelRoom.CheckOut")) {
                      sortKey = "check_out";
                    } else if (head === "Guest Name" || head === t("hotelRoom.guestName")) {
                      sortKey = "user.first_name";
                    } else if (head === "Hotel Name" || head === t("hotelRoom.hotelName")) {
                      sortKey = "hotel.name";
                    } else if (head === "Room Type" || head === t("hotelRoom.roomType")) {
                      sortKey = "room.room_type";
                    } else if (head === "Room No" || head === t("hotelRoom.roomNo")) {
                      sortKey = "room.room_no";
                    } else if (head === "Has Checked In" || head === t("hotelRoom.hasCheckedIn")) {
                      sortKey = "hasArrived";
                    } else {
                      sortKey = head.toLowerCase();
                    }
                    requestHotelSort(sortKey);
                  }}
                >
                  <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                    {head}
                    {hotelSortConfig.key ===
                      (head === "Check In" || head === t("hotelRoom.CheckIn")
                        ? "check_in"
                        : head === "Check Out" || head === t("hotelRoom.CheckOut")
                          ? "check_out"
                          : head === "Guest Name" || head === t("hotelRoom.guestName")
                            ? "user.first_name"
                            : head === "Hotel Name" || head === t("hotelRoom.hotelName")
                              ? "hotel.name"
                              : head === "Room Type" || head === t("hotelRoom.roomType")
                                ? "room.room_type"
                                : head === "Room No" || head === t("hotelRoom.roomNo")
                                  ? "room.room_no"
                                  : head === "Has Checked In" || head === t("hotelRoom.hasCheckedIn")
                                    ? "hasArrived"
                                    : head.toLowerCase()) && hotelSortConfig.direction === "asc" ? (
                      <ChevronUpIcon className="ml-1 inline-block h-4 w-3.5" />
                    ) : (
                      <ChevronDownIcon className="ml-1 inline-block h-4 w-3.5" />
                    )}
                  </p>
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
            ) : hotelItems.length === 0 ? (
              <tr className="h-[550px] 2xl:h-[400px] 3xl:h-[550px]">
                <td colSpan="7">
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </td>
              </tr>
            ) : (
              hotelItems.map((item, index) => (
                <tr key={index} className="cursor-pointer even:bg-gray-50">
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                      {item?.check_in ? moment.unix(item.check_in).format("D MMM YYYY") : "-"}
                    </p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                      {item?.check_out ? moment.unix(item.check_out).format("D MMM YYYY") : "-"}
                    </p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                      {item?.child === null ? item?.user?.first_name + " " + item?.user?.last_name : item?.child?.name || "-"}
                    </p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.hotel?.name || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.room?.room_type || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.room?.room_no || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <div className="flex items-center justify-center gap-x-3">
                      <Switch
                        checked={item?.hasArrived === true}
                        onChange={() => handleStatusChange(item)}
                        className={`group relative flex h-6 w-12 cursor-pointer rounded-full ${item?.hasArrived === true ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item?.hasArrived === true ? "translate-x-6" : "translate-x-0"}`}
                        />
                      </Switch>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <ReactPaginate
            breakLabel="..."
            pageRangeDisplayed={5}
            marginPagesDisplayed={2}
            activeClassName="active"
            nextClassName="item next"
            renderOnZeroPageCount={null}
            breakClassName="item break-me"
            containerClassName="pagination"
            previousClassName="item previous"
            pageCount={totalPages}
            pageClassName="item pagination-page"
            forcePage={currentPage - 1}
            onPageChange={handlePageChange}
            nextLabel={<ChevronRightIcon className="h-5 w-5" />}
            previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Status Confirmation Modal */}
      <ConfirmationModal
        data={openStatusModal.data}
        isOpen={openStatusModal.open}
        handleSubmit={confirmStatusChange}
        message={t("hotelRoom.statusUpdateConf") || "Are you sure you want to change the status of this hotel room?"}
        setIsOpen={(open) => setOpenStatusModal((prev) => ({ ...prev, open }))}
      />
    </div>
  );
};

export default HotelTab;