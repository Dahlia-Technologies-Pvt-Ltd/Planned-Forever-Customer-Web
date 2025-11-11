import Lottie from "react-lottie";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import CardScheduleModal from "./CardScheduleModal";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
// import animationData from "../assets/lottie/no_data";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useEffect } from "react";
import ApiServices from "../../api/services";
import moment from "moment";
import { useTranslation } from "react-i18next";

const CardSchedule = () => {
  // translation
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("cardSchedule.scheduledOn"), t("cardSchedule.status"), "Send To"];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allCars, setAllCars] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  const [scheduleSmsList, setScheduleSmsList] = useState([]);

  // Detail of selected row
  const detail = scheduleSmsList?.find((item) => item?.id === (activeRow || scheduleSmsList[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(scheduleSmsList);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const getScheduleList = (emptySearch) => {
    let payload = {
      search: emptySearch ? "" : searchText,
      page: currentPage,
      per_page: itemsPerPage,
      type: "whatsApp",
      event_id: eventSelect,
    };

    ApiServices.Card_Schedule.getScheduleInvitationList(payload)
      .then((res) => {
        const { data, message } = res;

        console.log({ res });

        if (data?.code === 200) {
          setScheduleSmsList(data?.data?.data || []);
          setCurrentPage(data?.data?.pagination?.current_page);
          setTotalPages(Math.ceil(data?.data?.pagination?.total / data?.data?.pagination?.per_page));
        }
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  // Delete Event
  const handleDeleteScheduleSms = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.Card_Schedule.deleteScheduleInvitation(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        getScheduleList();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("cardSchedule.cardScheduleDeleteSuccess"),
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

  useEffect(() => {
    getScheduleList();
  }, [currentPage]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getScheduleList(false);
        setCurrentPage(1);
      }
    }
  };

  console.log({ fggfgfgf: items });

  // useEffect(() => {
  //   if (searchText.trim() === '') {
  //     getUserType();
  //   }
  // }, [searchText]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-12">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">{t("title")}</h3>
              <div className="flex items-center justify-between gap-3">
                <Button title={t("cardSchedule.sendOrSchedule")} onClick={() => setAddNewModal(true)} />
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
                        getScheduleList(true);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    className="focus:border-primary-color-100 block h-11 w-44 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
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
                            if (head === "Schedule Title ") {
                              sortKey = "title";
                            } else if (head === "Scheduled On") {
                              sortKey = "send_at";
                            } else if (head === "Status") {
                              sortKey = "status";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig?.key ===
                              (head === "Schedule Title "
                                ? "title"
                                : head === "Scheduled On"
                                  ? "send_at"
                                  : head === "Status"
                                    ? "status"
                                    : head?.toLowerCase()) && sortConfig?.direction === "asc" ? (
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
                          {/* <td className="py-3 pl-6 pr-4">
                            <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.title || "-"}</p>
                          </td> */}

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {moment(item?.sent_at).format("D MMM YYYY  h:mm A") || "-"}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.status}</p>
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.sent_to || "-"}</p>
                            </p>
                          </td>
                          {/* 
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <div className="flex items-center gap-x-3">
                              <span
                                onClick={() => {
                                  setAddNewModal(true);
                                  setModalData(item);
                                }}
                                className="cursor-pointer text-xs font-normal text-secondary underline underline-offset-4 3xl:text-sm"
                              >
                                {t("buttons.edit")}
                              </span>

                              <span
                                onClick={() => setOpenDeleteModal({ open: true, data: item })}
                                className="cursor-pointer text-xs font-normal text-red-500 underline underline-offset-4 3xl:text-sm"
                              >
                                {t("buttons.delete")}

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

        {/* <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items?.length > 0 ? (
              <>
                <div className="flex justify-between">
                  <h3 className="heading">Details</h3>
                  <div className="flex items-center gap-x-3">
                    <button
                      className="text-sm font-medium border-b border-secondary text-secondary"
                      type="button"
                      onClick={() => {
                        setAddNewModal(true);
                        setModalData(detail);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      // onClick={() => setOpenDeleteModal({ open: true, data: detail })}
                      className="text-sm font-medium text-red-500 border-b border-red-500"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="-mr-6 h-[70vh] space-y-8 overflow-y-auto 3xl:mr-0">
                  <div>
                    <h2 className="mb-5 sub-heading">{commonT('headings.basicInfo')}</h2>
                    <div className="grid grid-cols-2 gap-5 3xl:grid-cols-3">
                      <TitleValue title="Schedule Title" value={detail?.title || "-"} />
                      <TitleValue title="Schedule On" value={moment.unix(detail?.send_at).format("D MMM YYYY  h:mm A") || "-"} />
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-5 sub-heading">{commonT('headings.otherInfo')}</h2>
                    <TitleValue title="Message" value={detail?.message || "-"} />
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
        </div> */}
      </div>

      <CardScheduleModal
        refreshData={getScheduleList}
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        setModalData={setModalData}
        data={modalData}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteScheduleSms}
        message={t("cardSchedule.cardScheduleDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default CardSchedule;
