// src/pages/Contacts/components/DepartureTab.jsx
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import { useMediaQuery } from "react-responsive";
import ApiServices from "../../../../api/services";
import { useThemeContext } from "../../../../context/GlobalContext";
import { useSortableData } from "../../../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../../../utilities/lottieAnimations";

const DepartureTab = ({ data, t }) => {
  const { eventSelect, loading, setLoading } = useThemeContext();

  // States
  const [allDepartures, setAllDepartures] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Table sorting
  const { items: departureItems, requestSort: requestDepartureSort, sortConfig: departureSortConfig } = useSortableData(allDepartures);

  // Table columns (excluding "Has Departed")
  const departureColumns = [t("contacts.dateTime"), t("contacts.from"), t("contacts.to"), t("contacts.flightTrainNo"), t("departure.noOfPeople")];

  // Media Queries for pagination
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Departures for specific user
  const getDepartures = async () => {
    if (!data?.uuid) return;

    try {
      setLoading(true);

      let payload = {
        page: currentPage,
        records_no: itemsPerPage,
        type: "departure",
        event_id: eventSelect,
        user_id: data.uuid, // Filter by user UUID
      };

      const res = await ApiServices.arrivalDeparture.getArrivalDeparture(payload);
      const { data: responseData, message } = res;

      if (responseData.code === 200) {
        // Filter departures for this specific user (additional safety check)
        const userDepartures = responseData?.data?.data?.filter((departure) => departure.user_id === data.uuid) || [];

        setAllDepartures(userDepartures);
        setCurrentPage(responseData?.data?.current_page);
        setTotalPages(Math.ceil(responseData?.data?.total / responseData?.data?.per_page));
      }
    } catch (err) {
      console.error("Error fetching departures:", err);
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
    getDepartures();
  }, [data?.uuid, currentPage]);

  return (
    <div className="mt-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              {departureColumns?.map((head) => (
                <th
                  key={head}
                  className="border-b border-gray-100 bg-white p-4 first:pl-6"
                  onClick={() => {
                    let sortKey;
                    if (head === "Date/Time" || head === t("contacts.dateTime")) {
                      sortKey = "date";
                    } else if (head === "From" || head === t("contacts.from")) {
                      sortKey = "from";
                    } else if (head === "To" || head === t("contacts.to")) {
                      sortKey = "to";
                    } else if (head === "Flight/Train No" || head === t("contacts.flightTrainNo")) {
                      sortKey = "fligh_train_no";
                    } else if (head === "No. of People" || head === t("departure.noOfPeople")) {
                      sortKey = "no_of_person";
                    } else {
                      sortKey = head.toLowerCase();
                    }
                    requestDepartureSort(sortKey);
                  }}
                >
                  <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                    {head}
                    {departureSortConfig.key ===
                      (head === "Date/Time" || head === t("contacts.dateTime")
                        ? "date"
                        : head === "From" || head === t("contacts.from")
                          ? "from"
                          : head === "To" || head === t("contacts.to")
                            ? "to"
                            : head === "Flight/Train No" || head === t("contacts.flightTrainNo")
                              ? "fligh_train_no"
                              : head === "No. of People" || head === t("departure.noOfPeople")
                                ? "no_of_person"
                                : head.toLowerCase()) && departureSortConfig.direction === "asc" ? (
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
                <td colSpan="5">
                  <Skeleton count={5} height={50} />
                </td>
              </tr>
            ) : departureItems.length === 0 ? (
              <tr className="h-[550px] 2xl:h-[400px] 3xl:h-[550px]">
                <td colSpan="5">
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </td>
              </tr>
            ) : (
              departureItems.map((item, index) => (
                <tr key={index} className="cursor-pointer even:bg-gray-50">
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                      {item?.date ? moment.unix(item.date).format("DD MMM, YYYY h:mm A") : "-"}
                    </p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.from || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.to || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.fligh_train_no || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.no_of_person || "-"}</p>
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
    </div>
  );
};

export default DepartureTab;
