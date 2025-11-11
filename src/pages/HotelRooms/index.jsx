import moment from "moment";
import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import AllocateHotelRoomModal from "./AllocateHotelRoomModal";
import { useSortableData } from "../../hooks/useSortableData";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { HOTEL_ROOM_PRINT } from "../../routes/Names";
import { Link } from "react-router-dom";
import { Switch } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../components/common/Dropdown";
import Input from "../../components/common/Input";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";

const HotelRooms = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [
    t("hotelRoom.CheckIn"),
    t("hotelRoom.CheckOut"),
    t("hotelRoom.guestName"),
    t("hotelRoom.hotelName"),
    t("hotelRoom.roomType"),
    t("hotelRoom.roomNo"),
    t("hotelRoom.hasCheckedIn"),
  ];
  const TABLE_HEAD_Detail = [t("hotelRoom.adults"), t("hotelRoom.children")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, userData, allHotels, getHotels } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allHotelRoom, setAllHotelRoom] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [hotelFilter, setHotelFilter] = useState(null);
  const [checkInFilter, setCheckInFilter] = useState("");
  const [checkOutFilter, setCheckOutFilter] = useState("");

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Detail of selected row
  const detail = allHotelRoom?.find((item) => item?.id === (activeRow || allHotelRoom[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allHotelRoom);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Hotel Room
  const getHotelRoom = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
        hotel_id: hotelFilter?.value || "",
        start_date: checkInFilter ? toUTCUnixTimestamp(checkInFilter) : "",
        end_date: checkOutFilter ? toUTCUnixTimestamp(checkOutFilter) : "",
      };

      const res = await ApiServices.hotelRoom.getHotelRoom(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllHotelRoom(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete Hotel
  const handleDeleteHotel = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.hotelRoom.deleteHotelRoom(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getHotelRoom();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("hotelRoom.hotelRoomDeleteSuccess"),
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

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getHotelRoom(false);
        setCurrentPage(1);
      }
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getHotelRoom();
  }, [currentPage, hotelFilter, checkInFilter, checkOutFilter]);

  useEffect(() => {
    getHotels();
  }, []);

  const [openStatusModal, setOpenStatusModal] = useState({ open: false, data: null });

  const handleStatusChange = (item) => {
    setOpenStatusModal({ open: true, data: item });
  };

  const confirmStatusChange = async () => {
    try {
      setBtnLoading(true);

      let payload = {
        hasArrived: openStatusModal.data.hasArrived === false ? true : false,
      };

      const res = await ApiServices.hotelRoom.updateHotelRoom(openStatusModal.data.id, payload);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getHotelRoom();
        setOpenStatusModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: "Hotel Room status has been updated successfully",
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

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Hotel Room</h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-x-3">
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "allocated-rooms-create")) && (
                    <Button title={t("hotelRoom.allocateHotelRoom")} onClick={() => setAddNewModal(true)} />
                  )}
                  <Link to={HOTEL_ROOM_PRINT}>
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
                          getHotelRoom(true);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      className="focus:border-primary-color-100 block h-11 w-44 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {showFilter && (
              <div className=" grid grid-cols-3 items-center gap-x-4 pt-6">
                <div className="pt-2">
                  <Dropdown
                    title={t("hotelRoom.hotel")}
                    placeholder="Select Hotel"
                    options={[{ label: "All", value: "" }, ...(Array.isArray(allHotels) ? allHotels : [])]}
                    value={hotelFilter}
                    onChange={(e) => {
                      setHotelFilter(e);
                    }}
                    noMargin
                  />
                </div>
                <Input
                  type="datetime-local"
                  label={t("hotelRoom.CheckIn")}
                  placeholder="Select Check-in Date"
                  value={checkInFilter}
                  onChange={(e) => {
                    setCheckInFilter(e.target.value);
                  }}
                />
                <Input
                  type="datetime-local"
                  label={t("hotelRoom.CheckOut")}
                  placeholder="Select Check-out Date"
                  value={checkOutFilter}
                  onChange={(e) => {
                    setCheckOutFilter(e.target.value);
                  }}
                />
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
                            if (head === "Check In") {
                              sortKey = "check_in";
                            } else if (head === "Check Out") {
                              sortKey = "check_out";
                            } else if (head === "Guest Name") {
                              sortKey = "contact.name";
                            } else if (head === "Hotel Name") {
                              sortKey = "hotel.name";
                            } else if (head === "Room Type") {
                              sortKey = "room_type";
                            } else if (head === "Room No") {
                              sortKey = "room_no";
                            } else if (head === "Has Allocate") {
                              sortKey = "status";
                            } else if (head === "Occupants") {
                              sortKey = "occupants";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Check In"
                                ? "check_in"
                                : head === "Check Out"
                                  ? "check_out"
                                  : head === "Guest Name"
                                    ? "contact.name"
                                    : head === "Hotel Name"
                                      ? "hotel.name"
                                      : head === "Room Type"
                                        ? "room_type"
                                        : head === "Room No"
                                          ? "room_no"
                                          : head === "Occupants"
                                            ? "occupants"
                                            : head === "Has Allocate"
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
                              {moment.unix(item?.check_in).format("D MMM YYYY") || "-"}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {moment.unix(item?.check_out).format("D MMM YYYY") || "-"}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                                {item?.child === null ? item?.user?.first_name + " " + item?.user?.last_name : item?.child?.name}
                              </p>
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.hotel?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.room?.room_type || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.room?.room_no || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <div className="flex items-center justify-center gap-x-3">
                              <Switch
                                checked={item?.hasArrived === true}
                                onChange={() => handleStatusChange(item)}
                                className={`group relative flex h-6 w-12 cursor-pointer rounded-full ${item?.hasArrived === true ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item?.hasArrived === true ? "translate-x-6" : "translate-x-0"}`}
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
                <div className="-mr-4 h-[70vh] space-y-8 overflow-auto pr-4 3xl:mr-0">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="sub-heading">{t("headings.basicInfo")}</h2>
                      <div className="flex justify-between">
                        <h3 className="heading">{t("headings.details")}</h3>
                        <div className="flex items-center gap-x-3">
                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "allocated-rooms-edit")) && (
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
                            userData.role.permissions?.some((item) => item === "allocated-rooms-delete")) && (
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
                      <TitleValue title={t("hotelRoom.CheckIn")} value={moment.unix(detail?.check_in).format("D MMM YYYY") || "-"} />
                      <TitleValue title={t("hotelRoom.CheckOut")} value={moment.unix(detail?.check_out).format("D MMM YYYY") || "-"} />
                      <TitleValue
                        title={t("hotelRoom.guestName")}
                        value={detail?.child === null ? detail?.user?.first_name + " " + detail?.user?.last_name : detail?.child?.name}
                      />
                      <TitleValue title={t("hotelRoom.hotelName")} value={detail?.hotel?.name || "-"} />
                      <TitleValue title={t("hotelRoom.roomType")} value={detail?.room?.room_type || "-"} />
                      <TitleValue title={t("hotelRoom.roomNo")} value={detail?.room?.room_no || "-"} />
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
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
              </div>
            )}
          </div>
        </div>
      </div>

      <AllocateHotelRoomModal
        refreshData={getHotelRoom}
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        setModalData={setModalData}
        data={modalData}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteHotel}
        message={t("hotelRoom.hotelRoomDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />

      <ConfirmationModal
        data={openStatusModal.data}
        isOpen={openStatusModal.open}
        handleSubmit={confirmStatusChange}
        message="Are you sure you want to change the status of this hotel room?"
        setIsOpen={(open) => setOpenStatusModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default HotelRooms;