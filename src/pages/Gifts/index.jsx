import moment from "moment";
import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import AddGfitModal from "./AddGfitModal";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { GIFT_PRINT } from "../../routes/Names";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Gifts = () => {
  // translation
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("gift.giftName"), t("gift.giftValue"), t("gift.tags")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, setErrorMessage, userData } = useThemeContext();

  // Use States
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Data
  const [allGifts, setAllGifts] = useState([]);

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
  const detail = allGifts?.find((item) => item?.id === (activeRow || allGifts[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allGifts);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 8 : 10;

  // Get Gifts
  const getGifts = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.gifts.getGifts(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllGifts(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete Gift
  const handleDeleteGift = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.gifts.deleteGift(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getGifts();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: "Gift has been deleted successfully",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      setErrorMessage(err.response.data.message);
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
  //     getGifts();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getGifts(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getGifts();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getGifts();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">{t("gift.gifts")}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "gifts-create")) && (
                    <Button title={t("gift.addNewGift")} onClick={() => setAddNewModal(true)} />
                  )}

                  <Link to={GIFT_PRINT}>
                    <Button title={t("buttons.print")} buttonColor="border-primary  bg-primary " />
                  </Link>
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                      <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                    </div>
                    <input
                      type="search"
                      id="search"
                      name="search"
                      placeholder={t("placeholders.search") + "..."}
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        if (e.target.value.trim() === "") {
                          getGifts(true);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      className="focus:border-primary-color-100 block h-11 w-full rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                    />
                  </div>
                </div>
              </div>
            </div>
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
                            if (head === "Event Name") {
                              sortKey = "name";
                            } else if (head === "Venue") {
                              sortKey = "venue.name";
                            } else if (head === "Start Date & Time") {
                              sortKey = "created_at_unix";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Event Name"
                                ? "name"
                                : head === "Venue"
                                  ? "venue.name"
                                  : head === "Start Date & Time"
                                    ? "created_at_unix"
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
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.name}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.value || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            {item?.tags?.length > 0 ? (
                              item?.tags?.map((tag, index) => (
                                <span key={index}>
                                  <Badge title={tag} />
                                </span>
                              ))
                            ) : (
                              <span className="text-xs font-normal text-primary-color 3xl:text-sm">-</span>
                            )}
                          </td>

                          {/* <td className="py-3 pl-7 3xl:px-8">
                            <p className={`text-xs font-normal ${item.status === 1 ? "text-green-400" : "text-red-400"} 3xl:text-sm`}>
                              {item?.status === 1 ? "Yes" : "No" || "-"}
                            </p>
                          </td> */}
                          {/* 
                          <td className="py-3 pr-3 pl-4 3xl:px-4">
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
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items?.length > 0 ? (
              <>
                <div className="h-[70vh] overflow-y-auto">
                  <h3 className="heading">{t("headings.details")}</h3>
                  <div className="mt-2">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="sub-heading">{t("headings.basicInfo")}</h2>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-x-3">
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "gifts-view")) && (
                            <button
                              onClick={() => {
                                setAddNewModal(true);
                                setModalData(detail);
                              }}
                              className="border-b border-secondary text-sm font-medium text-secondary"
                              type="button"
                            >
                              {t("buttons.edit")}
                            </button>
                          )}
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "gifts-delete")) && (
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
                    <div className="flex flex-wrap gap-5">
                      <TitleValue title={t("gift.giftName")} value={detail?.name ? detail?.name : "-"} />
                      <TitleValue title={t("gift.giftValue")} value={detail?.value ? detail?.value : "-"} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t("headings.otherInfo")}</h2>
                    <div className="grid grid-cols-1 gap-5">
                      <div className="w-full space-y-2">
                        <h3 className="text-xs text-info-color">{t("gift.tags")}</h3>
                        {detail?.tags?.map((tag, index) => (
                          <span className="inline-block" key={index}>
                            <Badge title={tag} />
                          </span>
                        ))}
                      </div>
                      <TitleValue title={t("headings.notes")} value={detail?.description ? detail?.description : "-"} />
                    </div>
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

      {/* Add Gift Modal */}
      <AddGfitModal
        data={modalData}
        isOpen={addNewModal}
        setModalData={setModalData}
        refreshData={() => getGifts()}
        setIsOpen={() => setAddNewModal(false)}
      />

      {/* Delete Modal*/}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteGift}
        message="Are you sure you want to delete this gift?"
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Gifts;
