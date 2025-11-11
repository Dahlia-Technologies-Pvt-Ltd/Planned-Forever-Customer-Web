import Lottie from "react-lottie";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import AllocateCarModal from "./AllocateCarModal";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import animationData from "../../assets/lottie/no_data";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ApiServices from "../../api/services";
import { useEffect } from "react";
import { getLocalDateFromUnixTimestamp, toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { CAR_ALLOCATION_PRINT } from "../../routes/Names";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Dropdown from "../../components/common/Dropdown";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { mediaUrl } from "../../utilities/config";
import { Images } from "../../assets/Assets";

const CarAllocation = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [
    t("carAllocation.carModel"),
    t("carAllocation.carNumber"),
    "Type",

    t("carAllocation.guestName"),
    t("carAllocation.allocatedFrom"),
    t("carAllocation.allocatedTo"),
    t("carAllocation.driver"),
    t("carAllocation.diverNumber"),
  ];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, userData } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [carAllocationFilter, setCarAllocationFilter] = useState(null);
  const [carFilterOptions, setCarFilterOptions] = useState([]); // Fixed variable naming consistency
  const [seatsFilter, setSeatsFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  const [showFilter, setShowFilter] = useState(false);

  // Data
  const [allAllocatedCars, setAllAllocatedCars] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [addNewModal, setAddNewModal] = useState({ open: false, data: null });
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  const { t: commonT } = useTranslation("common");

  const seatOptions = [
    { label: "All", value: "" },

    ...Array.from({ length: 47 }, (_, i) => {
      const value = i + 4;
      return {
        label: `${value} seats`,
        value,
      };
    }),
  ];

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Detail of selected row
  const detail = allAllocatedCars?.find((item) => item?.id === (activeRow || allAllocatedCars[0]?.id));

  console.log("detail", detail);
  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allAllocatedCars);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const getAllocateCarListing = (emptySearch) => {
    setLoading(true);

    let payload = {
      search: emptySearch ? "" : searchText,
      page: currentPage,
      records_no: itemsPerPage,
      event_id: eventSelect,
      seats: seatsFilter?.value,
      car_make_model: carAllocationFilter?.label,
      type: typeFilter?.value,
    };

    ApiServices.allocateCar
      .GetAllAllocateCar(payload)
      .then((res) => {
        const { data, message } = res;

        if (data.code === 200) {
          setLoading(false);
          setAllAllocatedCars(data.data.data);
          setCurrentPage(data?.data?.current_page);
          setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
        }
      })
      .catch((err) => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const getCarListingOptions = async (emptySearch) => {
    try {
      let payload = {
        event_id: eventSelect,
      };

      const res = await ApiServices.car.GetAllCar(payload);
      const { data, message } = res;

      if (data.code === 200) {
        const formattedCar = data?.data?.map((car) => ({
          value: car.id,
          label: car.make_and_model,
        }));
        setCarFilterOptions(formattedCar);
      }
    } catch (err) {
      // Handle error by setting an empty array
      setCarFilterOptions([]);
    }
  };

  // Delete allocated car
  const handleDeleteAllocatedCar = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.allocateCar.deleteAllocateCar(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getAllocateCarListing();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("carAllocation.carAllocationDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // Use Effects
  // useEffect(() => {
  //   if (searchText?.length > 1 || searchText?.length === 0) {
  //     getAllocateCarListing();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getAllocateCarListing(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === '') {
  //     getAllocateCarListing();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getAllocateCarListing();
  }, [currentPage, seatsFilter, carAllocationFilter, typeFilter]); // Added carAllocationFilter as dependency

  useEffect(() => {
    getCarListingOptions();
  }, []);
  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Car Allocation</h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-x-3">
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "car-allocation-create")) && (
                    <Button
                      title={t("carAllocation.allcoateCar")}
                      onClick={() => {
                        setAddNewModal({ open: true, data: null });
                      }}
                    />
                  )}
                  <Link to={CAR_ALLOCATION_PRINT}>
                    <Button title={t("buttons.print")} buttonColor="border-primary  bg-primary " />
                  </Link>
                </div>
                <div className="flex items-center gap-x-4">
                  <Button title={"Filters"} buttonColor="border-secondary bg-secondary" onClick={() => setShowFilter((prev) => !prev)} />
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                      <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      name="search"
                      placeholder={t("placeholders.search") + "..."}
                      autoComplete="off"
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        if (e.target.value.trim() === "") {
                          getAllocateCarListing(true);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            {showFilter && (
              <div className="flex items-center gap-x-4 pt-6">
                <div className="w-44">
                  <Dropdown
                    placeholder="Select Car"
                    options={[{ label: "All", value: "" }, ...(Array.isArray(carFilterOptions) ? carFilterOptions : [])]}
                    value={carAllocationFilter}
                    onChange={(e) => {
                      setCarAllocationFilter(e);
                    }}
                    noMargin
                  />
                </div>
                <div className="w-44">
                  <Dropdown
                    placeholder="Select Seats"
                    options={seatOptions}
                    value={seatsFilter}
                    onChange={(e) => {
                      setSeatsFilter(e);
                    }}
                    noMargin
                  />
                </div>
                <div className="w-44">
                  <Dropdown
                    placeholder="Select Type"
                    options={[
                      { label: "All", value: "" },
                      { label: "General", value: "general" },
                      { label: "Pick Up", value: "pick_up" },
                      { label: "Drop Off", value: "drop_off" },
                    ]}
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e);
                    }}
                    noMargin
                  />
                </div>
              </div>
            )}
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
                            if (head === "Allocated From ") {
                              sortKey = "from";
                            } else if (head === "Allocated To") {
                              sortKey = "till";
                            } else if (head === "Guest Name") {
                              sortKey = "contact.first_name";
                            } else if (head === "Car Model") {
                              sortKey = "car.make_and_model";
                            } else if (head === "Car Number") {
                              sortKey = "car.number";
                            } else if (head === "Driver") {
                              sortKey = "car.driver_name";
                            } else if (head === "Driver Number") {
                              sortKey = "car.driver_contact";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Allocated From "
                                ? "from"
                                : head === "Allocated To"
                                  ? "till"
                                  : head === "Guest Name"
                                    ? "contact.first_name"
                                    : head === "Car Model"
                                      ? "car.make_and_model"
                                      : head === "Car Number"
                                        ? "car.number"
                                        : head === "Driver"
                                          ? "car.driver_name"
                                          : head === "Driver Number"
                                            ? "car.driver_contact"
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
                        <td colSpan="8">
                          <Skeleton count={itemsPerPage} height={50} />
                        </td>
                      </tr>
                    ) : items.length > 0 ? (
                      items.map((item, index) => (
                        <tr
                          key={item?.id}
                          className={`cursor-pointer ${item?.id === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                          onClick={() => handleRowClick(item?.id)}
                        >
                          <td className="py-2 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.car?.make_and_model || "-"}</p>
                          </td>
                          <td className="py-2 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.car?.number || "-"}</p>
                          </td>
                          <td className="py-2 pl-4 pr-3 3xl:px-2">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.type === "pick_up" ? "Pick Up" : item?.type === "general" ? "General" : "Drop Off" || "-"}
                            </p>
                          </td>
                          <td className="py-2 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                                {item?.contact?.first_name + " " + item?.contact?.last_name || "-"}
                              </p>
                            </p>
                          </td>
                          <td className="py-2 pl-6 pr-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {getLocalDateFromUnixTimestamp(item?.from, "DD MMM, YYYY h:mm A")}
                            </p>
                          </td>

                          <td className="py-2 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {getLocalDateFromUnixTimestamp(item?.till, "DD MMM, YYYY h:mm A")}
                            </p>
                          </td>

                          <td className="py-2 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.car?.driver_name || "-"}</p>
                          </td>
                          <td className="py-2 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.car?.driver_contact?.phone || "-"}</p>
                          </td>
                          {/* <td className="py-2 pr-3 pl-4 3xl:px-4">
                            <div className="flex gap-x-3 items-center">
                              <span
                                onClick={() => {
                                  setAddNewModal({ open: true, data: item });
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
            {/* Table End */}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items.length > 0 ? (
              <>
                <div className="-mr-6 h-[70vh] space-y-8 overflow-y-auto 3xl:mr-0">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="sub-heading">{t("headings.basicInfo")}</h2>
                      <div className="flex justify-between">
                        <h3 className="heading">{t("headings.details")}</h3>
                        <div className="flex items-center gap-x-3">
                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "car-allocation-edit")) && (
                            <button
                              className="border-b border-secondary text-sm font-medium text-secondary"
                              type="button"
                              onClick={() => {
                                setAddNewModal({ open: true, data: detail });
                              }}
                            >
                              {t("buttons.edit")}
                            </button>
                          )}
                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "car-allocation-delete")) && (
                            <button
                              onClick={() => setOpenDeleteModal({ open: true, data: detail })}
                              className="border-b border-red-500 text-sm font-medium text-red-500"
                              type="button"
                            >
                              {t("buttons.delete")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 3xl:grid-cols-3">
                      <TitleValue title={t("carAllocation.allocatedFromDate")} value={getLocalDateFromUnixTimestamp(detail?.from, "DD MMM, YYYY")} />
                      <TitleValue title={t("carAllocation.allocatedFromTime")} value={getLocalDateFromUnixTimestamp(detail?.from, "h:mm A")} />
                      <TitleValue title={t("carAllocation.allocatedToDate")} value={getLocalDateFromUnixTimestamp(detail?.till, "DD MMM, YYYY")} />
                      <TitleValue title={t("carAllocation.allocatedToTime")} value={getLocalDateFromUnixTimestamp(detail?.till, "h:mm A")} />
                      <TitleValue
                        title={t("carAllocation.guestName")}
                        value={detail?.contact?.first_name + " " + detail?.contact?.last_name || "-"}
                      />
                      <TitleValue title={"No of Family Members"} value={detail?.contact?.children?.length + 1 || "-"} />
                      <TitleValue title={t("carAllocation.carModel")} value={detail?.car?.make_and_model || "-"} />
                      <TitleValue title={t("carAllocation.carNumber")} value={detail?.car?.number || "-"} />

                      <TitleValue title={"Seats"} value={detail?.car?.seats || "-"} />
                      <TitleValue title={"Type"} value={detail?.type === "pick_up" ? "Pick Up" : detail?.type === "drop_off" ? "Drop Off" : "-"} />
                    </div>

                    <div className="space-y-5 pt-10">
                      <h3 className="sub-heading">Driver Information</h3>
                      <div className="grid grid-cols-2 gap-5  3xl:grid-cols-3">
                        <div className="mb-5">
                          {detail?.driver_image !== null && (
                            <div>
                              <h3 className="mb-2 text-xs text-info-color">{t("cars.driverImage")}</h3>
                              <div className="h-full w-full">
                                <PhotoProvider>
                                  <PhotoView src={mediaUrl + detail?.driver_image}>
                                    <img
                                      src={detail?.driver_image ? mediaUrl + detail?.driver_image : Images.PLACEHOLDER}
                                      alt="image"
                                      className="h-20 w-20 cursor-pointer rounded-full object-cover"
                                    />
                                  </PhotoView>
                                </PhotoProvider>
                              </div>
                            </div>
                          )}
                        </div>
                        <TitleValue title={t("carAllocation.driverName")} value={detail?.car?.driver_name || "-"} />
                        <TitleValue title={t("carAllocation.driverPhoneNumber")} value={detail?.car?.driver_contact?.phone || "-"} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="sub-heading mb-5">{t("headings.otherInfo")}</h2>
                    <TitleValue title={t("headings.notes")} value={detail?.notes || "-"} />
                  </div>
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

      <AllocateCarModal
        isOpen={addNewModal?.open}
        setIsOpen={(open) => setAddNewModal((prev) => ({ open, data: null }))}
        refreshData={getAllocateCarListing}
        data={addNewModal?.data}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteAllocatedCar}
        message={t("carAllocation.carAllocationDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default CarAllocation;
