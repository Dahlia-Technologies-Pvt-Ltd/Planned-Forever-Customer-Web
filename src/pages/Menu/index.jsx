import Lottie from "react-lottie";
import React, { useState } from "react";
import AddMenuModal from "./AddMenuModal";
import ReactPaginate from "react-paginate";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import ApiServices from "../../api/services";
import animationData from "../../assets/lottie/no_data";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import CountModal from "./CountModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import {
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useEffect } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { MENU_PRINT, TRENDING_MENU } from "../../routes/Names";
import { mediaUrl } from "../../utilities/config";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";
import { hasPermission } from "../../utilities/permissions";
// Table Head

// local data
const hotelData = [
  {
    date: "17-02-2015",
    session: "Breakfast ",
    start_time: "7:00 AM",
    end_time: "10:00 AM",
    description: "",
    menu_file: [
      {
        item: "Coffee",
        type: "Hot drinks",
        quantity: "150",
        description: "",
      },
      {
        item: "Coffee",
        type: "Hot drinks",
        quantity: "150",
        description: "",
      },
    ],
  },
];

const Menu = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD = [t("menu.date"), t("menu.session_name"), t("menu.start_time"), t("menu.end_time")];
  const TABLE_HEAD_Detail = [t("menu.menu_item"), t("menu.courses_type"), t("menu.quantity"), t("menu.description"), t("menu.image")];
  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, userData, selectedEventRights } =
    useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allMenu, setAllMenu] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);
  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  // Active Row
  const handleRowClick = (item) => {
    setActiveRow(item?.id);
  };

  // Detail of selected row
  const detail = allMenu?.find((item) => item?.id === (activeRow || allMenu[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allMenu);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Menu
  const getMenus = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.menu.getMenus(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllMenu(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete Menu
  const handleDeleteMenu = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.menu.deleteMenu(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getMenus();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("menu.menuDeleteSuccess"),
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

  // Use Effects
  // useEffect(() => {
  //   if (searchText?.length > 1 || searchText?.length === 0) {
  //     getMenus();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getMenus(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === '') {
  //     getMenus();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getMenus();
  }, [currentPage]);

  const [count, setCount] = useState([]);

  const [isOpenCount, setIsOpenCount] = useState(false);

  const getMenuCount = async () => {
    if (!eventSelect) {
      setCount([]);
      return;
    }

    try {
      const res = await ApiServices.menu.getPreferenceCount(eventSelect);
      const { data, message } = res;

      if (data.code === 200) {
        setCount(data.data);
        // console.log(data.data);
      }
    } catch (err) {
      setCount([]);
    } finally {
    }
  };

  useEffect(() => {
    getMenuCount();
  }, [eventSelect]);

  useEffect(() => {
    if (isOpenCount) {
      getMenuCount();
    }
  }, [isOpenCount, eventSelect]);

  return (
    <>
      <div className="venues-page-layout grid grid-cols-12 items-start gap-5 lg:items-stretch">
        <div className="col-span-12 lg:col-span-8">
          <div className="venues-list-card card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)]">
            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-4">
                <h2 className="shrink-0 text-xl font-semibold text-black">{t("menu.menu")}</h2>
                <div className="relative ml-auto flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="search"
                    id="search"
                    name="search"
                    placeholder={`${t("placeholders.search")}...`}
                    autoComplete="off"
                    value={searchText}
                    onChange={(event) => {
                      setSearchText(event.target.value);
                      if (!event.target.value.trim()) getMenus(true);
                    }}
                    onKeyDown={handleKeyPress}
                    className="block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:border-primary-color-100 focus:ring-primary-color"
                  />
                </div>
              </div>

              <div className="mt-4 flex w-full items-center justify-end gap-3">
                {selectedEventRights?.rights?.includes("Trending Menu Items") && (
                  <Link to={TRENDING_MENU}>
                    <Button title={t("menu.trending_menu")} buttonColor="border-primary bg-pink-500" />
                  </Link>
                )}
                <div className="group relative inline-flex">
                  <Button
                    title={t("menu.guest_count")}
                    buttonColor="border border-cyan-500 bg-cyan-500 hover:border-cyan-600 hover:bg-cyan-600"
                    className="focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
                    onClick={() => setIsOpenCount(true)}
                  />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-secondary px-3 py-2 text-xs font-normal text-white shadow-lg group-hover:block group-focus-within:block"
                  >
                    {t("menu.guestMealPreferencesTooltip")}
                  </span>
                </div>
                {hasPermission(userData, "menu-create") && <Button title={t("menu.addMenu")} onClick={() => setAddNewModal(true)} />}
                <Link to={MENU_PRINT}>
                  <Button
                    title={t("buttons.print")}
                    buttonColor="border border-secondary bg-transparent"
                    className="!text-secondary hover:bg-secondary/5"
                  />
                </Link>
              </div>
            </div>
            {/* Table Start */}
            <div className="mt-5 flex min-h-0 flex-1 flex-col">
              <div className="-mx-6 mb-8 flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {TABLE_HEAD.map((head) => (
                        <th
                          key={head}
                          className="border-b border-gray-100 bg-white p-4 first:pl-6"
                          onClick={() => {
                            let sortKey;
                            if (head === "Date") {
                              sortKey = "date";
                            } else if (head === "Name of session") {
                              sortKey = "session";
                            } else if (head === "Start time") {
                              sortKey = "start_time";
                            } else if (head === "End time") {
                              sortKey = "end_time";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-sm font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Date"
                                ? "date"
                                : head === "Name of session"
                                  ? "session"
                                  : head === "Start time"
                                    ? "start_time"
                                    : head === "End time"
                                      ? "end_time"
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
                          onClick={() => handleRowClick(item)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-sm font-normal text-primary-color-200">{moment.unix(item?.date).format("D MMM YYYY")}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-sm font-normal text-primary-color-200">{item?.session || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-sm font-normal text-primary-color-200">
                              {moment(item?.start_time, "HH:mm").format("hh:mm A")}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-sm font-normal text-primary-color-200">{moment(item?.end_time, "HH:mm").format("hh:mm A")}</p>
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
                      <tr>
                        <td colSpan="4">
                          <div className="flex min-h-[52vh] flex-col items-center justify-center px-4 text-center">
                            <Lottie options={emptyFolderAnimation} width={170} height={170} />
                            <h4 className="-mt-4 text-base font-semibold text-black">{t("menu.noMenusAdded")}</h4>
                            <p className="mt-2 max-w-xs text-sm text-primary-light-color">{t("menu.addFirstMenu")}</p>
                            {hasPermission(userData, "menu-create") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setModalData(null);
                                  setAddNewModal(true);
                                }}
                                className="mt-5 min-w-[150px] rounded-10 bg-secondary px-6 py-3 text-sm font-semibold text-white"
                              >
                                {t("menu.addMenu")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {items.length > 0 && <div className="absolute bottom-4">
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
              </div>}
            </div>
            {/* Table End */}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="venues-details-card card flex h-[72vh] flex-col overflow-hidden shadow-[0_12px_34px_rgba(15,23,42,0.14)] lg:sticky lg:top-0">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : detail ? (
              <div className="-mx-1 -my-1 flex min-h-0 flex-1 flex-col px-1 py-1">
                <div className="shrink-0">
                  <div className="flex items-center justify-end gap-2">
                    {hasPermission(userData, "menu-edit") && (
                      <button
                        type="button"
                        className="flex h-8 items-center gap-2 rounded-lg border border-secondary bg-transparent px-3 text-sm font-medium text-secondary hover:bg-secondary/5"
                        onClick={() => {
                          setModalData(detail);
                          setAddNewModal(true);
                        }}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        {t("buttons.edit")}
                      </button>
                    )}
                    {hasPermission(userData, "menu-delete") && (
                      <button
                        type="button"
                        className="flex h-8 items-center gap-2 rounded-lg border border-red-500 bg-transparent px-3 text-sm font-medium text-red-500 hover:bg-red-50"
                        onClick={() => setOpenDeleteModal({ open: true, data: detail })}
                      >
                        <TrashIcon className="h-4 w-4" />
                        {t("buttons.delete")}
                      </button>
                    )}
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-black">{detail?.session || "Menu Details"}</h2>
                  <p className="mt-2 text-sm text-gray-600">{moment.unix(detail?.date).format("D MMM YYYY")}</p>
                </div>

                <div className="venue-details-scroll -mr-2 mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
                  <section>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <CalendarDaysIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("menu.menuDetails")}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-5">
                      <div>
                        <p className="text-xs text-gray-600">{t("menu.date")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{moment.unix(detail?.date).format("D MMM YYYY")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("menu.session_name")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.session || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("menu.start_time")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{moment(detail?.start_time, "HH:mm").format("hh:mm A")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("menu.end_time")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{moment(detail?.end_time, "HH:mm").format("hh:mm A")}</p>
                      </div>
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <ClockIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("menu.menuItems")}</h3>
                    </div>
                    <div className="space-y-3 pt-5">
                      {detail?.menu_items?.length ? (
                        detail.menu_items.map((menuItem, index) => (
                          <div key={menuItem?.id || index} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                            {menuItem?.image ? (
                              <PhotoProvider>
                                <PhotoView src={mediaUrl + menuItem.image}>
                                  <img
                                    src={mediaUrl + menuItem.image}
                                    alt={menuItem?.name || "Menu item"}
                                    className="h-16 w-16 shrink-0 cursor-pointer rounded-lg object-cover"
                                  />
                                </PhotoView>
                              </PhotoProvider>
                            ) : (
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400">
                                <PhotoIcon className="h-6 w-6" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-black">{menuItem?.name || "-"}</p>
                              <p className="mt-1 text-xs text-gray-600">
                                {[menuItem?.type, menuItem?.qty].filter(Boolean).join(" · ") || "-"}
                              </p>
                              {menuItem?.notes && <p className="mt-2 text-xs leading-5 text-gray-600">{menuItem.notes}</p>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">{t("menu.noMenuItemsAdded")}</p>
                      )}
                    </div>
                  </section>

                  {detail?.notes && detail.notes !== "-" && (
                    <section className="mt-8 pb-2">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                        <DocumentTextIcon className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">{t("headings.notes")}</h3>
                      </div>
                      <p className="pt-5 text-sm leading-6 text-black">{detail.notes}</p>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div>
                  <Lottie options={emptyFolderAnimation} width={170} height={170} />
                  <h4 className="-mt-4 text-base font-semibold text-black">{t("menu.noMenuSelected")}</h4>
                  <p className="mt-2 text-sm text-primary-light-color">{t("menu.selectMenuToView")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddMenuModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        setModalData={setModalData}
        data={modalData}
        refreshData={getMenus}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteMenu}
        message={t("menu.menuDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />

      <CountModal data={count} isOpen={isOpenCount} setIsOpen={setIsOpenCount} />
    </>
  );
};

export default Menu;
