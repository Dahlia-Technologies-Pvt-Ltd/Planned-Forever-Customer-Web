import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import AddVenueModal from "./AddVenueModal";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { VENUES } from "../../routes/Names";
import { useMediaQuery } from "react-responsive";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import ExpandableText from "../../components/common/ExpandableText";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { mediaUrl } from "@utilities/config";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";

const formatVenuePhone = (contact) => {
  if (!contact) return "-";

  const countryCode = String(contact.country_code || "").match(/\+\d{1,4}/)?.[0] || "";
  const phone = contact.mobile || contact.land_line_number || "";

  return [countryCode, phone].filter(Boolean).join(" ") || "-";
};

const Venues = () => {
  // translation
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [
    { label: t("venues.venueName"), sortKey: "name" },
    { label: t("venues.city"), sortKey: "city" },
    { label: "Contact Person Name", sortKey: "contact_person_name" },
    { label: t("venues.phone"), sortKey: "contactNumbers" },
    { label: "Import", sortKey: "imported" },
  ];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, btnLoading, openSuccessModal, setErrorMessage, closeSuccessModel } = useThemeContext();

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

  const [recommendedData, setRecommendedData] = useState(null);

  // Active Row
  // const handleRowClick = (item) => {
  //   setActiveRow(item?.id);
  //   setAddNewModal(true)
  //   setRecommendedData(item)
  // };

  const handleRowClick = (item) => {
    setActiveRow(item?.id);
  };

  // Detail of selected row
  const detail = allVenues?.find((item) => item?.id === (activeRow || allVenues[0]?.id));
  const primaryContact = detail?.contact_numbers?.[0] || {};
  const primaryEmail = detail?.emails?.[0] || {};
  const venueLocation = [detail?.city, detail?.state, detail?.country].filter(Boolean).join(", ");
  const googleMapsUrl = detail
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        detail?.latitude && detail?.longitude
          ? `${detail.latitude},${detail.longitude}`
          : detail?.address || venueLocation || detail?.name || ""
      )}`
    : "#";

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allVenues);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  console.log({ eventSelect });

  // Get venues
  const getVenues = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
        recommended_trending_type: "recommended",
        type: "venue",
      };

      const res = await ApiServices.venues.getVenuesList(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setAllVenues(data?.data?.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
        setLoading(false);
      }
    } catch (err) {
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
          title: "Success!",
          message: "Venue has been deleted successfully",
          onClickDone: () => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message);
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

  const [actionData, setActionData] = useState([]);

  const getAction = async () => {
    try {
      setLoading(true);

      let payload = {
        // search: emptySearch ? "" : searchText,
        // page: currentPage,
        // records_no: itemsPerPage,
        event_id: eventSelect,
        recommended_trending_type: "recommended",
        type: "venue",
      };

      const res = await ApiServices.ceremonies.getActions(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setActionData(data?.data);
      }
    } catch (err) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const addActionCeremony = async (e) => {
    e.preventDefault();

    try {
      setBtnLoading(true);

      let payload = {
        event_id: eventSelect,
        type: "venue",
        recommended_trending_id: actionData,
        recommended_trending_type: "recommended",
      };

      const response = await ApiServices.ceremonies.addAction(payload);

      if (response.data.code === 200) {
        setBtnLoading(false);
        getAction();
        getVenues();
      } else {
        setBtnLoading(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message);
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getVenues();
    getAction();
  }, [currentPage]);

  const handleCheckboxChange = (id) => {
    if (actionData.includes(id)) {
      // If the id exists, uncheck it by removing it from actionData
      setActionData(actionData.filter((actionId) => actionId !== id));
    } else {
      // If the id doesn't exist, check it by adding it to actionData
      setActionData([...actionData, id]);
    }
  };

  const handleAddVenue = (item) => {
    if (!actionData.includes(item.id)) {
      setActiveRow(item?.id);
      setRecommendedData(item);
      setAddNewModal(true);
    } else {
      // You can add other actions here if needed when the item is already in actionData
      // alert("This item is already added in the venue action is check");
      openSuccessModal({
        title: "Success!",
        message: "This item is already added in the venues that why action is check",
        onClickDone: (close) => {
          closeSuccessModel();
        },
      });
    }
  };

  return (
    <>
      <div className="venues-page-layout grid grid-cols-12 items-start gap-5 lg:items-stretch">
        <div className="col-span-12 lg:col-span-8">
          <div className="venues-list-card card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)]">
            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-4">
                <h2 className="shrink-0 text-xl font-semibold text-black">{t("venues.recommendedVenues")}</h2>
                <div className="relative ml-auto flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
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
                    className="block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:border-primary-color-100 focus:ring-primary-color"
                  />
                </div>
              </div>

              <Link to={VENUES} className="mt-4 inline-flex items-center text-sm font-medium text-secondary hover:underline">
                <ArrowLeftIcon className="mr-2 h-5 w-4" />
                {t("venues.backToVenuesList")}
              </Link>
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
                          onClick={() => head.sortKey !== "imported" && requestSort(head.sortKey)}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-sm font-semibold leading-5 text-black 3xl:text-sm">
                            {head.label}
                            {head.sortKey !== "imported" &&
                              (sortConfig.key === head.sortKey && sortConfig.direction === "asc" ? (
                                <ChevronUpIcon className="inline-block h-4 w-3.5" />
                              ) : (
                                <ChevronDownIcon className="inline-block h-4 w-3.5" />
                              ))}
                          </p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5">
                          <Skeleton count={itemsPerPage} height={50} />
                        </td>
                      </tr>
                    ) : items.length > 0 ? (
                      items.map((item) => (
                        <tr
                          key={item?.id}
                          className={`cursor-pointer ${item?.id === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                          onClick={() => handleRowClick(item)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-sm font-normal text-primary-color-200">{item?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3">
                            <p className="text-sm font-normal text-primary-color-200">{item?.city || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3">
                            <p className="text-sm font-normal text-primary-color-200">{item?.contact_person_name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3">
                            <p className="text-sm font-normal text-primary-color-200">
                              {formatVenuePhone(item?.contact_numbers?.[0])}
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-6">
                            <button
                              type="button"
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                actionData.includes(item?.id)
                                  ? "cursor-default border-secondary bg-secondary/5 text-secondary"
                                  : "border-primary bg-primary/10 text-amber-700 hover:bg-primary/20"
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleAddVenue(item);
                              }}
                            >
                              {actionData.includes(item?.id) ? "Imported" : "Import"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="h-full">
                        <td colSpan="5">
                          <div className="flex min-h-[52vh] items-center justify-center">
                            <Lottie options={emptyFolderAnimation} width={180} height={180} />
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
                  nextLabel={<ChevronRightIcon className="w-5 h-5" />}
                  previousLabel={<ChevronLeftIcon className="w-5 h-5" />}
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
                        <p className="text-xs text-gray-600">{t("venues.venueSignificance")}</p>
                        <ExpandableText text={detail?.recommended_significance} className="mt-1" />
                      </div>
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
                        <span>{detail?.contact_person_name || primaryContact?.contact_person_name || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="h-5 w-5 shrink-0 text-gray-600" />
                        <span>
                          {[primaryContact?.country_code, primaryContact?.mobile || primaryContact?.land_line_number].filter(Boolean).join(" ") || "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-5 w-5 shrink-0 text-gray-600" />
                        <span className="break-all">{primaryEmail?.personal || primaryEmail?.work || "-"}</span>
                      </div>
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <BuildingOfficeIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("headings.relevantImages")}</h3>
                    </div>
                    {detail?.images?.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 pt-5">
                        <PhotoProvider>
                          {detail.images.map((item, index) => (
                            <PhotoView key={item} src={mediaUrl + item}>
                              <img
                                src={mediaUrl + item}
                                alt={`venue-${index + 1}`}
                                className="h-24 w-full cursor-pointer rounded-10 object-cover"
                              />
                            </PhotoView>
                          ))}
                        </PhotoProvider>
                      </div>
                    ) : (
                      <p className="pt-5 text-sm text-gray-600">{t("venues.noImagesAvailable")}</p>
                    )}
                  </section>

                  <section className="mt-8 pb-2">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <LinkIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("headings.socialMediaLinks")}</h3>
                    </div>
                    <div className="space-y-3 pt-5">
                      {detail?.social_media_links?.length > 0 ? (
                        detail.social_media_links.map((item, index) => (
                          <a
                            key={`${item?.url || "link"}-${index}`}
                            href={item?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block break-all text-sm font-medium text-secondary hover:underline"
                          >
                            {item?.name ? `${item.name.charAt(0).toUpperCase()}${item.name.slice(1)}: ` : ""}
                            {item?.url}
                          </a>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">{t("venues.noSocialLinks")}</p>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-center">
                <div>
                  <Lottie options={emptyFolderAnimation} width={170} height={170} />
                  <h4 className="-mt-4 text-base font-semibold text-black">{t("venues.noVenueSelected")}</h4>
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
        refreshData={() => getVenues()}
        data={modalData}
        rData={recommendedData}
        setRecommendedData={setRecommendedData}
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
