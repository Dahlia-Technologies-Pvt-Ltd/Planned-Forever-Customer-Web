import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import AddCeremoniesModal from "./AddCeremoniesModal";
import { CEREMONIES_PRINT, RECOMMENDED_CEREMONIES, TRENDING_CEREMONIES } from "../../routes/Names";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Badge from "../../components/common/Badge";
import { useTranslation } from "react-i18next";
// Table Head

const Ceremonies = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD = [
    t("ceremonies.ceremonyName"),
    t("ceremonies.venue"),
    // t("ceremonies.type"),
    t("ceremonies.startDateAndTime"),
    t("ceremonies.endDateAndTime"),
  ];
  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, closeSuccessModel, openSuccessModal, setErrorMessage, userData, selectedEventRights } =
    useThemeContext();

  // Use States
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Data
  const [allCeremonies, setAllCeremonies] = useState([]);

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
  const detail = allCeremonies?.find((item) => item?.id === (activeRow || allCeremonies[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allCeremonies);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Ceremonies
  const getCeremonies = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.ceremonies.getCeremonies(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllCeremonies(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Delete Ceremony
  const handleDeleteCeremony = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.ceremonies.deleteCeremony(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getCeremonies();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("ceremonies.ceremonyDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      setBtnLoading(false);
      setErrorMessage(err?.response?.data?.message);
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
        await getCeremonies(false);
        setCurrentPage(1);
      }
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getCeremonies();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Ceremonies</h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
                  {selectedEventRights?.rights?.includes("Trending Ceremonies") && (
                    <Link to={TRENDING_CEREMONIES}>
                      <Button title={t("ceremonies.trendingCeremonies")} buttonColor="border-primary bg-pink-500" />
                    </Link>
                  )}
                  {selectedEventRights?.rights?.includes("Suggested Ceremonies") && (
                    <Link to={RECOMMENDED_CEREMONIES}>
                      <Button title={t("ceremonies.recommendedCeremonies")} buttonColor="border-primary  bg-primary " />
                    </Link>
                  )}
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "ceremonies-create")) && (
                    <Button title={t("ceremonies.addCeremony")} onClick={() => setAddNewModal(true)} />
                  )}

                  <Link to={CEREMONIES_PRINT}>
                    <Button title={t("buttons.print")} buttonColor="border-primary  bg-primary " />
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="search"
                    id="search"
                    name="search"
                    placeholder={t("placeholders.search") + "..."}
                    autoComplete="off"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getCeremonies(true);
                      }
                    }}
                    onKeyPress={handleSearch}
                    className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
                  />
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
                            if (head === "Ceremony Name") {
                              sortKey = "name";
                            } else if (head === "Events") {
                              sortKey = "event.name";
                            } else if (head === "Held At") {
                              sortKey = "held_at.name";
                            } else if (head === "Start Date & Time") {
                              sortKey = "start_date";
                            } else if (head === "End Date & Time") {
                              sortKey = "end_date";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Ceremony Name"
                                ? "name"
                                : head === "Events"
                                  ? "event.name"
                                  : head === "Held At"
                                    ? "held_at.name"
                                    : head === "Start Date & Time"
                                      ? "start_date"
                                      : head === "End Date & Time"
                                        ? "end_date"
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
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.name}</p>
                          </td>
                          {/* <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.event?.name}</p>
                          </td> */}
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.venue?.name}</p>
                          </td>
                          {/* <td className="py-3 pr-3 pl-4 3xl:px-4">
                            {item?.recommend_trending_ceremony === "recommended" ? (
                              <Badge title="Recommended" />
                            ) : item?.recommend_trending_ceremony === "trending" ? (
                              <Badge title="Trending" />
                            ) : (
                              <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">-</p>
                            )}
                          </td> */}
                          {/* <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.recommend_trending_venue}</p> */}
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                              {getLocalDateFromUnixTimestamp(item?.start_date, "DD MMM, YYYY, HH:mmA")}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                              {getLocalDateFromUnixTimestamp(item?.end_date, "DD MMM, YYYY, HH:mmA")}
                            </p>
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
            ) : items.length > 0 ? (
              <>
                <div className="mt-6 h-[70vh] space-y-6 overflow-y-auto">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="sub-heading">{t("headings.basicInfo")}</h2>
                    <div className="flex justify-between">
                      <h3 className="heading">Details</h3>
                      <div className="flex items-center gap-x-3">
                        {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "ceremonies-edit")) && (
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
                        {(userData?.role?.display_name === "web_admin" ||
                          userData.role.permissions?.some((item) => item === "ceremonies-delete")) && (
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
                  <div className="grid grid-cols-3 gap-5">
                    <TitleValue title={t("ceremonies.ceremonyName")} value={detail?.name || "-"} />
                    <TitleValue title={t("ceremonies.dressCode")} value={detail?.dress_code || "-"} />
                    <TitleValue title={t("ceremonies.heldAt")} value={detail?.held_at?.name || "-"} />
                    <TitleValue
                      title={t("ceremonies.startDateAndTime")}
                      value={getLocalDateFromUnixTimestamp(detail?.start_date, "DD MMM, YYYY, HH:mmA")}
                    />
                    <TitleValue
                      title={t("ceremonies.endDateAndTime")}
                      value={getLocalDateFromUnixTimestamp(detail?.end_date, "DD MMM, YYYY, HH:mmA")}
                    />
                    <TitleValue title={t("ceremonies.InChargeName")} value={detail?.incharge_name || "-"} />
                    <TitleValue title={t("ceremonies.inChargeCountryCode")} value={detail?.incharge_contact_number.code || "-"} />
                    <TitleValue title={t("ceremonies.inChargeMobile")} value={detail?.incharge_contact_number?.phone_number || "-"} />
                    <TitleValue title={t("ceremonies.asstInChargeName")} value={detail?.asst_incharge_name || "-"} />
                    <TitleValue title={t("ceremonies.asstInChargeCountryCode")} value={detail?.asst_incharge_contact_number?.code || "-"} />
                    <TitleValue title={t("ceremonies.asstInChargeMobile")} value={detail?.asst_incharge_contact_number?.phone_number || "-"} />
                  </div>

                  <h2 className="sub-heading">{t("headings.otherInfo")}</h2>
                  <TitleValue title={t("headings.notes")} value={detail?.description || "-"} />
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

      {/* Add Ceremony Modal */}
      <AddCeremoniesModal
        data={modalData}
        isOpen={addNewModal}
        setModalData={setModalData}
        refreshData={() => getCeremonies()}
        setIsOpen={() => setAddNewModal(false)}
        rData={null}
        tData={null}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteCeremony}
        message={t("ceremonies.ceremonyDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Ceremonies;
