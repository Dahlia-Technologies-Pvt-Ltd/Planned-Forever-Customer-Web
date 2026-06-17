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
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import {
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { hasPermission } from "../../utilities/permissions";

const formatContactNumber = (contact) => {
  if (!contact) return "-";

  const countryCode = String(contact?.code || "").match(/\+\d{1,4}/)?.[0] || "";
  const phoneNumber = contact?.phone_number || "";

  return [countryCode, phoneNumber].filter(Boolean).join(" ") || "-";
};

const Ceremonies = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD = [
    { label: t("ceremonies.ceremonyName"), sortKey: "name" },
    { label: t("ceremonies.venue"), sortKey: "venue.name" },
    { label: t("ceremonies.startDateAndTime"), sortKey: "start_date" },
    { label: t("ceremonies.endDateAndTime"), sortKey: "end_date" },
  ];

  const {
    eventSelect,
    loading,
    setLoading,
    setBtnLoading,
    closeSuccessModel,
    openSuccessModal,
    setErrorMessage,
    userData,
    selectedEventRights,
  } = useThemeContext();

  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [allCeremonies, setAllCeremonies] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalData, setModalData] = useState(null);
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  const detail = allCeremonies?.find((item) => item?.id === (activeRow || allCeremonies[0]?.id));
  const { items, requestSort, sortConfig } = useSortableData(allCeremonies);

  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  const canCreate = hasPermission(userData, "ceremonies-create");
  const canEdit = hasPermission(userData, "ceremonies-edit");
  const canDelete = hasPermission(userData, "ceremonies-delete");

  const formatDate = (timestamp) =>
    timestamp ? getLocalDateFromUnixTimestamp(timestamp, "DD MMM YYYY, hh:mm A") : "-";

  const getCeremonies = async (emptySearch) => {
    try {
      setLoading(true);
      const payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };
      const res = await ApiServices.ceremonies.getCeremonies(payload);
      const { data } = res;

      if (data.code === 200) {
        setAllCeremonies(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCeremony = async () => {
    try {
      setBtnLoading(true);
      const res = await ApiServices.ceremonies.deleteCeremony(openDeleteModal?.data?.id);
      const { data } = res;

      if (data.code === 200) {
        getCeremonies();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("ceremonies.ceremonyDeleteSuccess"),
          onClickDone: closeSuccessModel,
        });
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleSearch = async (event) => {
    if (event.key === "Enter" && searchText.trim() !== "") {
      setCurrentPage(1);
      await getCeremonies(false);
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.id || null);
  }, [items]);

  useEffect(() => {
    getCeremonies();
  }, [currentPage, eventSelect]);

  return (
    <>
      <div className="venues-page-layout grid grid-cols-12 items-start gap-5 lg:items-stretch">
        <div className="col-span-12 lg:col-span-8">
          <div className="venues-list-card card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)]">
            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-4">
                <h2 className="shrink-0 text-xl font-semibold text-black">{t("ceremonies.ceremonies")}</h2>
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
                      if (event.target.value.trim() === "") {
                        getCeremonies(true);
                      }
                    }}
                    onKeyDown={handleSearch}
                    className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                  />
                </div>
              </div>

              <div className="mt-4 flex w-full items-center justify-between gap-4">
                <div className="ml-auto flex items-center gap-3">
                  {selectedEventRights?.rights?.includes("Trending Ceremonies") && (
                    <Link to={TRENDING_CEREMONIES}>
                      <Button title={t("ceremonies.trendingCeremonies")} buttonColor="border-primary bg-pink-500" />
                    </Link>
                  )}
                  {selectedEventRights?.rights?.includes("Suggested Ceremonies") && (
                    <Link to={RECOMMENDED_CEREMONIES}>
                      <Button title={t("ceremonies.recommendedCeremonies")} buttonColor="border-primary bg-primary" />
                    </Link>
                  )}
                  {canCreate && (
                    <Button
                      title={t("ceremonies.addCeremony")}
                      onClick={() => {
                        setModalData(null);
                        setAddNewModal(true);
                      }}
                    />
                  )}
                  <Link to={CEREMONIES_PRINT}>
                    <Button
                      title={t("buttons.print")}
                      buttonColor="border border-secondary bg-transparent"
                      className="!text-secondary hover:bg-secondary/5"
                    />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-5 flex min-h-0 flex-1 flex-col">
              <div className="-mx-6 mb-8 flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {TABLE_HEAD.map((head) => (
                        <th
                          key={head.sortKey}
                          className="border-b border-gray-100 bg-white p-4 first:pl-6"
                          onClick={() => requestSort(head.sortKey)}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-sm font-semibold leading-5">
                            {head.label}
                            {sortConfig.key === head.sortKey && sortConfig.direction === "asc" ? (
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
                        <td colSpan="4">
                          <Skeleton count={itemsPerPage} height={50} />
                        </td>
                      </tr>
                    ) : items.length > 0 ? (
                      items.map((item) => (
                        <tr
                          key={item?.id}
                          className={`cursor-pointer ${
                            item?.id === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"
                          }`}
                          onClick={() => setActiveRow(item?.id)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-sm font-normal text-primary-color-200">{item?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3">
                            <p className="text-sm font-normal text-primary-color-200">{item?.venue?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3">
                            <p className="whitespace-nowrap text-sm font-normal text-primary-color-200">{formatDate(item?.start_date)}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3">
                            <p className="whitespace-nowrap text-sm font-normal text-primary-color-200">{formatDate(item?.end_date)}</p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="h-full">
                        <td colSpan="4">
                          <div className="flex min-h-[52vh] flex-col items-center justify-center px-4 text-center">
                            <Lottie options={emptyFolderAnimation} width={170} height={170} />
                            <h4 className="-mt-4 text-base font-semibold text-primary-color">{t("ceremonies.noCeremoniesAdded")}</h4>
                            <p className="mt-2 max-w-xs text-sm leading-5 text-primary-light-color">
                              {t("ceremonies.addFirstCeremony")}
                            </p>
                            {canCreate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setModalData(null);
                                  setAddNewModal(true);
                                }}
                                className="mt-5 min-w-[150px] rounded-10 bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
                              >
                                {t("ceremonies.addCeremony")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {items.length > 0 && (
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
                    onPageChange={({ selected }) => setCurrentPage(selected + 1)}
                    nextLabel={<ChevronRightIcon className="h-5 w-5" />}
                    previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="venues-details-card card flex h-[72vh] flex-col overflow-hidden shadow-[0_12px_34px_rgba(15,23,42,0.14)] lg:sticky lg:top-0">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items.length > 0 ? (
              <div className="-mx-1 -my-1 flex min-h-0 flex-1 flex-col px-1 py-1">
                <div className="shrink-0">
                  <div className="flex items-center justify-end gap-2">
                    {canEdit && (
                      <button
                        type="button"
                        className="flex h-8 items-center gap-2 rounded-lg border border-secondary bg-transparent px-3 text-sm font-medium text-secondary transition hover:bg-secondary/5"
                        onClick={() => {
                          setModalData(detail);
                          setTimeout(() => setAddNewModal(true), 100);
                        }}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        {t("buttons.edit")}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="flex h-8 items-center gap-2 rounded-lg border border-red-500 bg-transparent px-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
                        onClick={() => setOpenDeleteModal({ open: true, data: detail })}
                      >
                        <TrashIcon className="h-4 w-4" />
                        {t("buttons.delete")}
                      </button>
                    )}
                  </div>

                  <div className="mt-5">
                    <h2 className="text-xl font-semibold text-black">{detail?.name || "-"}</h2>
                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{detail?.venue?.name || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="venue-details-scroll -mr-2 mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
                  <section>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <CalendarDaysIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("ceremonies.ceremonyDetails")}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-5">
                      <div>
                        <p className="text-xs text-gray-600">{t("ceremonies.venue")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.venue?.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("ceremonies.dressCode")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.dress_code || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600">{t("ceremonies.heldAt")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.held_at?.name || "-"}</p>
                      </div>
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <ClockIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("menu.dateTime")}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-600">{t("ceremonies.startDateAndTime")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{formatDate(detail?.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("ceremonies.endDateAndTime")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{formatDate(detail?.end_date)}</p>
                      </div>
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <UserIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("ceremonies.personIncharge")}</h3>
                    </div>
                    <div className="space-y-4 pt-5 text-sm text-black">
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 shrink-0 text-gray-600" />
                        <span>{detail?.incharge_name || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="h-5 w-5 shrink-0 text-gray-600" />
                        <span>{formatContactNumber(detail?.incharge_contact_number)}</span>
                      </div>
                    </div>
                  </section>

                  {(detail?.asst_incharge_name || detail?.asst_incharge_contact_number?.phone_number) && (
                    <section className="mt-8">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                        <UserIcon className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">{t("ceremonies.asstPersonIncharge")}</h3>
                      </div>
                      <div className="space-y-4 pt-5 text-sm text-black">
                        <div className="flex items-center gap-3">
                          <UserIcon className="h-5 w-5 shrink-0 text-gray-600" />
                          <span>{detail?.asst_incharge_name || "-"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <PhoneIcon className="h-5 w-5 shrink-0 text-gray-600" />
                          <span>{formatContactNumber(detail?.asst_incharge_contact_number)}</span>
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="mt-8">
                    <div className="flex items-center gap-2 pb-3 text-secondary">
                      <DocumentTextIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("headings.notes")}</h3>
                    </div>
                    <div className="min-h-[58px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-black">
                      {detail?.description || "No notes added yet"}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div className="flex h-full max-w-xs flex-col items-center">
                  <Lottie options={emptyFolderAnimation} width={170} height={170} />
                  <h4 className="-mt-4 text-base font-semibold text-primary-color">{t("ceremonies.noCeremonySelected")}</h4>
                  <p className="mt-2 text-sm leading-5 text-primary-light-color">
                    {t("ceremonies.selectCeremonyToView")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddCeremoniesModal
        data={modalData}
        isOpen={addNewModal}
        setModalData={setModalData}
        refreshData={getCeremonies}
        setIsOpen={() => setAddNewModal(false)}
        rData={null}
        tData={null}
      />

      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteCeremony}
        message={t("ceremonies.ceremonyDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((previous) => ({ ...previous, open }))}
      />
    </>
  );
};

export default Ceremonies;
