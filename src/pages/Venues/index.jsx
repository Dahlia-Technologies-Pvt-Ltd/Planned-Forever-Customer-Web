import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import AddVenueModal from "./AddVenueModal";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { VENUE_PRINT, RECOMMENDED_VENUES } from "../../routes/Names";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import ExpandableText from "../../components/common/ExpandableText";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import {
  BuildingLibraryIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { hasPermission } from "../../utilities/permissions";

const formatVenuePhone = (contact) => {
  if (!contact) return "-";

  const countryCode = String(contact.country_code || "").match(/\+\d{1,4}/)?.[0] || "";
  const phone = contact.mobile || contact.land_line_number || "";

  return [countryCode, phone].filter(Boolean).join(" ") || "-";
};

const Venues = () => {
  // Translations
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [
    { label: t("venues.venueName"), sortKey: "name" },
    { label: t("venues.city"), sortKey: "city" },
    { label: "Contact Person Name", sortKey: "contact_person_name" },
    { label: t("venues.phone"), sortKey: "contactNumbers" },
  ];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, userData, selectedEventRights } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allVenues, setAllVenues] = useState([]);

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
  const detail = allVenues?.find((item) => item?.id === (activeRow || allVenues[0]?.id));
  const contactNumbers = Array.isArray(detail?.contact_numbers) ? detail.contact_numbers : [];
  const contactEmails = Array.isArray(detail?.emails) ? detail.emails : [];
  const contactRowCount = Math.max(contactNumbers.length, contactEmails.length, detail?.contact_person_name ? 1 : 0);
  const venueContacts = Array.from({ length: contactRowCount }, (_, index) => {
    const contact = contactNumbers[index] || {};
    const email = contactEmails[index] || {};

    return {
      name: contact?.contact_person_name || email?.contact_person_name || (index === 0 ? detail?.contact_person_name : "") || "",
      countryCode: contact?.country_code || "",
      phone: contact?.mobile || contact?.land_line_number || "",
      email: email?.personal || email?.work || "",
    };
  });
  const primaryVenueContact = venueContacts[0] || {};
  const additionalVenueContacts = venueContacts.slice(1);
  const venueLocation = [detail?.city, detail?.state, detail?.country].filter(Boolean).join(", ");
  const googleMapsUrl = detail
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        detail?.latitude && detail?.longitude
          ? `${detail.latitude},${detail.longitude}`
          : detail?.address || venueLocation || detail?.name || ""
      )}`
    : "#";
  const venueHalls = detail?.venue_details || detail?.venueDetails || [];
  const updatedBy =
    detail?.updated_by?.name ||
    [detail?.updated_by?.first_name, detail?.updated_by?.last_name].filter(Boolean).join(" ") ||
    detail?.updated_by_name ||
    detail?.created_by?.name ||
    [detail?.created_by?.first_name, detail?.created_by?.last_name].filter(Boolean).join(" ") ||
    userData?.name ||
    [userData?.first_name, userData?.last_name].filter(Boolean).join(" ");
  const updatedAt = detail?.updated_at || detail?.created_at;

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allVenues);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get venues
  const getVenues = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.venues.getVenues(payload);
      const { data, message } = res;

      if (data.code === 200) {
        const venues = data.data.data.map((venue) => {
          const venueDetails = venue?.venue_details || venue?.venueDetails || [];

          return {
            ...venue,
            hall_name:
              venueDetails
                .map((hall) => hall?.name)
                .filter(Boolean)
                .join(", ") || "-",
          };
        });

        setAllVenues(venues);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Delete Venue
  const handleDeleteVenue = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.venues.deleteVenue(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        getVenues();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("venues.venueDeleteSuccess"),
          onClickDone: () => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message);
      setBtnLoading(false);
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
        await getVenues(false);
        setCurrentPage(1);
      }
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getVenues();
  }, [currentPage]);

  return (
    <>
      <div className="venues-page-layout grid grid-cols-12 items-start gap-5 lg:items-stretch">
        <div className="col-span-12 lg:col-span-8">
          <div className="venues-list-card card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)]">
            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-4">
                <h2 className="shrink-0 text-xl font-semibold text-black">{t("venues.venues")}</h2>
                <div className="relative ml-auto flex items-center">
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
                        getVenues(true);
                      }
                    }}
                    onKeyDown={handleKeyPress}
                    className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                  />
                </div>
              </div>

              <div className="mt-4 flex w-full items-center justify-between gap-4">
                <div className="ml-auto flex items-center gap-3">
                  {selectedEventRights?.rights?.includes("Recommended Venues") && (
                    <Link to={RECOMMENDED_VENUES}>
                      <Button title={t("venues.recommendedVenue")} buttonColor="border-primary bg-primary" />
                    </Link>
                  )}
                  {hasPermission(userData, "venues-create") && (
                    <Button
                      title={t("venues.addVenue")}
                      onClick={() => {
                        setModalData(null);
                        setAddNewModal(true);
                      }}
                    />
                  )}
                  <Link to={VENUE_PRINT}>
                    <Button
                      title={t("buttons.print")}
                      buttonColor="border border-secondary bg-transparent"
                      className="!text-secondary hover:bg-secondary/5"
                    />
                  </Link>
                </div>
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
                          key={head.sortKey}
                          className="border-b border-gray-100 bg-white p-4 first:pl-6"
                          onClick={() => requestSort(head.sortKey)}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-sm font-semibold leading-5 3xl:text-sm">
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
                      items.map((item, index) => (
                        <tr
                          key={item?.id}
                          className={`cursor-pointer ${item?.id === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                          onClick={() => handleRowClick(item?.id)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-primary-color-200 text-sm font-normal 3xl:text-sm">{item?.name}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-sm font-normal 3xl:text-sm">{item?.city || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-sm font-normal 3xl:text-sm">{item?.contact_person_name || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-sm font-normal 3xl:text-sm">
                              {formatVenuePhone(item?.contact_numbers?.[0])}
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
                      <tr className="h-full">
                        <td colSpan="4">
                          <div className="flex min-h-[52vh] flex-col items-center justify-center px-4 text-center">
                            <Lottie options={emptyFolderAnimation} width={170} height={170} />
                            <h4 className="-mt-4 text-base font-semibold text-primary-color">{t("venues.noVenuesAdded")}</h4>
                            <p className="mt-2 max-w-xs text-sm leading-5 text-primary-light-color">{t("venues.addFirstVenue")}</p>
                            {hasPermission(userData, "venues-create") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setModalData(null);
                                  setAddNewModal(true);
                                }}
                                className="mt-5 min-w-[150px] rounded-10 bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
                              >
                                {t("venues.addVenue")}
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
              )}
            </div>
            {/* Table End */}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="venues-details-card card flex h-[72vh] flex-col overflow-hidden shadow-[0_12px_34px_rgba(15,23,42,0.14)] lg:sticky lg:top-0">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items?.length > 0 ? (
              <div className="-mx-1 -my-1 flex min-h-0 flex-1 flex-col px-1 py-1">
                <div className="shrink-0">
                  <div className="flex items-center justify-end gap-2">
                    {hasPermission(userData, "venues-edit") && (
                      <button
                        className="flex h-8 items-center gap-2 rounded-lg border border-secondary bg-transparent px-3 text-sm font-medium text-secondary transition hover:bg-secondary/5"
                        type="button"
                        onClick={() => {
                          setModalData(detail);
                          setTimeout(() => setAddNewModal(true), 100);
                        }}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        {t("buttons.edit")}
                      </button>
                    )}

                    {hasPermission(userData, "venues-delete") && (
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

                  <div className="mt-5 w-full">
                    <h2 className="text-xl font-semibold text-black">{detail?.name || "-"}</h2>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex w-full items-start gap-2 text-sm text-gray-600 transition hover:text-secondary hover:underline"
                    >
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1 break-words">{detail?.address || venueLocation || "-"}</span>
                    </a>
                  </div>
                </div>

                <div className="venue-details-scroll -mr-2 mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
                  <section>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <MapPinIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("venues.venueDetails")}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-5">
                      <div>
                        <p className="text-xs text-gray-600">{t("venues.city")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.city || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("venues.state")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.state || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("venues.country")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.country || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("venues.pinCode")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.pin || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600">{t("venues.timeZone")}</p>
                        <p className="mt-1 break-words text-sm font-medium text-black">{detail?.time_zone || "-"}</p>
                      </div>
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <BuildingLibraryIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("venues.venueDetail")}</h3>
                    </div>
                    <div className="space-y-3 pt-5">
                      {venueHalls.length > 0 ? (
                        venueHalls.map((hall, index) => (
                          <div
                            key={hall?.id || `${hall?.name || "hall"}-${index}`}
                            className="grid grid-cols-2 gap-5 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                          >
                            <div>
                              <p className="text-xs text-gray-600">{t("venues.hallName")}</p>
                              <p className="mt-1 text-sm font-medium text-black">{hall?.name || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">{t("venues.hallAddress")}</p>
                              <p className="mt-1 text-sm font-medium text-black">{hall?.location || "-"}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">{t("venues.noHallsAdded")}</p>
                      )}
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <UserIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("venues.venuePrimaryContact")}</h3>
                    </div>
                    <div className="space-y-4 pt-5 text-sm text-black">
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 shrink-0 text-gray-600" />
                        <span>{primaryVenueContact?.name || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="h-5 w-5 shrink-0 text-gray-600" />
                        <span>
                          {[primaryVenueContact?.countryCode, primaryVenueContact?.phone].filter(Boolean).join(" ") || "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-5 w-5 shrink-0 text-gray-600" />
                        <span className="break-all">{primaryVenueContact?.email || "-"}</span>
                      </div>
                    </div>
                  </section>

                  {additionalVenueContacts.length > 0 && (
                    <section className="mt-8">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                        <UserIcon className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">{t("venues.additionalContactPerson")}</h3>
                      </div>
                      <div className="space-y-5 pt-5">
                        {additionalVenueContacts.map((contact, index) => (
                          <div
                            key={`${contact?.phone || contact?.email || "contact"}-${index}`}
                            className={`${index > 0 ? "border-t border-gray-200 pt-5" : ""} space-y-4 text-sm text-black`}
                          >
                            <div className="flex items-center gap-3">
                              <UserIcon className="h-5 w-5 shrink-0 text-gray-600" />
                              <span>{contact?.name || "-"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <PhoneIcon className="h-5 w-5 shrink-0 text-gray-600" />
                              <span>{[contact?.countryCode, contact?.phone].filter(Boolean).join(" ") || "-"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <EnvelopeIcon className="h-5 w-5 shrink-0 text-gray-600" />
                              <span className="break-all">{contact?.email || "-"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="mt-8">
                    <div className="flex items-center gap-2 pb-3 text-secondary">
                      <DocumentTextIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("headings.notes")}</h3>
                    </div>
                    <div className="min-h-[58px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                      <ExpandableText text={detail?.description} fallback="No notes added yet" />
                    </div>
                  </section>

                  <div className="mt-7 flex items-start gap-3 pb-2 text-xs text-gray-600">
                    <CalendarDaysIcon className="h-5 w-5 shrink-0" />
                    <div>
                      <p>{t("venues.lastUpdated")}</p>
                      <p className="mt-1 font-medium text-black">
                        {updatedAt && dayjs(updatedAt).isValid() ? dayjs(updatedAt).format("DD MMM YYYY, hh:mm A") : "-"}
                        {updatedBy ? ` by ${updatedBy}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div className="flex max-w-xs flex-col items-center h-full">
                  <Lottie options={emptyFolderAnimation} width={170} height={170} />
                  <h4 className="-mt-4 text-base font-semibold text-primary-color">{t("venues.noVenueSelected")}</h4>
                  <p className="mt-2 text-sm leading-5 text-primary-light-color">{t("venues.selectVenueToView")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddVenueModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        setModalData={setModalData}
        refreshData={getVenues}
        data={modalData}
        rData={null}
      />
      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteVenue}
        message={t("venues.venueDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Venues;
