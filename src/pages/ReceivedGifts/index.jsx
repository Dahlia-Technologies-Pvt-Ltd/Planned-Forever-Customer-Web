import Lottie from "react-lottie";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import animationData from "../../assets/lottie/no_data";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import AddReceivedGfitModal from "./AddReceivedGfitModal";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ApiServices from "../../api/services";
import { useEffect } from "react";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import { RECEIVED_GIFT_PRINT } from "../../routes/Names";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ReceivedGifts = () => {
  // translation
  const { t } = useTranslation("common");

  const TABLE_HEAD = [t("receivedGifts.receivedGift"), t("receivedGifts.receivedGiftFrom"), t("receivedGifts.receivedOn"), t("receivedGifts.thankYouNoteSentTo"), t("receivedGifts.thankYouNoteSentOn")];
  // Context
  const { eventSelect,loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel , userData } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allReceivedGifts, setAllReceivedGifts] = useState([]);

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

  // Detail of selected row
  const detail = allReceivedGifts?.find((item) => item?.id === (activeRow || allReceivedGifts[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allReceivedGifts);

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
  const getReceivedGiftList = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.receivedGift.getReceivedGifts(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllReceivedGifts(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete received gift
  const handleDeleteReceivedGift = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.receivedGift.deleteReceivedGifts(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getReceivedGiftList();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("receivedGifts.receivedGiftDeleteSuccess"),
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

  // Use Effects
  // useEffect(() => {
  //   if (searchText?.length > 1 || searchText?.length === 0) {
  //     getReceivedGiftList();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getReceivedGiftList(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === '') {
  //     getReceivedGiftList();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getReceivedGiftList();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">{t("receivedGifts.addReceivedGifts")}</h3>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-x-3">
                {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "received-gifts-create")) &&          
                 <Button title={t("receivedGifts.addReceivedGifts")} onClick={() => setAddNewModal(true)} /> }
                  <Link to={RECEIVED_GIFT_PRINT}>
                    <Button title={t("receivedGifts.printReceivedGifts")} buttonColor="border-primary  bg-primary " />
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    placeholder={t('placeholders.search')+'...'}
                    autoComplete="off"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getReceivedGiftList(true);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    className="focus:border-primary-color-100 block h-11 w-40 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
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
                            if (head === "Received Gift") {
                              sortKey = "gift.name";
                            } else if (head === "Received Gift From") {
                              sortKey = "contact.first_name";
                            } else if (head === "Received On") {
                              sortKey = "received_on";
                            } else if (head === "Sent To") {
                              sortKey = "gift.name";
                            } else if (head === "Sent On") {
                              sortKey = "check_out_date";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Received Gift"
                                ? "gift.name"
                                : head === "Received Gift From"
                                  ? "contact.first_name"
                                  : head === "Received On"
                                    ? "received_on"
                                    : head === "Sent To"
                                      ? "gift.name"
                                      : head === "Sent On"
                                        ? "note_send_at"
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
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.gift_received || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.contact?.first_name + " " + item?.contact?.last_name || "-"}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                                {getLocalDateFromUnixTimestamp(item?.received_on, "DD MMM, YYYY")}
                              </p>
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.contact?.first_name + " " + item?.contact?.last_name || "-"}
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {" "}
                              {getLocalDateFromUnixTimestamp(item?.note_send_at, "DD MMM, YYYY")}
                            </p>
                          </td>

                          {/* <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <div className="flex items-center gap-x-3">
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
                        <h3 className="heading">Details</h3>
                        <div className="flex items-center gap-x-3">
                        {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "received-gifts-edit")) &&           <button
                            className="border-b border-secondary text-sm font-medium text-secondary"
                            type="button"
                            onClick={() => {
                              setAddNewModal(true);
                              setModalData(detail);
                            }}
                          >
                            {t("buttons.edit")}
                          </button> }
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "received-gifts-delete")) &&          <button
                            onClick={() => setOpenDeleteModal({ open: true, data: detail })}
                            className="border-b border-red-500 text-sm font-medium text-red-500"
                            type="button"
                          >
                            {t("buttons.delete")}
                          </button> }
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 3xl:grid-cols-3">
                      <TitleValue title={t("receivedGifts.receivedGift")} value={detail?.gift_received || "-"} />
                      <TitleValue title={t("receivedGifts.receivedGiftFrom")} value={detail?.contact?.first_name + " " + detail?.contact?.last_name || "-"} />
                      <TitleValue title={t("receivedGifts.receivedOn")} value={getLocalDateFromUnixTimestamp(detail?.received_on, "DD MMM, YYYY")} />
                      <TitleValue title={t("receivedGifts.thankYouNoteSentTo")} value={detail?.contact?.first_name + " " + detail?.contact?.last_name || "-"} />
                      <TitleValue title={t("receivedGifts.thankYouNoteSentOn")} value={getLocalDateFromUnixTimestamp(detail?.note_send_at, "DD MMM, YYYY")} />
                    </div>
                  </div>
                  <h2 className="sub-heading">{t('headings.otherInfo')}</h2>
                  <TitleValue title={t('headings.notes')} value={detail?.notes || "-"} />
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

      <AddReceivedGfitModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        refreshData={getReceivedGiftList}
        setModalData={setModalData}
        data={modalData}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteReceivedGift}
        message={t("receivedGifts.receivedGiftDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default ReceivedGifts;
