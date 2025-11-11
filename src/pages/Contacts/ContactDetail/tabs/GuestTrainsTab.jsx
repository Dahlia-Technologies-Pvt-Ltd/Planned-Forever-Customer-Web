import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import { useMediaQuery } from "react-responsive";
import moment from "moment";
import ApiServices from "../../../../api/services";
import { useThemeContext } from "../../../../context/GlobalContext";
import { useSortableData } from "../../../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../../../utilities/lottieAnimations";

const GuestTrainsTab = ({ data, t }) => {
  const { eventSelect, loading, setLoading } = useThemeContext();

  // States
  const [allGuestTrains, setAllGuestTrains] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Table sorting
  const { items: trainItems, requestSort: requestTrainSort, sortConfig: trainSortConfig } = useSortableData(allGuestTrains);

  // Table columns - matching the Guest Trains screen with children info
  const trainColumns = [
    t("guestTrain.guestName"),
    t("guestTrain.departureFrom"),
    t("guestTrain.departureAt"),
    t("guestTrain.arrivingAt"),
    t("guestTrain.arrivingOwn"),
    t("guestTrain.trainNo"),
    t("guestTrain.bookingPNR"),
    t("guestTrain.seatNo"),
    t("guestTrain.boogieNo"),
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

  // Get Guest Trains for specific user
  const getGuestTrains = async () => {
    if (!data?.uuid) return;

    try {
      setLoading(true);

      let payload = {
        page: currentPage,
        records_no: itemsPerPage,
        type: "Train",
        event_id: eventSelect,
        user_id: data.uuid, // Filter by user UUID
      };

      const res = await ApiServices.guestTrain.getGuestTrains(payload);
      const { data: responseData, message } = res;

      if (responseData.code === 200) {
        // Filter guest trains for this specific user (additional safety check)
        const userGuestTrains = responseData?.data?.data?.filter((train) => train.user_id === data.uuid) || [];

        setAllGuestTrains(userGuestTrains);
        setCurrentPage(responseData?.data?.current_page);
        setTotalPages(Math.ceil(responseData?.data?.total / responseData?.data?.per_page));
      }
    } catch (err) {
      console.error("Error fetching guest trains:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    getGuestTrains();
  }, [data?.uuid, currentPage]);

  return (
    <div className="mt-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              {trainColumns?.map((head) => (
                <th
                  key={head}
                  className="border-b border-gray-100 bg-white p-4 first:pl-6"
                  onClick={() => {
                    if (head === "Family Details") return; // Don't sort by children details
                    
                    let sortKey;
                    if (head === "Guest Name" || head === t("guestTrain.guestName")) {
                      sortKey = "user.first_name";
                    } else if (head === "Departure From" || head === t("guestTrain.departureFrom")) {
                      sortKey = "departure_from";
                    } else if (head === "Departure Date & Time" || head === t("guestTrain.departureAt")) {
                      sortKey = "departure_datetime";
                    } else if (head === "Arriving At" || head === t("guestTrain.arrivingAt")) {
                      sortKey = "arrival_at";
                    } else if (head === "Arrival Date & Time" || head === t("guestTrain.arrivingOwn")) {
                      sortKey = "arrival_datetime";
                    } else if (head === "Train No" || head === t("guestTrain.trainNo")) {
                      sortKey = "flight_train_no";
                    } else if (head === "Booking PNR" || head === t("guestTrain.bookingPNR")) {
                      sortKey = "booking_pnr";
                    } else if (head === "Boogie No" || head === t("guestTrain.boogieNo")) {
                      sortKey = "boogie_no";
                    } else {
                      sortKey = head.toLowerCase();
                    }
                    requestTrainSort(sortKey);
                  }}
                >
                  <p className={`font-inter whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm ${head !== "Children Details" ? "cursor-pointer" : ""}`}>
                    {head}
                    {head !== "Children Details" && trainSortConfig.key ===
                      (head === "Guest Name" || head === t("guestTrain.guestName")
                        ? "user.first_name"
                        : head === "Departure From" || head === t("guestTrain.departureFrom")
                          ? "departure_from"
                          : head === "Departure Date & Time" || head === t("guestTrain.departureAt")
                            ? "departure_datetime"
                            : head === "Arriving At" || head === t("guestTrain.arrivingAt")
                              ? "arrival_at"
                              : head === "Arrival Date & Time" || head === t("guestTrain.arrivingOwn")
                                ? "arrival_datetime"
                                : head === "Train No" || head === t("guestTrain.trainNo")
                                  ? "flight_train_no"
                                  : head === "Booking PNR" || head === t("guestTrain.bookingPNR")
                                    ? "booking_pnr"
                                    : head === "Boogie No" || head === t("guestTrain.boogieNo")
                                      ? "boogie_no"
                                      : head.toLowerCase()) && trainSortConfig.direction === "asc" ? (
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
            ) : trainItems.length === 0 ? (
              <tr className="h-[550px] 2xl:h-[400px] 3xl:h-[550px]">
                <td colSpan="10">
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </td>
              </tr>
            ) : (
              <>
                {trainItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {/* Main train row */}
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
                        <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.boogie_no || "-"}</p>
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
                      <tr className="bg-green-50">
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
    </div>
  );
};

export default GuestTrainsTab;