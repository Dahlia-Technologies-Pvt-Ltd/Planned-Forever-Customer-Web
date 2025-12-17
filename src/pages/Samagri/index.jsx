import ApiServices from "@api";
import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import { useThemeContext } from "@context";
import { useSortableData } from "@sorting";
import ReactPaginate from "react-paginate";
import Skeleton from "react-loading-skeleton";
import Button from "@components/common/Button";
import AddSamagriModal from "./AddSamagriModal";
import { useMediaQuery } from "react-responsive";
import React, { useEffect, useState } from "react";
import { SAMAGRI_PRINT, RECOMMENDED_SAMAGRI } from "../../routes/Names";
import TitleValue from "@components/common/TitleValue";
import { emptyFolderAnimation } from "@utilities/lottieAnimations";
import ConfirmationModal from "@components/common/ConfirmationModal";
import { mediaUrl } from "../../utilities/config";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Switch } from "@headlessui/react";
import moment from "moment";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";

const Samagri = () => {
  // translation
  const { t } = useTranslation("common");
  // Update Table Headers with translations
  const TABLE_HEAD_Detail = [t("samagri.item"), t("samagri.quantities"), t("samagri.units"), t("samagri.purchased"), t("samagri.image")];

  const TABLE_HEAD = [t("samagri.samagriFor"), t("samagri.ceremonyName")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, userData, selectedEventRights } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allSamagriData, setAllSamagriData] = useState([]);

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
  const detail = allSamagriData?.find((item) => item?.id === (activeRow || allSamagriData[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allSamagriData);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Samagri
  const getSamagri = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.samagri.getSamagri(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllSamagriData(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete Samagri
  const handleDeleteSamagri = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.samagri.deleteSamagri(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getSamagri();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("samagri.samagriDeleteSuccess"),
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

  // Search
  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getSamagri(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffects
  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getSamagri();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getSamagri();
  }, [currentPage]);

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
      // 9dc0edf7-9107-4db3-a04d-3b397f3dca3a

      // "9dc0edc9-8a31-472e-8a18-857d712bb3b2"

      console.log({ ff: openStatusModal?.data });

      const res = await ApiServices.samagri.updateSamagrListItem(openStatusModal.data.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getSamagri();
        setOpenStatusModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: "Samagri item status has been updated successfully",
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
        <div className="col-span-12 lg:col-span-7">
          <div className="card min-h-[82vh]">
            <h3 className="heading">{t("title")}</h3>
            <div className="mt-4 flex justify-start">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedEventRights?.rights?.includes("Suggested Samagri List") && (
                    <Link to={RECOMMENDED_SAMAGRI}>
                      <Button title={t("samagri.recommendedSamagri")} buttonColor="border-primary  bg-primary px-4" />
                    </Link>
                  )}{" "}
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "samagri-create")) && (
                    <Button title={t("samagri.addNewSamagri")} onClick={() => setAddNewModal(true)} />
                  )}
                  <Link to={SAMAGRI_PRINT}>
                    <Button title={t("buttons.print")} buttonColor="border-primary  bg-primary " />
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
                    placeholder={t("placeholders.search") + "..."}
                    autoComplete="off"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getSamagri(true);
                      }
                    }}
                    onKeyPress={handleKeyPress}
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
                            if (head === "Samagri For") {
                              sortKey = "name";
                            } else if (head === "Ceremony Name") {
                              sortKey = "room_type";
                            } else if (head === "Ceremony Date & Time") {
                              sortKey = "rooms";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Samagri For"
                                ? "name"
                                : head === "Ceremony Name"
                                  ? "room_type"
                                  : head === "Ceremony Date & Time"
                                    ? "rooms"
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
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.title}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.ceremony?.name}</p>
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

        <div className="col-span-12 lg:col-span-5">
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
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "samagri-edit")) && (
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
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "samagri-delete")) && (
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
                  </div>
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-5 3xl:grid-cols-3">
                      <TitleValue title={t("samagri.samagriFor")} value={detail?.title || t("na")} />
                      <TitleValue title={t("samagri.ceremonyName")} value={detail?.ceremony?.name || tabClasses("na")} />
                      <TitleValue
                        title={t("samagri.handoverName")}
                        value={detail?.contact?.first_name || (t("na") && detail?.contact?.last_name) || t("na")}
                      />
                      <TitleValue
                        title={t("samagri.handoverDate")}
                        value={detail?.hand_over_date ? moment.unix(detail?.hand_over_date).format("YYYY-MM-DD HH:mm") : t("na")}
                      />
                    </div>
                    <div>
                      <TitleValue title={t("headings.notes")} value={detail?.description || "-"} />
                    </div>
                    <div className="">
                      <h3 className="text-xs text-info-color">{t("samagri.samagriItems")}</h3>
                      <div className="mb-8 overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr>
                              {TABLE_HEAD_Detail.map((head) => (
                                <th key={head} className="border-b border-gray-100 bg-white py-4 pr-4">
                                  <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan="3">
                                  <Skeleton count={itemsPerPage} height={50} />
                                </td>
                              </tr>
                            ) : detail?.items?.length > 0 ? (
                              detail?.items?.map((samagri, index) => (
                                <tr key={index} className="cursor-pointer">
                                  <td className="py-3 pr-4">
                                    <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{samagri?.name || "-"}</p>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{samagri?.qty || "-"}</p>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{samagri?.unit || "-"}</p>
                                  </td>

                                  <td className="py-3 pr-4">
                                    <Switch
                                      checked={samagri?.status === 1}
                                      onChange={() => handleStatusChange(samagri)}
                                      className={`group relative flex h-6 w-12 cursor-pointer rounded-full ${samagri?.status === 1 ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${samagri?.status === 1 ? "translate-x-6" : "translate-x-0"}`}
                                      />
                                    </Switch>
                                  </td>

                                  {samagri?.image !== null ? (
                                    <td className="py-3 pr-4">
                                      <PhotoProvider>
                                        <PhotoView src={mediaUrl + samagri?.image}>
                                          <img
                                            src={mediaUrl + samagri?.image}
                                            alt="image"
                                            className="h-24 w-24 cursor-pointer rounded-10 object-cover"
                                          />
                                        </PhotoView>
                                      </PhotoProvider>
                                    </td>
                                  ) : (
                                    <td className="py-3 pr-4">-</td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              // Render "No Data" message
                              <tr className="h-[200px]">
                                <td colSpan="3">
                                  <Lottie options={emptyFolderAnimation} width={100} height={100} />
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
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

      {/* Add Samagri */}
      <AddSamagriModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        setModalData={setModalData}
        data={modalData}
        refreshData={getSamagri}
        rData={null}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteSamagri}
        message={t("samagri.samagriDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />

      {/* Status Change Confirmation */}
      <ConfirmationModal
        data={openStatusModal.data}
        isOpen={openStatusModal.open}
        handleSubmit={confirmStatusChange}
        message={"Are you sure you want to purchase this samagri item?"}
        setIsOpen={(open) => setOpenStatusModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Samagri;
