import moment from "moment";
import { useEffect } from "react";
import Lottie from "react-lottie";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import Skeleton from "react-loading-skeleton";
import ApiServices from "../../api/services";
import { useMediaQuery } from "react-responsive";
import AddDepartureModal from "./AddDepartureModal";
import MessageSchedule from "./MessageSchedule";
import Button from "../../components/common/Button";
import { DEPARTURES_PRINT } from "../../routes/Names";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { mediaUrl } from "../../utilities/config";
import { Switch } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../components/common/Dropdown";
import ImportDepartureModal from "./ImportDepartureModal";

// Table Head
const Departures = () => {
  const { t } = useTranslation("common");
  const TABLE_HEAD = [
    t("departure.dateTime"),
    t("departure.guestName"),
    t("departure.departingFrom"),
    t("departure.departingTo"),
    t("departure.flightTrainNo"),
    t("departure.noOfPeople"),
    t("departure.hasDeparted"),
  ];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, userData } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [departuredFilter, setDeparturedFilter] = useState(null);
  // Data
  const [allDepartures, setAllDepartures] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [addNewImportModal, setAddNewImportModal] = useState(false);
 const [addNewSendMessageModal, setAddNewSendMessageModal] = useState(false);
  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Detail of selected row
  const detail = allDepartures?.find((item) => item?.id === (activeRow || allDepartures[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allDepartures);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Departure
  const getDeparture = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        type: "departure",
        event_id: eventSelect,
        filter_type: departuredFilter?.value,
      };

      const res = await ApiServices.arrivalDeparture.getArrivalDeparture(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllDepartures(data?.data?.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete Departure
  const handleDeleteDeparture = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.arrivalDeparture.deleteArrivalDeparture(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getDeparture();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("departure.departureDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
    } finally {
      setBtnLoading(false);
    }
  };

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // Handle Search
  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getDeparture(false);
        setCurrentPage(1);
      }
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getDeparture();
  }, [currentPage, departuredFilter]);

  const [openStatusModal, setOpenStatusModal] = useState({ open: false, data: null });

  const handleStatusChange = (item) => {
    setOpenStatusModal({ open: true, data: item });
  };

  const confirmStatusChange = async () => {
    // if(detail?.id){

    try {
      setBtnLoading(true);

      // let payload = {
      //   id: [openStatusModal.data.id]
      // };

      const res = await ApiServices.arrivalDeparture.updateArrivalDepartureStatus(openStatusModal.data.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getDeparture();
        setOpenStatusModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: "Has Departed status has been updated successfully",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
    } finally {
      setBtnLoading(false);
    }
    // }
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex flex-col gap-y-4">
                <h3 className="heading">Departures</h3>

                {/* Top Buttons */}
                <div className="flex items-center gap-x-3">
                  {(userData?.role?.display_name === "web_admin" ||
                    userData.role.permissions?.some((item) => item === "departures-create")) && (
                    <>
                      <Button title={t("departure.addDeparture")} onClick={() => setAddNewModal(true)} />

                      <Button
                        title={t("contacts.importExcel")}
                        buttonColor="bg-purple-600"
                        onClick={() => setAddNewImportModal(true)}
                      />
                    </>
                  )}

                  <Link to={DEPARTURES_PRINT}>
                    <Button title={t("buttons.print")} buttonColor="border-primary bg-primary" />
                  </Link>

                  <Button
                    title="Send Message"
                    onClick={() => setAddNewSendMessageModal(true)}
                    buttonColor="bg-green-500"
                  />
                </div>

                {/* Filters under buttons */}
                <div className="flex items-center gap-x-4">
                  <div className="w-44">
                    <Dropdown
                      placeholder="Select"
                      options={[
                        { label: "All", value: "" },
                        { label: "Car Allocated", value: "car_allocated" },
                        { label: "Car Not Allocated", value: "car_not_allocated" },
                        { label: "Has Departured", value: "arrived" },
                        { label: "Not Departured", value: "not_arrived" },
                      ]}
                      value={departuredFilter}
                      onChange={(e) => setDeparturedFilter(e)}
                      noMargin
                    />
                  </div>

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
                        if (e.target.value.trim() === "") getDeparture(true);
                      }}
                      onKeyPress={handleSearch}
                      className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
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
                            if (head === "Departure Date & Time") {
                              sortKey = "created_at_unix";
                            } else if (head === "Guest Name") {
                              sortKey = "contact.name";
                            } else if (head === "Departing To") {
                              sortKey = "from";
                            } else if (head === "Departing Point") {
                              sortKey = "to";
                            } else if (head === "Flight/Train No") {
                              sortKey = "fligh_train_no";
                            } else if (head === "No. of People") {
                              sortKey = "no_of_person";
                            } else if (head === "Has Departed") {
                              sortKey = "status";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Departure Date & Time"
                                ? "created_at_unix"
                                : head === "Guest Name"
                                  ? "contact.name"
                                  : head === "Departing To"
                                    ? "from"
                                    : head === "Departing Point"
                                      ? "to"
                                      : head === "Flight/Train No"
                                        ? "fligh_train_no"
                                        : head === "No. of People"
                                          ? "no_of_person"
                                          : head === "Has Departed"
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
                        <td colSpan="7">
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
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {moment.unix(item?.date).format("D MMM YYYY h:mm A") || "-"}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.contact?.first_name + " " + item?.contact?.last_name || "-"}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.from || "-"}</p>
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.to || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.fligh_train_no || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.no_of_person || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <div className="flex items-center justify-center gap-x-3">
                              <Switch
                                checked={item?.status === 1}
                                onChange={() => handleStatusChange(item)}
                                className={`group relative flex h-6 w-12 cursor-pointer rounded-full ${item?.status === 1 ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item?.status === 1 ? "translate-x-6" : "translate-x-0"}`}
                                />
                              </Switch>
                            </div>
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
                        <td colSpan="7">
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
              <Skeleton count={10} height={50} />
            ) : activeRow ? (
              <>
                <div className="-mr-6 h-[70vh] space-y-8 overflow-y-auto 3xl:mr-0">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="sub-heading">{t("headings.basicInfo")}</h2>
                      <div className="flex justify-between">
                        <h3 className="heading">{t("headings.details")}</h3>
                        <div className="flex items-center gap-x-3">
                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "departures-edit")) && (
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
                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "departures-delete")) && (
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
                      <TitleValue title={t("departure.departureDateTime")} value={moment.unix(detail?.date).format("D MMM YYYY") || "-"} />
                      <TitleValue title={t("departure.guestName")} value={detail?.contact?.first_name + " " + detail?.contact?.last_name || "-"} />
                      <TitleValue title={t("departure.arrivingFrom")} value={detail?.from || "-"} />
                      <TitleValue title={t("departure.arrivingAt")} value={detail?.to || "-"} />
                      <TitleValue title={t("departure.flightTrainNo")} value={detail?.fligh_train_no || "-"} />
                      <TitleValue title={t("departure.noOfPeople")} value={detail?.no_of_person || "-"} />
                      <TitleValue title={t("departure.hasDeparture")} value={detail?.status === 1 ? "Yes" : "No" || "-"} />
                    </div>
                  </div>

                  {detail?.car?.driver_image && (
                    <div className="my-5">
                      {detail?.car?.driver_image !== null && (
                        <div>
                          <h3 className="mb-2 text-xs text-info-color">{t("departure.driverImage")}</h3>
                          <div className="h-full w-full">
                            <img src={mediaUrl + detail?.car?.driver_image} alt="image" className="h-20 w-20 rounded-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <TitleValue title={t("departure.driverName")} value={detail?.car?.driver_name || "-"} />
                    <TitleValue title={t("departure.driverContact")} value={detail?.car?.driver_contact?.phone || "-"} />
                    <TitleValue title={t("departure.carMakeModel")} value={detail?.car?.make_and_model || "-"} />
                    <TitleValue title={t("departure.carNumber")} value={detail?.car?.number || "-"} />
                    <TitleValue title={"Car Allocation Type"} value={detail?.car_allocation_type === "pick_up" ? "Pick Up" : "Drop Off" || t("nA")} />
                  </div>

                  {detail?.car?.car_images && (
                    <div className="mt-2">
                      {detail?.car?.car_images !== null && (
                        <div className="w-full">
                          <h3 className="mb-5 text-xs text-info-color">{t("departure.carImage")}</h3>
                          <div className="grid w-full grid-cols-3 gap-2">
                            {detail?.car?.car_images?.map((car) => (
                              <img src={mediaUrl + car} alt="image" className="h-full w-full rounded-10 object-cover" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h2 className="sub-heading mb-5">{t("headings.otherInfo")}</h2>

                    <TitleValue title={t("headings.notes")} value={detail?.notes || "-"} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-[70vh] items-center justify-center">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
              </div>
            )}
          </div>
        </div>
      </div>
      <ImportDepartureModal isOpen={addNewImportModal} setIsOpen={() => setAddNewImportModal(false)} refreshData={getDeparture} />

      {/* Add Departure Modal */}
      <AddDepartureModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        setModalData={setModalData}
        data={modalData}
        refreshData={getDeparture}
      />

       <MessageSchedule
        refreshData=""
        isOpen={addNewSendMessageModal}
        setIsOpen={() => setAddNewSendMessageModal(false)}
        setModalData={setModalData}
        data={modalData}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteDeparture}
        message={t("departure.departureDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />

      <ConfirmationModal
        data={openStatusModal.data}
        isOpen={openStatusModal.open}
        handleSubmit={confirmStatusChange}
        message="Are you sure you want to change the status of this departure?"
        setIsOpen={(open) => setOpenStatusModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Departures;
