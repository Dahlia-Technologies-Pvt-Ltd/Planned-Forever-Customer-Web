import React, { useState, useEffect } from "react";
import moment from "moment";
import Lottie from "react-lottie";
import { useMediaQuery } from "react-responsive";
import Skeleton from "react-loading-skeleton";
import ReactPaginate from "react-paginate";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ApiServices from "../../api/services";
import Button from "../../components/common/Button";
import AddHotelRoomSetupModal from "./AddHotelRoomSetupModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import TitleValue from "../../components/common/TitleValue";
import Dropdown from "../../components/common/Dropdown";
import ImportHotelRoomModal from "./ImportHotelRoomModal";

const HotelRoomSetup = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("hotels.hotelName"), t("hotels.roomType"), t("hotels.room"), t("hotels.capacity")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, userData, allHotels, getHotels } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Data
  const [allRooms, setAllRooms] = useState([]);

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
  const detail = allRooms?.find((item) => item?.id === (activeRow || allRooms[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allRooms);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Hotel Rooms
  const getHotelRooms = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      // Add hotel_id to payload if a hotel is selected
      if (selectedHotel) {
        payload.hotel_id = selectedHotel.value;
      }

      const res = await ApiServices.hotelRooms.getHotelRooms(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setAllRooms(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
      console.error("Error fetching hotel rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Hotel Room
  const handleDeleteHotelRoom = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.hotelRooms.deleteHotelRoom(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        getHotelRooms();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("hotels.hotelRoomDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      console.error("Error deleting hotel room:", err);
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
        await getHotelRooms(false);
        setCurrentPage(1);
      }
    }
  };

  // Handle hotel filter change
  const handleHotelFilterChange = (selected) => {
    setSelectedHotel(selected);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getHotels();
  }, [eventSelect]);

  useEffect(() => {
    getHotelRooms();
  }, [currentPage, eventSelect, selectedHotel]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="heading">{t("pageTitles.hotelRooms")}</h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-x-3">
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "hotel-rooms-create")) && (
                    <>
                      <Button
                        title={t("hotels.addHotelRoom")}
                        onClick={() => {
                          setAddNewModal(true);
                          setModalData(null);
                        }}
                      />
                      <Button title={t("contacts.importExcel")} buttonColor="bg-purple-600" onClick={() => setAddNewImportModal(true)} />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-x-3">
                  {/* Hotel Filter Dropdown */}
                  <div className="-mt-2 w-52">
                    <Dropdown
                      placeholder={t("hotels.selectHotel")}
                      options={[{ label: "All", value: null }, ...allHotels]}
                      value={selectedHotel}
                      onChange={handleHotelFilterChange}
                      isClearable
                    />
                  </div>

                  {/* Search Input */}
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                      <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                    </div>
                    <input
                      type="text"
                      placeholder={t("placeholders.search")}
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        if (e.target.value.trim() === "") {
                          getHotelRooms(true);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className="border-b border-gray-100 bg-white p-4 first:pl-6"
                        onClick={() => {
                          let sortKey;
                          if (head === t("hotels.roomType")) sortKey = "room_type";
                          else if (head === t("hotels.room")) sortKey = "room_no";
                          else if (head === t("hotels.capacity")) sortKey = "capacity";
                          else if (head === t("hotels.hotelName")) sortKey = "hotel.name";

                          requestSort(sortKey);
                        }}
                      >
                        <p className="cursor-pointer whitespace-nowrap text-xs font-semibold leading-5">
                          {head}
                          {sortConfig.key ===
                            (head === t("hotels.roomType")
                              ? "room_type"
                              : head === t("hotels.room")
                                ? "room_no"
                                : head === t("hotels.capacity")
                                  ? "capacity"
                                  : head === t("hotels.hotelName")
                                    ? "hotel.name"
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
                    items.map((item) => (
                      <tr
                        key={item?.id}
                        className={`cursor-pointer ${item?.id === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                        onClick={() => handleRowClick(item?.id)}
                      >
                        <td className="py-3 pl-4 pr-3">
                          <p className="text-primary-color-200 text-xs 3xl:text-sm">{item?.hotel?.name || "-"}</p>
                        </td>
                        <td className="py-3 pl-6 pr-4">
                          <p className="text-primary-color-200 text-xs 3xl:text-sm">{item?.room_type || "-"}</p>
                        </td>
                        <td className="py-3 pl-4 pr-3">
                          <p className="text-primary-color-200 text-xs 3xl:text-sm">{item?.room_no || "-"}</p>
                        </td>
                        <td className="py-3 pl-4 pr-3">
                          <p className="text-primary-color-200 text-xs 3xl:text-sm">{item?.capacity || "-"}</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="h-[400px]">
                      <td colSpan="6">
                        <Lottie options={emptyFolderAnimation} width={200} height={200} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="absolute bottom-4">
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
          </div>
        </div>

        {/* Details Panel */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={9} height={50} />
            ) : activeRow ? (
              <>
                <div className="-mr-6 h-[70vh] space-y-8 overflow-y-auto 3xl:mr-0">
                  <div>
                    <div className="mb-5 flex items-center justify-between pr-3">
                      <h3 className="heading">{t("headings.details")}</h3>
                      <h2 className="sub-heading">{t("headings.basicInfo")}</h2>

                      <div className="flex items-center gap-x-3 ">
                        {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "hotel-rooms-edit")) && (
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
                          userData.role.permissions?.some((item) => item === "hotel-rooms-delete")) && (
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

                    <div>
                      <div className="grid grid-cols-2 gap-5 3xl:grid-cols-3">
                        <TitleValue title={t("hotels.hotelName")} value={detail?.hotel?.name || "-"} />
                        <TitleValue title={t("hotels.roomType")} value={detail?.room_type || "-"} />
                        <TitleValue title={t("hotels.room")} value={detail?.room_no || "-"} />
                        <TitleValue title={t("hotels.capacity")} value={detail?.capacity || "-"} />
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
      <ImportHotelRoomModal isOpen={addNewImportModal} setIsOpen={() => setAddNewImportModal(false)} refreshData={getHotelRooms} />

      {/* Add/Edit Hotel Room Modal */}
      <AddHotelRoomSetupModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        setModalData={setModalData}
        data={modalData}
        refreshData={getHotelRooms}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteHotelRoom}
        message={t("hotels.hotelRoomDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default HotelRoomSetup;
