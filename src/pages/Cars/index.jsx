import Lottie from "react-lottie";
import { useEffect } from "react";
import AddCarModal from "./AddCarModal";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { CAR_PRINT } from "../../routes/Names";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { mediaUrl } from "../../utilities/config";
import { Images } from "../../assets/Assets";
import { getLocalDateFromUnixTimestamp, toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";
import Dropdown from "../../components/common/Dropdown";
import { FunnelIcon } from "@heroicons/react/24/outline";
import Input from "../../components/common/Input";

const Cars = () => {
  const { t } = useTranslation("common");
  // Table Head
  const TABLE_HEAD = [t("cars.carMakeModel"), t("cars.carNumber"), t("cars.driverName"), t("cars.availableFrom"), t("cars.availableTill")];
  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, userData } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [carFilter, setCarFilter] = useState(null);
  const [carFilterOptions, setCarFilterOptions] = useState([]);
  const [seatsFilter, setSeatsFilter] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [availableFromFilter, setAvailableFromFilter] = useState("");
  const [availableTillFilter, setAvailableTillFilter] = useState("");

  // Data
  const [allCar, setAllCar] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
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
  const detail = allCar?.find((item) => item?.id === (activeRow || allCar[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allCar);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // get all cars
  const getCarListing = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
        seats: seatsFilter?.value,
        available_from: toUTCUnixTimestamp(availableFromFilter),
        available_till: toUTCUnixTimestamp(availableTillFilter),
        makeAndModel: carFilter?.label ? (carFilter?.label === "All" ? "" : carFilter?.label) : "",
      };

      const res = await ApiServices.car.GetAllCar(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllCar(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const getCarListingOptions = async (emptySearch) => {
    try {
      let payload = {
        event_id: eventSelect,
      };

      const res = await ApiServices.car.GetAllCar(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setAllCar(data.data.data);
        const formattedCar =
          data?.data?.map((car) => ({
            value: car.id,
            label: car.make_and_model,
          })) || [];
        setCarFilterOptions(formattedCar);
      }
    } catch (err) {
      // Handle error by setting an empty array
      setCarFilterOptions([]);
    }
  };
  // Delete Car
  const handleDeleteCar = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.car.deleteCar(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getCarListing();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("cars.carDeleteSuccess"),
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
  //     getCarListing();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getCarListing(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === '') {
  //     getCarListing();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getCarListing();
  }, [currentPage, seatsFilter, carFilter, availableFromFilter, availableTillFilter]);

  useEffect(() => {
    getCarListingOptions();
    getCarListing();

  }, []);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Cars</h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-x-3">
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "cars-create")) && (
                    <Button title={t("cars.addCar")} onClick={() => setAddNewModal(true)} />
                  )}
                  <Link to={CAR_PRINT}>
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
                          getCarListing(true);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      className="focus:border-primary-color-100 block h-11 w-full rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                    />
                  </div>
                </div>
              </div>
            </div>
            {showFilter && (
              <div className="flex items-center gap-x-4 pt-6">
                <div className="w-44">
                  <Dropdown
                    title="Select Car"
                    placeholder="Select"
                    options={[{ label: "All", value: "" }, ...(Array.isArray(carFilterOptions) ? carFilterOptions : [])]}
                    value={carFilter}
                    onChange={(e) => {
                      setCarFilter(e);
                    }}
                    noMargin
                  />
                </div>
                <div className="w-44">
                  <Dropdown
                    title="Select Seats"
                    placeholder="Select"
                    options={seatOptions}
                    value={seatsFilter}
                    onChange={(e) => {
                      setSeatsFilter(e);
                    }}
                    noMargin
                  />
                </div>
                <Input
                  type="datetime-local"
                  label={"Available From"}
                  placeholder="Select Start Date & Time"
                  value={availableFromFilter ? availableFromFilter : ""}
                  onChange={(e) => {
                    setAvailableFromFilter(e.target.value);
                  }}
                />
                <Input
                  type="datetime-local"
                  label={"Available Till"}
                  placeholder="Select Start Date & Time"
                  value={availableTillFilter ? availableTillFilter : ""}
                  onChange={(e) => {
                    setAvailableTillFilter(e.target.value);
                  }}
                />
              </div>
            )}
            {/* Table Start */}
            <div className="mt-2">
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
                            if (head === "Car Make & Model ") {
                              sortKey = "make_and_model";
                            } else if (head === "Car Number") {
                              sortKey = "number";
                            } else if (head === "Driver Name") {
                              sortKey = "driver_name";
                            } else if (head === "Available From") {
                              sortKey = "available_from";
                            } else if (head === "Available Till") {
                              sortKey = "available_till";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Car Make & Model "
                                ? "make_and_model"
                                : head === "Car Number"
                                  ? "number"
                                  : head === "Driver Name"
                                    ? "driver_name"
                                    : head === "Available From"
                                      ? "available_from"
                                      : head === "Available Till"
                                        ? "available_till"
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
                        <tr
                          key={item?.id}
                          className={`cursor-pointer ${item?.id === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                          onClick={() => handleRowClick(item?.id)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.make_and_model || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.number || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 flex items-center gap-x-3 text-xs font-normal 3xl:text-sm">
                              <img
                                className="h-9 w-9 rounded-full object-cover"
                                src={item?.driver_image ? mediaUrl + item?.driver_image : Images.PLACEHOLDER}
                                alt="profile_img"
                              />
                              <span>{item?.driver_name || "-"}</span>
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {getLocalDateFromUnixTimestamp(item?.available_from, "DD MMM, YYYY h:mm A")}
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {getLocalDateFromUnixTimestamp(item?.available_till, "DD MMM, YYYY h:mm A")}
                            </p>
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
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "cars-edit")) && (
                            <button
                              className="border-b border-secondary text-sm font-medium text-secondary"
                              type="button"
                              onClick={() => {
                                setAddNewModal(true);
                                setModalData(detail);
                              }}
                            >
                              {t("buttons.edit")}
                            </button>
                          )}
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "cars-delete")) && (
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
                    <div className="my-5">
                      {detail?.driver_image !== null && (
                        <div>
                          <h3 className="mb-2 text-xs text-info-color">{t("cars.driverImage")}</h3>
                          <div className="h-full w-full">
                            <PhotoProvider>
                              <PhotoView src={mediaUrl + detail?.driver_image}>
                                <img
                                  src={mediaUrl + detail?.driver_image}
                                  alt="image"
                                  className="h-20 w-20 cursor-pointer rounded-full object-cover"
                                />
                              </PhotoView>
                            </PhotoProvider>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-5 3xl:grid-cols-3">
                      <TitleValue title={t("cars.carMakeModel")} value={detail?.make_and_model || "-"} />
                      <TitleValue title={t("cars.carNumber")} value={detail?.number || "-"} />
                      <TitleValue title={t("cars.driverName")} value={detail?.driver_name || "-"} />
                      <TitleValue title={t("cars.driverNumber")} value={detail?.driver_contact?.phone || "-"} />
                      <TitleValue title={t("cars.paid")} value={detail?.price_status === 1 ? "Yes" : "No" || "-"} />
                      <TitleValue title={t("cars.OwnerName")} value={detail?.owner_name || "-"} />
                      <TitleValue
                        title={t("cars.availableFrom")}
                        value={getLocalDateFromUnixTimestamp(detail?.available_from, "DD MMM, YYYY h:mm A")}
                      />
                      <TitleValue
                        title={t("cars.availableTill")}
                        value={getLocalDateFromUnixTimestamp(detail?.available_till, "DD MMM, YYYY h:mm A")}
                      />
                      <TitleValue title={"Seats"} value={detail?.seats || "-"} />
                    </div>

                    <div className="mt-2">
                      {detail?.car_images !== null && (
                        <div className="w-full">
                          <h3 className="mb-5 text-xs text-info-color">{t("cars.carImage")}</h3>
                          <div className="grid w-full grid-cols-3 gap-2">
                            <PhotoProvider>
                              {Array.isArray(detail?.car_images) &&
                                detail?.car_images?.map((car, index) => (
                                  <PhotoView key={car} src={mediaUrl + car}>
                                    <img
                                      src={mediaUrl + car}
                                      alt={`image-${index}`}
                                      className="h-full w-full cursor-pointer rounded-10 object-cover"
                                    />
                                  </PhotoView>
                                ))}
                            </PhotoProvider>
                          </div>
                        </div>
                      )}
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

      <AddCarModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        refreshData={getCarListing}
        setModalData={setModalData}
        data={modalData}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteCar}
        message={t("cars.carDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Cars;
