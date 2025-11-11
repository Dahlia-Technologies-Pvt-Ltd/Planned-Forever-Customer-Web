import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import TitleValue from "../../components/common/TitleValue";
import { useSortableData } from "../../hooks/useSortableData";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import Dropdown from "../../components/common/Dropdown";
import Badge from "../../components/common/Badge";
import { useTranslation } from "react-i18next";

// Table Head
// const TABLE_HEAD = ["Category", "Sub Category", "Raised By ", "Status", "Actions"];

const ServiceRequest = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD = [t("serviceRequest.category"), t("serviceRequest.subCategory"), t("serviceRequest.raisedBy"), t("serviceRequest.status")];

  // Context
  const { eventSelect, openSuccessModal, closeSuccessModel, setBtnLoading, userData } = useThemeContext();

  // Use States
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  const [changeStatus, setChangeStatus] = useState("");
  const [eventError, setEventError] = useState(false);

  // Data
  const [allUsers, setAllUsers] = useState([]);
  const [allServiceRequests, setAllServiceRequests] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [modalData, setModalData] = useState(null);
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Detail of selected row
  const detail = allUsers?.find((item) => item?.id === (activeRow || allUsers[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allUsers);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get service requests
  const getServiceRequestsListing = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.Service_Requests.getServiceRequests(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllUsers(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const getServiceRequestUpdate = async () => {
    if (!changeStatus) {
      setEventError(true);
      return;
    }

    try {
      setLoading(true);

      let payload = {
        resolved_by: userData?.uuid,
        status: changeStatus.Value,
      };

      const res = await ApiServices.Service_Requests.updateServiceStatus(detail?.id, payload);
      const { data } = res;

      if (data.code === 200) {
        setLoading(false);
        getServiceRequestsListing();
        setChangeStatus(""); // Resetting the dropdown after successful update
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // Search
  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getServiceRequestsListing(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffects
  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getServiceRequestsListing();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getServiceRequestsListing();
  }, [currentPage]);

  const handleChangeStatus = (value) => {
    setChangeStatus(value);
    setEventError(!value); // Set withError to true when value is empty, false otherwise
  };

  const formatTimeValue = (value) => {
    const date = new Date(value);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  console.log({ detail });

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Service Requests</h3>
              <div className="flex w-full items-center justify-end">
                {/* <Button title="Add Users" onClick={() => setAddNewModal(true)} /> */}
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    autoComplete="off"
                    value={searchText}
                    placeholder={t("placeholders.search") + "..."}
                    onKeyPress={handleSearch}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getServiceRequestsListing(true);
                      }
                    }}
                    className="focus:border-primary-color-100 block h-11 w-full rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                  />
                </div>
              </div>
            </div>
            {/* Table Start */}
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
                            if (head === "Category") {
                              sortKey = "category.name";
                            } else if (head === "Sub Category") {
                              sortKey = "sub_category.name";
                            } else if (head === "Raised By") {
                              sortKey = "created_by.first_name";
                            } else if (head === "Status") sortKey = "status";
                            else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Category"
                                ? "category.name"
                                : head === "Sub Category"
                                  ? "sub_category.name"
                                  : head === "Raised By"
                                    ? "created_by.first_name"
                                    : head === "Status"
                                      ? "status"
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
                    ) : items?.length > 0 ? (
                      items?.map((item, index) => (
                        <tr
                          key={item?.id}
                          className={`cursor-pointer ${item?.id === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                          onClick={() => handleRowClick(item?.id)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.category?.name}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.sub_category?.name}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.created_by?.first_name && item?.created_by?.last_name
                                ? item.created_by.first_name + " " + item.created_by.last_name
                                : "-"}
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p
                              className={`${item?.status === 1 ? "text-red-500" : item?.status === 2 ? "text-yellow-500" : item?.status === 3 ? "text-green-500" : ""} text-xs font-normal 3xl:text-sm`}
                            >
                              {item?.status === 1 ? "Pending" : item?.status === 2 ? "Processing" : item?.status === 3 ? "Resolved" : ""}
                            </p>
                          </td>
                          {/* <td className="py-3 pr-3 pl-4 3xl:px-4">
                            <div className="flex gap-x-3 items-center">
                              <span
                                onClick={() => {
                                  setAddNewModal(true);
                                  setModalData(item);
                                }}
                                className="text-xs font-normal underline cursor-pointer text-secondary underline-offset-4 3xl:text-sm"
                              >
                                Edit
                              </span>

                              <span
                                onClick={() => setOpenDeleteModal({ open: true, data: item })}
                                className="text-xs font-normal text-red-500 underline cursor-pointer underline-offset-4 3xl:text-sm"
                              >
                                Delete
                              </span>
                            </div>
                          </td> */}
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
                  pageCount={totalPages}
                  pageRangeDisplayed={5}
                  activeClassName="active"
                  marginPagesDisplayed={2}
                  nextClassName="item next"
                  forcePage={currentPage - 1}
                  renderOnZeroPageCount={null}
                  onPageChange={handlePageChange}
                  breakClassName="item break-me "
                  containerClassName="pagination"
                  previousClassName="item previous"
                  pageClassName="item pagination-page"
                  nextLabel={<ChevronRightIcon className="h-5 w-5" />}
                  previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
                />
              </div>
            </div>
            {/* Table End */}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items.length > 0 ? (
              <>
                <div className="flex justify-between">
                  <h3 className="heading">Details</h3>
                  <div className="flex items-center gap-x-3">
                    <Badge
                      className={`${detail?.status === 1 ? "text-red-500" : detail?.status === 2 ? "text-yellow-500" : detail?.status === 3 ? "text-green-500" : ""} text-xs font-normal 3xl:text-sm`}
                      title={detail?.status === 1 ? "Pending" : detail?.status === 2 ? "Processing" : detail?.status === 3 ? "Resolved" : ""}
                    />
                  </div>
                </div>

                <div className="h-[65vh] overflow-y-auto">
                  <div className="mt-6 pr-4">
                    <h2 className="sub-heading mb-5">{t("headings.basicInfo")}</h2>
                    <div className="flex flex-wrap justify-between gap-5">
                      <TitleValue title={t("serviceRequest.category")} value={detail?.category?.name || "-"} />
                      <TitleValue title={t("serviceRequest.subCategory")} value={detail?.sub_category?.name || "-"} />
                      <TitleValue title={t("serviceRequest.furtherClassification")} value={detail?.classification?.name || "-"} />
                    </div>
                  </div>

                  <div className="mt-6 pr-4">
                    <h2 className="sub-heading mb-5">{t("headings.otherInfo")}</h2>
                    <div className="flex flex-wrap justify-between gap-5">
                      <TitleValue
                        title={t("serviceRequest.raisedBy")}
                        value={detail?.created_by?.first_name + " " + detail?.created_by?.last_name || "-"}
                      />
                      <TitleValue title={t("serviceRequest.contactNumber")} value={detail?.created_by?.contact_numbers[0]?.contact_number} />
                      <TitleValue
                        title={t("serviceRequest.raisedOn")}
                        value={getLocalDateFromUnixTimestamp(detail?.created_at_unix, "DD MMM, YYYY")}
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex flex-wrap justify-between gap-5">
                      <TitleValue title={t("serviceRequest.note")} value={detail?.remarks || "-"} />
                    </div>
                  </div>

                  <div className="mt-6 pl-2 pr-2">
                    <h2 className="sub-heading mb-5">{t("serviceRequest.categoryCustomField")}</h2>
                    <div className="flex flex-wrap justify-between gap-5">
                      <div className="grid grid-cols-1 gap-5 space-y-1">
                        {detail?.category_custom_fields?.length === 0 || detail?.category_custom_fields === null ? (
                          <span className="text-xs text-info-color">No Data Found</span>
                        ) : (
                          detail?.category_custom_fields?.map((item) => (
                            <div key={item.id}>
                              <div className="mb-2 font-semibold">{item?.name}</div>
                              {item?.custom_field?.length === 0 ? (
                                <>
                                  {item?.field_type === "Text" ? (
                                    " "
                                  ) : item?.field_type === "Time" ? (
                                    " "
                                  ) : item?.field_type === "Url" ? (
                                    " "
                                  ) : item?.field_type === "Date" ? (
                                    ""
                                  ) : item?.field_type === "Number" ? (
                                    ""
                                  ) : item?.field_type === "Select" && item?.type === "master" ? (
                                    ""
                                  ) : (
                                    <>-</>
                                  )}
                                </>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {item?.field_type === "Select" && item?.type === "custom" && (
                                    <Dropdown
                                      isSearchable
                                      options={item?.custom_field?.map((venue) => ({
                                        value: venue?.id,
                                        label: venue?.name,
                                      }))}
                                      placeholder="Select"
                                      value={
                                        item.custom_field?.find((field) => field?.id === item?.value)
                                          ? {
                                              value: item?.master_field_type?.value,
                                              label: item?.custom_field?.find((field) => field?.id === item?.value).name,
                                            }
                                          : null
                                      }
                                    />
                                  )}

                                  {item?.field_type === "Checkbox" &&
                                    item?.custom_field?.map((field) => (
                                      <label key={field?.id} className="block">
                                        <input type="checkbox" value={field.id} checked={field.id === item.value} className="mr-2" />
                                        {field?.name}
                                      </label>
                                    ))}
                                  {item?.field_type === "Radio" &&
                                    item?.custom_field.map((field) => (
                                      <label key={field.id} className="block">
                                        <input
                                          type="radio"
                                          name={`radio-category-${item?.id}`}
                                          value={field.id}
                                          checked={field.id === item.value}
                                          className="mr-2"
                                        />
                                        {field.name}
                                      </label>
                                    ))}
                                </div>
                              )}

                              {item.field_type === "Select" && item.type === "master" && (
                                <Dropdown
                                  isSearchable
                                  options={item.master_field_type?.detail?.map((venue) => ({
                                    value: venue.id,
                                    label: venue.name,
                                  }))}
                                  placeholder="Select"
                                  value={
                                    item.master_field_type.detail?.find((field) => field.id === item.master_field_type.value)
                                      ? {
                                          value: item.master_field_type.value,
                                          label: item.master_field_type.detail.find((field) => field.id === item.master_field_type.value).name,
                                        }
                                      : null
                                  }
                                />
                              )}

                              {item.field_type === "Text" && (
                                <>
                                  <input
                                    type="text"
                                    value={item.value}
                                    className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                  />
                                </>
                              )}
                              {item.field_type === "Time" && (
                                <input
                                  type="time"
                                  value={formatTimeValue(item.value)}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                              {item.field_type === "Url" && (
                                <a href={item.value} target="_blank" rel="noopener noreferrer" className="break-all text-blue-500">
                                  {item.value}
                                </a>
                              )}
                              {item.field_type === "Date" && (
                                <input
                                  type="date"
                                  value={new Date(item.value * 1000).toISOString().substring(0, 10)}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                              {item.field_type === "Number" && (
                                <input
                                  type="number"
                                  value={item.value}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pl-2 pr-2">
                    <h2 className="sub-heading mb-5">{t("serviceRequest.subCategoryCustomField")}</h2>
                    <div className="flex flex-wrap justify-between gap-5">
                      <div className="grid grid-cols-1 gap-5 space-y-1">
                        {detail?.sub_category_custom_fields?.length === 0 || detail?.sub_category_custom_fields === null ? (
                          <span className="text-xs text-info-color">No Data Found</span>
                        ) : (
                          detail?.sub_category_custom_fields?.map((item) => (
                            <div key={item.id}>
                              <div className="mb-2 font-semibold">{item?.name}</div>
                              {item?.custom_field?.length === 0 ? (
                                <>
                                  {item.field_type === "Text" ? (
                                    " "
                                  ) : item.field_type === "Time" ? (
                                    " "
                                  ) : item.field_type === "Url" ? (
                                    " "
                                  ) : item.field_type === "Date" ? (
                                    ""
                                  ) : item.field_type === "Number" ? (
                                    ""
                                  ) : item.field_type === "Select" && item.type === "master" ? (
                                    ""
                                  ) : (
                                    <>-</>
                                  )}
                                </>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {item.field_type === "Select" && item.type === "custom" && (
                                    <Dropdown
                                      isSearchable
                                      options={item.custom_field?.map((venue) => ({
                                        value: venue.id,
                                        label: venue.name,
                                      }))}
                                      placeholder="Select"
                                      value={
                                        item.custom_field?.find((field) => field.id === item?.value)
                                          ? {
                                              value: item.master_field_type?.value,
                                              label: item.custom_field?.find((field) => field.id === item?.value).name,
                                            }
                                          : null
                                      }
                                    />
                                  )}

                                  {item.field_type === "Checkbox" &&
                                    item.custom_field.map((field) => (
                                      <label key={field.id} className="block">
                                        <input type="checkbox" value={field.id} checked={field.id === item.value} className="mr-2" />
                                        {field.name}
                                      </label>
                                    ))}
                                  {item.field_type === "Radio" &&
                                    item.custom_field.map((field) => (
                                      <label key={field.id} className="block">
                                        <input
                                          type="radio"
                                          name={`radio-sub-category-${item?.id}`}
                                          value={field.id}
                                          checked={field.id === item.value}
                                          className="mr-2"
                                        />
                                        {field.name}
                                      </label>
                                    ))}
                                </div>
                              )}

                              {item.field_type === "Select" && item.type === "master" && (
                                <Dropdown
                                  isSearchable
                                  options={item.master_field_type?.detail?.map((venue) => ({
                                    value: venue.id,
                                    label: venue.name,
                                  }))}
                                  placeholder="Select"
                                  value={
                                    item.master_field_type.detail?.find((field) => field.id === item.master_field_type.value)
                                      ? {
                                          value: item.master_field_type.value,
                                          label: item.master_field_type.detail.find((field) => field.id === item.master_field_type.value).name,
                                        }
                                      : null
                                  }
                                />
                              )}

                              {item.field_type === "Text" && (
                                <>
                                  <input
                                    type="text"
                                    value={item.value}
                                    className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                  />
                                </>
                              )}
                              {item.field_type === "Time" && (
                                <input
                                  type="time"
                                  value={formatTimeValue(item.value)}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                              {item.field_type === "Url" && (
                                <a href={item.value} target="_blank" rel="noopener noreferrer" className="break-all text-blue-500">
                                  {item.value}
                                </a>
                              )}
                              {item.field_type === "Date" && (
                                <input
                                  type="date"
                                  value={new Date(item.value * 1000).toISOString().substring(0, 10)}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                              {item.field_type === "Number" && (
                                <input
                                  type="number"
                                  value={item.value}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pl-2 pr-2">
                    <h2 className="sub-heading mb-5">{t("serviceRequest.classificationCustomField")}</h2>
                    <div className="flex flex-wrap justify-between gap-5">
                      <div className="grid grid-cols-1 gap-5 space-y-1">
                        {detail?.classification_custom_fields?.length === 0 || detail?.classification_custom_fields === null ? (
                          <span className="text-xs text-info-color">No Data Found</span>
                        ) : (
                          detail?.classification_custom_fields?.map((item) => (
                            <div key={item.id}>
                              <div className="mb-2 font-semibold">{item?.name}</div>
                              {item?.custom_field?.length === 0 ? (
                                <>
                                  {item.field_type === "Text" ? (
                                    " "
                                  ) : item.field_type === "Time" ? (
                                    " "
                                  ) : item.field_type === "Url" ? (
                                    " "
                                  ) : item.field_type === "Date" ? (
                                    ""
                                  ) : item.field_type === "Number" ? (
                                    ""
                                  ) : item.field_type === "Select" && item.type === "master" ? (
                                    ""
                                  ) : (
                                    <>-</>
                                  )}
                                </>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {item.field_type === "Select" && item.type === "custom" && (
                                    <Dropdown
                                      isSearchable
                                      options={item.custom_field?.map((venue) => ({
                                        value: venue.id,
                                        label: venue.name,
                                      }))}
                                      placeholder="Select"
                                      value={
                                        item.custom_field?.find((field) => field.id === item?.value)
                                          ? {
                                              value: item.master_field_type?.value,
                                              label: item.custom_field?.find((field) => field.id === item?.value).name,
                                            }
                                          : null
                                      }
                                    />
                                  )}

                                  {item.field_type === "Checkbox" &&
                                    item.custom_field.map((field) => (
                                      <label key={field.id} className="block">
                                        <input type="checkbox" value={field.id} checked={field.id === item.value} className="mr-2" />
                                        {field.name}
                                      </label>
                                    ))}
                                  {item.field_type === "Radio" &&
                                    item.custom_field.map((field) => (
                                      <label key={field.id} className="block">
                                        <input
                                          type="radio"
                                          name={`radio-classification-${item?.id}`}
                                          value={field.id}
                                          checked={field.id === item.value}
                                          className="mr-2"
                                        />
                                        {field.name}
                                      </label>
                                    ))}
                                </div>
                              )}

                              {item.field_type === "Select" && item.type === "master" && (
                                <Dropdown
                                  isSearchable
                                  options={item.master_field_type?.detail?.map((venue) => ({
                                    value: venue.id,
                                    label: venue.name,
                                  }))}
                                  placeholder="Select"
                                  value={
                                    item.master_field_type.detail?.find((field) => field.id === item.master_field_type.value)
                                      ? {
                                          value: item.master_field_type.value,
                                          label: item.master_field_type.detail.find((field) => field.id === item.master_field_type.value).name,
                                        }
                                      : null
                                  }
                                />
                              )}

                              {item.field_type === "Text" && (
                                <>
                                  <input
                                    type="text"
                                    value={item.value}
                                    className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                  />
                                </>
                              )}
                              {item.field_type === "Time" && (
                                <input
                                  type="time"
                                  value={formatTimeValue(item.value)}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                              {item.field_type === "Url" && (
                                <a href={item.value} target="_blank" rel="noopener noreferrer" className="break-all text-blue-500">
                                  {item.value}
                                </a>
                              )}
                              {item.field_type === "Date" && (
                                <input
                                  type="date"
                                  value={new Date(item.value * 1000).toISOString().substring(0, 10)}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                              {item.field_type === "Number" && (
                                <input
                                  type="number"
                                  value={item.value}
                                  className="text-md h-11 w-full rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color"
                                />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex w-full items-center justify-between gap-5">
                  <Dropdown
                    options={[
                      { label: "Pending", Value: 1 },
                      { label: "Processing", Value: 2 },
                      { label: "Resolved", Value: 3 },
                    ]}
                    placeholder="Change Status"
                    value={changeStatus}
                    onChange={(value) => handleChangeStatus(value)}
                    withoutTitle
                    withError={eventError}
                  />

                  <Button title={t("serviceRequest.updateStatus")} onClick={getServiceRequestUpdate} />
                </div>
              </>
            ) : (
              <div className="flex h-[70vh] items-center justify-center">
                <div colSpan="6">
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete */}
      {/* <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteUser}
        message="Are you sure you want to delete this User?"
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      /> */}
    </>
  );
};

export default ServiceRequest;
