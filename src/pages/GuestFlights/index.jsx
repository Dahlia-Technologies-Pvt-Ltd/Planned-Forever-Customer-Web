import moment from "moment";
import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import AddGuestFlightModal from "./AddGuestFlightModal";
import { useMediaQuery } from "react-responsive";
import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import { GUEST_FLIGHTS_PRINT } from "../../routes/Names";
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
import ImportGuestFlightModal from "./ImportGuestFlightModal";

// Table Head
const GuestFlights = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD = [
    t("guestFlight.guestName"),
    t("guestFlight.departureFrom"),
    t("guestFlight.departureAt"),
    t("guestFlight.arrivingAt"),
    t("guestFlight.arrivingOwn"),
    t("guestFlight.flightNo"),
    t("guestFlight.bookingPNR"),
    t("guestFlight.webCheckin"),
  ];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, userData } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [flightFilter, setFlightFilter] = useState(null);
  const [webCheckinFilter, setWebCheckinFilter] = useState(null);

  // Data
  const [allGuestFlights, setAllGuestFlights] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [addNewImportModal, setAddNewImportModal] = useState(false);

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Detail of selected row
  const detail = allGuestFlights?.find((item) => item?.id === (activeRow || allGuestFlights[0]?.id));
  console.log("Detail of selected row:", detail);
  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allGuestFlights);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Guest Flights
  const getGuestFlights = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        type: "Flight",
        event_id: eventSelect,
        filter_type: flightFilter?.value,
      };

      const res = await ApiServices.guestFlight.getGuestFlights(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllGuestFlights(data?.data?.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
      console.error("Error fetching guest flights:", err);
      setErrorMessage(err.response?.data?.message || "An error occurred while fetching guest flights.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Guest Flight
  const handleDeleteGuestFlight = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.guestFlight.deleteGuestFlight(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getGuestFlights();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("guestFlight.flightDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      console.error("Error deleting guest flight:", err);
      setErrorMessage(err.response?.data?.message || "An error occurred while deleting guest flight.");
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
        await getGuestFlights(false);
        setCurrentPage(1);
      }
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getGuestFlights();
  }, [currentPage, flightFilter]);

  const [openWebCheckinModal, setOpenWebCheckinModal] = useState({ open: false, data: null });

  const handleWebCheckinChange = (item) => {
    setOpenWebCheckinModal({ open: true, data: item });
  };

  // Updated confirmWebCheckinChange function that just passes the web check-in value
  const confirmWebCheckinChange = async () => {
    try {
      setBtnLoading(true);

      // Get the current item
      const currentItem = openWebCheckinModal.data;

      // Create the payload with only the web_checkin value toggled
      let payload = {
        web_checkin: currentItem.web_checkin === 1 ? 0 : 1,
      };

      // Use the updateGuestFlight API from AddGuestFlightModal
      const res = await ApiServices.guestFlight.updateGuestFlight(currentItem.id, payload);
      const { data, message } = res;

      if (data.code === 200) {
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

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Guest Flights</h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-x-3">
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "guest_flights-create")) && (
                    <>
                      <Button title={t("guestFlight.addGuestFlight")} onClick={() => setAddNewModal(true)} />
                      <Button title={t("contacts.importExcel")} buttonColor="bg-purple-600" onClick={() => setAddNewImportModal(true)} />
                    </>
                  )}
                  <Link to={GUEST_FLIGHTS_PRINT}>
                    <Button title={t("buttons.print")} buttonColor="border-primary  bg-primary " />
                  </Link>
                </div>
                <div className="flex items-center gap-x-4">
                  {/* <div className="w-44">
                    <Dropdown
                      placeholder="Select"
                      options={[
                        { label: "All", value: "" },
                        { label: "Web Check-in Done", value: "web_checkin_done" },
                        { label: "Web Check-in Pending", value: "web_checkin_pending" },
                      ]}
                      value={flightFilter}
                      onChange={(e) => {
                        setFlightFilter(e);
                      }}
                      noMargin
                    />
                  </div> */}
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
                          getGuestFlights(true);
                        }
                      }}
                      onKeyPress={handleSearch}
                      className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
                    />
                  </div>
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
                            if (head === "Guest Name") {
                              sortKey = "user.first_name";
                            } else if (head === "Departure Date & Time") {
                              sortKey = "departure_datetime";
                            } else if (head === "Arrival Date & Time") {
                              sortKey = "arrival_datetime";
                            } else if (head === "Departure From") {
                              sortKey = "departure_from";
                            } else if (head === "Arriving At") {
                              sortKey = "arrival_at";
                            } else if (head === "Flight No") {
                              sortKey = "flight_train_no";
                            } else if (head === "Booking PNR") {
                              sortKey = "booking_pnr";
                            } else if (head === "Web Check-in") {
                              sortKey = "web_checkin";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Guest Name"
                                ? "user.first_name"
                                : head === "Departure Date & Time"
                                  ? "departure_datetime"
                                  : head === "Arrival Date & Time"
                                    ? "arrival_datetime"
                                    : head === "Departure From"
                                      ? "departure_from"
                                      : head === "Arriving At"
                                        ? "arrival_at"
                                        : head === "Flight No"
                                          ? "flight_train_no"
                                          : head === "Booking PNR"
                                            ? "booking_pnr"
                                            : head === "Web Check-in"
                                              ? "web_checkin"
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
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.user?.first_name + " " + item?.user?.last_name || "-"}
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.departure_from || "-"}</p>
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-nowrap text-xs font-normal 3xl:text-sm">
                              {moment.unix(item?.departure_datetime).format("D MMM YYYY  h:mm A") || "-"}
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.arrival_at || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-nowrap text-xs font-normal 3xl:text-sm">
                              {moment.unix(item?.arrival_datetime).format("D MMM YYYY  h:mm A") || "-"}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.flight_train_no || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.booking_pnr || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
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
                        </tr>
                      ))
                    ) : (
                      // Render "No Data" message
                      <tr className="h-[400px]">
                        <td colSpan="8">
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
                        <h3 className="heading">{t("headings.details")} </h3>
                        <div className="flex items-center gap-x-3">
                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "guest_flights-edit")) && (
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
                            userData.role.permissions?.some((item) => item === "guest_flights-delete")) && (
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

                    <div className="grid grid-cols-2 gap-5 3xl:grid-cols-2">
                      <TitleValue title={t("guestFlight.guestName")} value={detail?.user?.first_name + " " + detail?.user?.last_name || t("nA")} />
                      <TitleValue
                        title={t("guestFlight.departureDateTime")}
                        value={moment.unix(detail?.departure_datetime).format("D MMM YYYY h:mm A") || t("nA")}
                      />
                      <TitleValue
                        title={t("guestFlight.arrivalDateTime")}
                        value={moment.unix(detail?.arrival_datetime).format("D MMM YYYY h:mm A") || t("nA")}
                      />
                      <TitleValue title={t("guestFlight.departureFrom")} value={detail?.departure_from || t("nA")} />
                      <TitleValue title={t("guestFlight.arrivingAt")} value={detail?.arrival_at || t("nA")} />
                      <TitleValue title={t("guestFlight.flightNo")} value={detail?.flight_train_no || t("nA")} />
                      <TitleValue title={t("guestFlight.bookingPNR")} value={detail?.booking_pnr || t("nA")} />
                      <TitleValue title={t("guestFlight.seatNo")} value={detail?.seat_no || t("nA")} />
                      <TitleValue title={t("guestFlight.webCheckin")} value={detail?.web_checkin === 1 ? t("yes") : t("no") || t("nA")} />
                      <div className="col-span-2 space-y-2">
                        {detail?.children?.length > 0 && (
                          <>
                            <h2 className="text-secondary">Family Member Details</h2>
                            {detail?.children?.map((item, index) => (
                              <div className="space-y-1" key={index}>
                                <h2>{item?.name}</h2>
                                <div className="grid grid-cols-2 gap-5 3xl:grid-cols-2">
                                  <TitleValue title={t("guestFlight.bookingPNR")} value={item?.booking_pnr || t("nA")} />
                                  <TitleValue title={t("guestFlight.seatNo")} value={item?.seat_no || t("nA")} />
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
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
      <ImportGuestFlightModal isOpen={addNewImportModal} setIsOpen={() => setAddNewImportModal(false)} refreshData={getGuestFlights} />

      {/* Add Guest Flight Modal */}
      <AddGuestFlightModal
        data={modalData}
        isOpen={addNewModal}
        setModalData={setModalData}
        refreshData={getGuestFlights}
        setIsOpen={() => setAddNewModal(false)}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteGuestFlight}
        message={t("guestFlight.flightDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />

      {/* Web Check-in Modal */}
      <ConfirmationModal
        data={openWebCheckinModal.data}
        isOpen={openWebCheckinModal.open}
        handleSubmit={confirmWebCheckinChange}
        message={t("guestFlight.webCheckinUpdateConf")}
        setIsOpen={(open) => setOpenWebCheckinModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default GuestFlights;
