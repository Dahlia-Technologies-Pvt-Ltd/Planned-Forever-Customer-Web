import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import { PhotoProvider, PhotoView } from "react-photo-view";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";
import ApiServices from "../../api/services";
import { mediaUrl } from "@utilities/config";
import { CEREMONIES } from "../../routes/Names";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ExpandableText from "../../components/common/ExpandableText";
import AddCeremoniesModal from "./AddCeremoniesModal";

const normalizeSocialMediaLinks = (value) => {
  if (!value) return [];

  let links = value;

  if (typeof links === "string") {
    try {
      links = JSON.parse(links);
    } catch {
      links = [{ name: "", url: links }];
    }
  }

  if (!Array.isArray(links)) {
    links =
      links && typeof links === "object"
        ? Object.entries(links).map(([name, link]) =>
            typeof link === "string" ? { name, url: link } : link
          )
        : [];
  }

  return links.filter((link) => link && typeof link === "object" && String(link.url || "").trim());
};

const CeremonyCatalogue = ({ variant }) => {
  const { t } = useTranslation("common");
  const {
    eventSelect,
    eventDetail,
    loading,
    setLoading,
    openSuccessModal,
    closeSuccessModel,
    setErrorMessage,
  } = useThemeContext();

  const isRecommended = variant === "recommended";
  const pageTitle = isRecommended
    ? t("ceremonies.recommendedCeremonies", { defaultValue: "Cultural Rituals" }) || "Cultural Rituals"
    : t("pageTitles.trending-ceremonies", { defaultValue: "Trending Ceremonies" }) || "Trending Ceremonies";
  const significanceKey = isRecommended ? "recommended_significance" : "trending_significance";

  const [allCeremonies, setAllCeremonies] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionData, setActionData] = useState([]);
  const [addNewModal, setAddNewModal] = useState(false);
  const [importData, setImportData] = useState(null);

  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  const { items, requestSort, sortConfig } = useSortableData(allCeremonies);
  const detail = allCeremonies.find((item) => item?.id === (activeRow || allCeremonies[0]?.id));
  const socialMediaLinks = normalizeSocialMediaLinks(detail?.social_media_links);

  const tableHead = [
    { label: t("ceremonies.ceremonyName"), sortKey: "name" },
    { label: t("ceremonies.ceremonySignificance"), sortKey: significanceKey },
    { label: "Import", sortKey: "imported" },
  ];

  const getCeremonies = async ({ clearSearch = false, page = currentPage } = {}) => {
    try {
      setLoading(true);
      const payload = {
        search: clearSearch ? "" : searchText,
        page,
        records_no: itemsPerPage,
        status: variant,
      };

      if (isRecommended) {
        payload.wedding_type_id = eventDetail?.wedding_types?.map((item) => item?.id);
      }

      const response = await ApiServices.ceremonies.getCeremonies(payload);
      if (response.data.code === 200) {
        const pageData = response.data.data;
        setAllCeremonies(pageData?.data || []);
        setCurrentPage(pageData?.current_page || page);
        setTotalPages(Math.ceil((pageData?.total || 0) / (pageData?.per_page || itemsPerPage)));
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const getAction = async () => {
    if (!eventSelect) {
      setActionData([]);
      return;
    }

    try {
      const response = await ApiServices.ceremonies.getActions({
        event_id: eventSelect,
        recommended_trending_type: variant,
        type: "ceremony",
      });

      if (response.data.code === 200) {
        setActionData(response.data.data || []);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    getCeremonies();
  }, [currentPage, eventSelect, variant]);

  useEffect(() => {
    getAction();
  }, [eventSelect, variant]);

  useEffect(() => {
    if (!items.some((item) => item?.id === activeRow)) {
      setActiveRow(items[0]?.id || null);
    }
  }, [items, activeRow]);

  const handleSearch = async (event) => {
    if (event.key === "Enter") {
      setCurrentPage(1);
      await getCeremonies({ page: 1 });
    }
  };

  const handleImport = (item) => {
    if (actionData.includes(item.id)) {
      openSuccessModal({
        title: t("message.success"),
        message: "This ceremony has already been imported.",
        onClickDone: closeSuccessModel,
      });
      return;
    }

    setActiveRow(item.id);
    setImportData(item);
    setAddNewModal(true);
  };

  return (
    <>
      <div className="venues-page-layout grid grid-cols-12 items-start gap-5 lg:items-stretch">
        <div className={`col-span-12 lg:col-span-8 ${isRecommended ? "h-full" : ""}`}>
          <div
            className={`venues-list-card card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)] ${
              isRecommended ? "" : "rounded-20 bg-white !p-6"
            }`}
          >
            <div className={isRecommended ? "w-full" : "mb-5 w-full"}>
              <div
                className={`flex w-full items-center justify-between ${
                  isRecommended ? "gap-4" : "min-h-11 gap-6"
                }`}
              >
                <h2 className="shrink-0 text-xl font-semibold text-black">{pageTitle}</h2>
                <div className={`relative ml-auto flex items-center ${isRecommended ? "" : "shrink-0"}`}>
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    placeholder={`${t("placeholders.search")}...`}
                    autoComplete="off"
                    value={searchText}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSearchText(value);
                      if (!value.trim()) {
                        setCurrentPage(1);
                        getCeremonies({ clearSearch: true, page: 1 });
                      }
                    }}
                    onKeyDown={handleSearch}
                    className={`block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:border-primary-color-100 focus:ring-primary-color ${
                      isRecommended ? "" : "py-2"
                    }`}
                  />
                </div>
              </div>

              <Link
                to={CEREMONIES}
                className={`${isRecommended ? "mt-4" : "mt-5"} inline-flex items-center text-sm font-medium text-secondary hover:underline`}
              >
                <ArrowLeftIcon className="mr-2 h-5 w-4" />
                {t("ceremonies.backToCeremonies")}
              </Link>
            </div>

            <div className={`${isRecommended ? "mt-5" : ""} flex min-h-0 flex-1 flex-col`}>
              <div className="-mx-6 mb-8 flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {tableHead.map((head) => (
                        <th
                          key={head.sortKey}
                          className="border-b border-gray-100 bg-white p-4 first:pl-6"
                          onClick={() => head.sortKey !== "imported" && requestSort(head.sortKey)}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-sm font-semibold leading-5 text-black">
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
                        <td colSpan="3">
                          <Skeleton count={itemsPerPage} height={50} />
                        </td>
                      </tr>
                    ) : items.length ? (
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
                          <td className="max-w-sm py-3 pl-4 pr-3">
                            <p className="line-clamp-1 text-sm font-normal text-primary-color-200">
                              {item?.[significanceKey] || "-"}
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
                                handleImport(item);
                              }}
                            >
                              {actionData.includes(item?.id) ? "Imported" : "Import"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">
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

        <div className={`col-span-12 lg:col-span-4 ${isRecommended ? "h-full" : ""}`}>
          <div
            className={`venues-details-card card flex h-[72vh] flex-col overflow-hidden shadow-[0_12px_34px_rgba(15,23,42,0.14)] lg:sticky lg:top-0 ${
              isRecommended ? "" : "rounded-20 bg-white !p-6"
            }`}
          >
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : detail ? (
              <div className="-mx-1 -my-1 flex min-h-0 flex-1 flex-col px-1 py-1">
                <div className="shrink-0">
                  <h2 className="text-xl font-semibold text-black">{detail?.name || "-"}</h2>
                </div>

                <div className="venue-details-scroll -mr-2 mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
                  <section>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <SparklesIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("ceremonies.ceremonyDetails")}</h3>
                    </div>
                    <div className="pt-5">
                      <p className="text-xs text-gray-600">{t("ceremonies.ceremonySignificance")}</p>
                      <ExpandableText text={detail?.[significanceKey]} className="mt-1" />
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <PhotoIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("headings.relevantImages")}</h3>
                    </div>
                    {detail?.images?.length ? (
                      <div className="grid grid-cols-3 gap-2 pt-5">
                        <PhotoProvider>
                          {detail.images.map((image, index) => (
                            <PhotoView key={`${image}-${index}`} src={mediaUrl + image}>
                              <img
                                src={mediaUrl + image}
                                alt={`ceremony-${index + 1}`}
                                className="h-24 w-full cursor-pointer rounded-10 object-cover"
                              />
                            </PhotoView>
                          ))}
                        </PhotoProvider>
                      </div>
                    ) : (
                      <p className="pt-5 text-sm text-gray-600">{t("ceremonies.noImagesAvailable")}</p>
                    )}
                  </section>

                  {socialMediaLinks.length > 0 && (
                    <section className="mt-8 pb-2">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                        <LinkIcon className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">{t("headings.socialMediaLinks")}</h3>
                      </div>
                      <div className="space-y-3 pt-5">
                        {socialMediaLinks.map((link, index) => (
                          <a
                            key={`${link?.url || "link"}-${index}`}
                            href={link?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block break-all text-sm font-medium text-secondary hover:underline"
                          >
                            {link?.name ? `${link.name.charAt(0).toUpperCase()}${link.name.slice(1)}: ` : ""}
                            {link?.url}
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-center">
                <div>
                  <Lottie options={emptyFolderAnimation} width={170} height={170} />
                  <h4 className="-mt-4 text-base font-semibold text-black">{t("ceremonies.noCeremonySelected")}</h4>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddCeremoniesModal
        data={null}
        isOpen={addNewModal}
        setModalData={() => {}}
        refreshData={() => {
          getCeremonies();
          getAction();
        }}
        setIsOpen={() => setAddNewModal(false)}
        rData={isRecommended ? importData : null}
        tData={isRecommended ? null : importData}
        setRecommendedData={isRecommended ? setImportData : undefined}
        setTrendingData={isRecommended ? undefined : setImportData}
      />
    </>
  );
};

export default CeremonyCatalogue;
