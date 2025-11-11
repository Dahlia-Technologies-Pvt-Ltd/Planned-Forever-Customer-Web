// src/pages/Contacts/components/CarTab.jsx
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import { useMediaQuery } from "react-responsive";
import ApiServices from "../../../../api/services";
import { useThemeContext } from "../../../../context/GlobalContext";
import { useSortableData } from "../../../../hooks/useSortableData";
import { getLocalDateFromUnixTimestamp } from "../../../../utilities/HelperFunctions";
import { emptyFolderAnimation } from "../../../../utilities/lottieAnimations";

const CarTab = ({ data, t }) => {
  const { eventSelect, loading, setLoading } = useThemeContext();

  // States
  const [allCarAllocations, setAllCarAllocations] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Table sorting
  const { items: carItems, requestSort: requestCarSort, sortConfig: carSortConfig } = useSortableData(allCarAllocations);

  // Table columns - updated to match the Car Allocation screen
  const carColumns = [
    t("carAllocation.carModel"),
    t("carAllocation.carNumber"),
    "Type",
    t("carAllocation.allocatedFrom"),
    t("carAllocation.allocatedTo"),
    t("carAllocation.driver"),
    t("carAllocation.diverNumber"),
  ];

  // Media Queries for pagination
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Car Allocations for specific user
  const getCarAllocations = async () => {
    if (!data?.uuid) return;

    try {
      setLoading(true);

      let payload = {
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
        user_id: data.uuid, // Filter by user UUID
      };

      const res = await ApiServices.allocateCar.GetAllAllocateCar(payload);
      const { data: responseData, message } = res;

      if (responseData.code === 200) {
        // Filter car allocations for this specific user (additional safety check)
        const userCarAllocations = responseData?.data?.data?.filter((allocation) => allocation.user_id === data.uuid) || [];

        setAllCarAllocations(userCarAllocations);
        setCurrentPage(responseData?.data?.current_page);
        setTotalPages(Math.ceil(responseData?.data?.total / responseData?.data?.per_page));
      }
    } catch (err) {
      console.error("Error fetching car allocations:", err);
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
    getCarAllocations();
  }, [data?.uuid, currentPage]);

  return (
    <div className="mt-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              {carColumns?.map((head) => (
                <th
                  key={head}
                  className="border-b border-gray-100 bg-white p-4 first:pl-6"
                  onClick={() => {
                    let sortKey;
                    if (head === "Car Model" || head === t("carAllocation.carModel")) {
                      sortKey = "car.make_and_model";
                    } else if (head === "Car Number" || head === t("carAllocation.carNumber")) {
                      sortKey = "car.number";
                    } else if (head === "Type") {
                      sortKey = "type";
                    } else if (head === "Allocated From" || head === t("carAllocation.allocatedFrom")) {
                      sortKey = "from";
                    } else if (head === "Allocated To" || head === t("carAllocation.allocatedTo")) {
                      sortKey = "till";
                    } else if (head === "Driver" || head === t("carAllocation.driver")) {
                      sortKey = "car.driver_name";
                    } else if (head === "Driver Number" || head === t("carAllocation.diverNumber")) {
                      sortKey = "car.driver_contact";
                    } else {
                      sortKey = head.toLowerCase();
                    }
                    requestCarSort(sortKey);
                  }}
                >
                  <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                    {head}
                    {carSortConfig.key ===
                      (head === "Car Model" || head === t("carAllocation.carModel")
                        ? "car.make_and_model"
                        : head === "Car Number" || head === t("carAllocation.carNumber")
                          ? "car.number"
                          : head === "Type"
                            ? "type"
                            : head === "Allocated From" || head === t("carAllocation.allocatedFrom")
                              ? "from"
                              : head === "Allocated To" || head === t("carAllocation.allocatedTo")
                                ? "till"
                                : head === "Driver" || head === t("carAllocation.driver")
                                  ? "car.driver_name"
                                  : head === "Driver Number" || head === t("carAllocation.diverNumber")
                                    ? "car.driver_contact"
                                    : head.toLowerCase()) && carSortConfig.direction === "asc" ? (
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
            ) : carItems.length === 0 ? (
              <tr className="h-[550px] 2xl:h-[400px] 3xl:h-[550px]">
                <td colSpan="7">
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </td>
              </tr>
            ) : (
              carItems.map((item, index) => (
                <tr key={index} className="cursor-pointer even:bg-gray-50">
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.car?.make_and_model || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.car?.number || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                      {item?.type === "pick_up" ? "Pick Up" : item?.type === "general" ? "General" : item?.type === "drop_off" ? "Drop Off" : "-"}
                    </p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                      {item?.from ? getLocalDateFromUnixTimestamp(item.from, "DD MMM, YYYY h:mm A") : "-"}
                    </p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                      {item?.till ? getLocalDateFromUnixTimestamp(item.till, "DD MMM, YYYY h:mm A") : "-"}
                    </p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.car?.driver_name || "-"}</p>
                  </td>
                  <td className="cursor-pointer py-3 pl-6 pr-4">
                    <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.car?.driver_contact?.phone || "-"}</p>
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

export default CarTab;
