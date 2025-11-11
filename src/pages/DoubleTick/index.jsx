import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import Skeleton from "react-loading-skeleton";
import ApiServices from "../../api/services";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { DOUBLE_TICK_LIST } from "../../routes/Names";
import { useSortableData } from "../../hooks/useSortableData";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import moment from "moment";
import RangePicker from "../../components/common/RangePicker";
import DatePickerField from "../../components/common/DatePickerField";
import DateRangePicker from "../../components/common/DatePickerField";

const DoubleTick = () => {
  const { t } = useTranslation("common");

  const navigate = useNavigate();
  const TABLE_HEAD = [
    t("doubleTick.templateName"),
    t("doubleTick.sentOn"),
    t("doubleTick.noOfPeople"),
    t("doubleTick.delivered"),
    t("doubleTick.failed"),
  ];

  const { loading, setLoading, eventSelect } = useThemeContext();

  const [allDoubleTicks, setAllDoubleTicks] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const { items, requestSort, sortConfig } = useSortableData(allDoubleTicks);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getDoubleTicks(false);
        setCurrentPage(1);
      }
    }
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    console.log("Selected Date Range:", dates);
  };


  // Get double ticks
  const getDoubleTicks = async () => {
    try {
      setLoading(true);
  
      let payload = {
        page: currentPage,
        per_page: itemsPerPage,
        template_name: searchText,
        date_from: dateRange[0] ? moment(dateRange[0]).format("YYYY-MM-DD") : undefined,
        date_to: dateRange[1] ? moment(dateRange[1]).format("YYYY-MM-DD") : undefined,
        event_id: eventSelect,
        
      };
  
      const res = await ApiServices.doubleTick.doubleTicksList(payload);
      const { data } = res;  
      if (data.code === 200) {
        setAllDoubleTicks(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };
  

  const formatName = (name) => {
    return name
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
  };

  useEffect(() => {
    getDoubleTicks();
  }, [ currentPage, dateRange ]);
  return (
    <div className="card min-h-[82vh] ">
      <div className="flex items-center justify-end gap-x-5">
        <div className="relative flex w-96 items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
          </div>
          <input
            type="search"
            id="search"
            name="search"
            placeholder={t("placeholders.search") + "..."}
            autoComplete="off"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              if (e.target.value.trim() === "") {
                getDoubleTicks(true);
              }
            }}
            onKeyPress={handleSearch}
            className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
          />
        </div>
        <DateRangePicker selectedRange={dateRange} onChange={handleDateChange} />
        <Button title={t("doubleTick.templateList")} onClick={() => navigate(DOUBLE_TICK_LIST)} />
      </div>
      <div className="mt-5">
        <div className="-mx-6 mb-8 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b border-gray-100 bg-white p-4 first:pl-6"
                    onClick={() => {
                      let sortKey;
                      if (head === "Template Name") {
                        sortKey = "template_name";
                      } else if (head === "Sent On") {
                        sortKey = "created_at";
                      } else if (head === "No of People") {
                        sortKey = "recipients_count";
                      } else if (head === "Delivered") {
                        sortKey = "delivered_count";
                      } else if (head === "Failed") {
                        sortKey = "failed_count";
                      } else {
                        sortKey = head.toLowerCase();
                      }
                      requestSort(sortKey);
                    }}
                  >
                    <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                      {head}
                      {sortConfig.key ===
                        (head === "Template Name"
                          ? "template_name"
                          : head === "Sent On"
                            ? "created_at"
                            : head === "No of People"
                              ? "recipients_count"
                              : head === "Delivered"
                                ? "delivered_count"
                                : head === "Failed"
                                  ? "failed_count"
                                  : head.toLowerCase()) && sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="inline-block h-4 w-3.5" />
                      ) : (
                        <ChevronDownIcon className="inline-block h-4 w-3.5" />
                      )}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <Skeleton count={itemsPerPage} height={50} />
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item?.id} className={`cursor-pointer even:bg-gray-50`}>
                    <td className="py-3 pl-6 pr-3 ">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{formatName(item?.template_name) || "-"}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                        {moment(item?.created_at).format("DD MMM, YYYY h:mm A")}
                      </p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.recipients_count || "-"}</p>
                    </td>
                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.delivered_count || "-"}</p>
                    </td>

                    <td className="py-3 pl-4 pr-3 3xl:px-4">
                      <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.failed_count || "-"}</p>
                    </td>
                  </tr>
                ))
              ) : (
                // Render "No Data" message
                <tr className="h-[400px]">
                  <td colSpan="6">
                    <Lottie options={emptyFolderAnimation} width={200} height={200} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="absolute bottom-4">
          <ReactPaginate
            breakLabel="..."
            pageRangeDisplayed={5}
            marginPagesDisplayed={2}
            activeClassName="active"
            nextClassName="item next"
            renderOnZeroPageCount={null}
            breakClassName="item break-me "
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
      </div>
    </div>
  );
};

export default DoubleTick;
