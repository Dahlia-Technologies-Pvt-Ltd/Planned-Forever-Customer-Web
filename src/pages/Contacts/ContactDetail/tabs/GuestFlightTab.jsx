import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import { useMediaQuery } from "react-responsive";
import moment from "moment";
import { Switch } from "@headlessui/react";
import ApiServices from "../../../../api/services";
import { useThemeContext } from "../../../../context/GlobalContext";
import { useSortableData } from "../../../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../../../utilities/lottieAnimations";
import ConfirmationModal from "../../../../components/common/ConfirmationModal";

const GuestFlightTab = ({ data, t }) => {
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel } = useThemeContext();

  // States
  const [allGuestFlights, setAllGuestFlights] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [openWebCheckinModal, setOpenWebCheckinModal] = useState({ open: false, data: null });
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Table sorting
  const { items: flightItems, requestSort: requestFlightSort, sortConfig: flightSortConfig } = useSortableData(allGuestFlights);

  // Table columns - matching the Guest Flights screen with children info
  const flightColumns = [
    t("guestFlight.guestName"),
    t("guestFlight.departureFrom"),
    t("guestFlight.departureAt"),
    t("guestFlight.arrivingAt"),
    t("guestFlight.arrivingOwn"),
    t("guestFlight.flightNo"),
    t("guestFlight.bookingPNR"),
    t("guestFlight.seatNo") || "Seat No",
    t("guestFlight.webCheckin"),
    "Family Details"
  ];

  // Media Queries for pagination
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Toggle row expansion for children details
  const toggleRowExpansion = (itemId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(itemId)) {
      newExpandedRows.delete(itemId);
    } else {
      newExpandedRows.add(itemId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Get Guest Flights for specific user
  const getGuestFlights = async () => {
    if (!data?.uuid) return;

    try {
      setLoading(true);

      let payload = {
        page: currentPage,
        records_no: itemsPerPage,
        type: "Flight",
        event_id: eventSelect,
        user_id: data.uuid, // Filter by user UUID
      };

      const res = await ApiServices.guestFlight.getGuestFlights(payload);
      const { data: responseData, message } = res;

      if (responseData.code === 200) {
        // Filter guest flights for this specific user (additional safety check)
        const userGuestFlights = responseData?.data?.data?.filter((flight) => flight.user_id === data.uuid) || [];

        setAllGuestFlights(userGuestFlights);
        setCurrentPage(responseData?.data?.current_page);
        setTotalPages(Math.ceil(responseData?.data?.total / responseData?.data?.per_page));
      }
    } catch (err) {
      console.error("Error fetching guest flights:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Web Check-in Change
  const handleWebCheckinChange = (item) => {
    setOpenWebCheckinModal({ open: true, data: item });
  };

  // Confirm Web Check-in Change
  const confirmWebCheckinChange = async () => {
    try {
      setBtnLoading(true);

      // Get the current item
      const currentItem = openWebCheckinModal.data;

      // Create the payload with only the web_checkin value toggled
      let payload = {
        web_checkin: currentItem.web_checkin === 1 ? 0 : 1,
      };

      // Use the updateGuestFlight API
      const res = await ApiServices.guestFlight.updateGuestFlight(currentItem.id, payload);
      const { data: responseData, message } = res;

      if (responseData.code === 200) {
        setBtnLoading(false);
        getGuestFlights();
        setOpenWebCheckinModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("guestFlight.webCheckinUpdateSuccess") || "Web check-in status has been updated successfully",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      console.error("Error updating web check-in status:", err);
      setErrorMessage(err.response?.data?.message || "An error occurred while updating web check-in status.");
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
    getGuestFlights();
  }, [data?.uuid, currentPage]);

  return (
    <div className="mt-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              {flightColumns?.map((head) => (
                <th
                  key={head}
                  className="border-b border-gray-100 bg-white p-4 first:pl-6"
                  onClick={() => {
                    if (head === "Family Details") return; // Don't sort by children details
                    
                    let sortKey;
                    if (head === "Guest Name" || head === t("guestFlight.guestName")) {
                      sortKey = "user.first_name";
                    } else if (head === "Departure From" || head === t("guestFlight.departureFrom")) {
                      sortKey = "departure_from";
                    } else if (head === "Departure Date & Time" || head === t("guestFlight.departureAt")) {
                      sortKey = "departure_datetime";
                    } else if (head === "Arriving At" || head === t("guestFlight.arrivingAt")) {
                      sortKey = "arrival_at";
                    } else if (head === "Arrival Date & Time" || head === t("guestFlight.arrivingOwn")) {
                      sortKey = "arrival_datetime";
                    } else if (head === "Flight No" || head === t("guestFlight.flightNo")) {
                      sortKey = "flight_train_no";
                    } else if (head === "Booking PNR" || head === t("guestFlight.bookingPNR")) {
                      sortKey = "booking_pnr";
                    } else if (head === "Web Check-in" || head === t("guestFlight.webCheckin")) {
                      sortKey = "web_checkin";
                    } else {
                      sortKey = head.toLowerCase();
                    }
                    requestFlightSort(sortKey);
                  }}
                >
                  <p className={`font-inter whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm ${head !== "Children Details" ? "cursor-pointer" : ""}`}>
                    {head}
                    {head !== "Children Details" && flightSortConfig.key ===
                      (head === "Guest Name" || head === t("guestFlight.guestName")
                        ? "user.first_name"
                        : head === "Departure From" || head === t("guestFlight.departureFrom")
                          ? "departure_from"
                          : head === "Departure Date & Time" || head === t("guestFlight.departureAt")
                            ? "departure_datetime"
                            : head === "Arriving At" || head === t("guestFlight.arrivingAt")
                              ? "arrival_at"
                              : head === "Arrival Date & Time" || head === t("guestFlight.arrivingOwn")
                                ? "arrival_datetime"
                                : head === "Flight No" || head === t("guestFlight.flightNo")
                                  ? "flight_train_no"
                                  : head === "Booking PNR" || head === t("guestFlight.bookingPNR")
                                    ? "booking_pnr"
                                    : head === "Web Check-in" || head === t("guestFlight.webCheckin")
                                      ? "web_checkin"
                                      : head.toLowerCase()) && flightSortConfig.direction === "asc" ? (
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
                <td colSpan="10">
                  <Skeleton count={5} height={50} />
                </td>
              </tr>
            ) : flightItems.length === 0 ? (
              <tr className="h-[550px] 2xl:h-[400px] 3xl:h-[550px]">
                <td colSpan="10">
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </td>
              </tr>
            ) : (
              <>
                {flightItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {/* Main flight row */}
                    <tr className="cursor-pointer even:bg-gray-50">
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                          {item?.user?.first_name + " " + item?.user?.last_name || "-"}
                        </p>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.departure_from || "-"}</p>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                          {item?.departure_datetime ? moment.unix(item.departure_datetime).format("D MMM YYYY h:mm A") : "-"}
                        </p>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.arrival_at || "-"}</p>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                          {item?.arrival_datetime ? moment.unix(item.arrival_datetime).format("D MMM YYYY h:mm A") : "-"}
                        </p>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.flight_train_no || "-"}</p>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.booking_pnr || "-"}</p>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.seat_no || "-"}</p>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        <div className="flex items-center justify-center gap-x-3">
                          <Switch
                            checked={item?.web_checkin === 1}
                            onChange={() => handleWebCheckinChange(item)}
                            className={`group relative flex h-6 w-12 cursor-pointer rounded-full ${item?.web_checkin === 1 ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item?.web_checkin === 1 ? "translate-x-6" : "translate-x-0"}`}
                            />
                          </Switch>
                        </div>
                      </td>
                      <td className="cursor-pointer py-3 pl-6 pr-4">
                        {item?.children && item.children.length > 0 ? (
                          <button
                            onClick={() => toggleRowExpansion(item.id)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="text-xs 3xl:text-sm mr-1">
                              {item.children.length} {item.children.length === 1 ? 'Family' : 'Family'}
                            </span>
                            {expandedRows.has(item.id) ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 3xl:text-sm">No Family Member</span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Children details row - expanded */}
                    {expandedRows.has(item.id) && item?.children && item.children.length > 0 && (
                      <tr className="bg-blue-50">
                        <td colSpan="10" className="px-6 py-4">
                          <div className="ml-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Children Details:</h4>
                            <div className="grid gap-3">
                              {item.children.map((child, childIndex) => (
                                <div key={child.id} className="bg-white p-3 rounded border border-gray-200">
                                  <div className="grid grid-cols-3 gap-4 text-xs 3xl:text-sm">
                                    <div>
                                      <span className="font-medium text-gray-600">Name: </span>
                                      <span className="text-gray-800">{child.name || "-"}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Booking PNR: </span>
                                      <span className="text-gray-800">{child.booking_pnr || "-"}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Seat No: </span>
                                      <span className="text-gray-800">{child.seat_no || "-"}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </>
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

      {/* Web Check-in Confirmation Modal */}
      <ConfirmationModal
        data={openWebCheckinModal.data}
        isOpen={openWebCheckinModal.open}
        handleSubmit={confirmWebCheckinChange}
        message={t("guestFlight.webCheckinUpdateConf") || "Are you sure you want to update the web check-in status?"}
        setIsOpen={(open) => setOpenWebCheckinModal((prev) => ({ ...prev, open }))}
      />
    </div>
  );
};

export default GuestFlightTab;