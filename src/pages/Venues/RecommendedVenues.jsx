import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import AddVenueModal from "./AddVenueModal";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { VENUE_PRINT, VENUES } from "../../routes/Names";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { mediaUrl } from "@utilities/config";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";

const Venues = () => {
  // translation
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("venues.venueName"), t("venues.contactPerson"), t("venues.phone"), t("venues.imported")];

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
      setAddNewModal(true);
      setRecommendedData(item);
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
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <Link to={VENUES}>
              <div className={`flex mb-5 text-base font-medium cursor-pointer text-secondary hover:underline`}>
                <ArrowLeftIcon className="mr-2 w-4 h-6 text-secondary" />
                <span> {t("venues.backToVenuesList")}</span>
              </div>
            </Link>
            <div className="flex justify-between">
              <h3 className="heading">{t("title")}</h3>
            </div>
            {/* Table Start */}
            <div className="mt-5">
              <div className="overflow-x-auto -mx-6 mb-8">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {TABLE_HEAD.map((head) => (
                        <th
                          key={head}
                          className="p-4 bg-white border-b border-gray-100 first:pl-6"
                          onClick={() => {
                            let sortKey;
                            if (head === "Venue Name") {
                              sortKey = "name";
                            } else if (head === "Contact Person") {
                              sortKey = "contact_person_name";
                            } else if (head === "Phone") {
                              sortKey = "contactNumbers";
                            } else if (head === "Email") {
                              sortKey = "emails";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Venue Name"
                                ? "name"
                                : head === "Contact Person"
                                  ? "contact_person_name"
                                  : head === "Phone"
                                    ? "contactNumbers"
                                    : head === "Email"
                                      ? "emails"
                                      : head.toLowerCase()) && sortConfig.direction === "asc" ? (
                              <ChevronUpIcon className="inline-block w-3.5 h-4" />
                            ) : (
                              <ChevronDownIcon className="inline-block w-3.5 h-4" />
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
                          onClick={() => handleRowClick(item)}
                        >
                          <td className="py-3 pr-4 pl-6">
                            <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.name}</p>
                          </td>

                          <td className="py-3 pr-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.contact_person_name}</p>
                          </td>

                          <td className="py-3 pr-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">
                              {item?.contact_numbers?.length > 0
                                ? item?.contact_numbers[0]?.mobile || item?.contact_numbers[0]?.land_line_number
                                : "-"}
                            </p>
                          </td>

                          <td className="flex gap-x-2 items-center py-3 pl-4 3xl:px-4">
                            {/* <input type="checkbox" checked={actionData.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} disabled /> */}
                            <p
                              className={`${actionData.includes(item?.id) ? "border border-secondary p-1 text-xs   font-normal text-secondary 3xl:text-sm" : "border border-primary p-1 text-xs font-normal text-primary 3xl:text-sm"}`}
                              onClick={() => handleAddVenue(item)}
                            >
                              {actionData.includes(item?.id) ? "Imported" : "Import"}
                            </p>
                          </td>
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

              <div className="flex absolute bottom-4 justify-between pr-10 w-full">
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
            </div>

            {/* Table End */}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            <>
              <div className="h-[70vh] overflow-y-auto">
                <div className="mt-6">
                  <h2 className="mb-5 sub-heading">{t("venues.venueDetail")}</h2>
                </div>

                <div className="mb-3">
                  <TitleValue title={t("venues.venueSignificance")} value={detail?.recommended_significance} />
                </div>

                <div className="grid grid-cols-2 gap-5 3xl:grid-cols-2">
                  <TitleValue title={t("venues.city")} value={detail?.city || "-"} />
                  <TitleValue title={t("venues.state")} value={detail?.state || "-"} />
                  <TitleValue title={t("venues.pin")} value={detail?.pin || "-"} />
                  <TitleValue title={t("venues.country")} value={detail?.country || "-"} />
                </div>

                <div className="mt-3">
                  <TitleValue title={t("venues.venueAddress")} value={detail?.address || "-"} />
                </div>

                <div className="mt-6">
                  <h2 className="mb-5 sub-heading">{t("headings.otherInfo")}</h2>
                </div>

                <TitleValue title={t("venues.contactPerson")} value={detail?.contact_person_name || "-"} />

                <ul className="mt-2">
                  {detail?.contact_numbers?.map((contact, index) => (
                    <li key={index} className="flex gap-x-5 items-center">
                      {contact?.country_code && (
                        <div className="my-2">
                          <TitleValue title={t("venues.countryCode")} value={contact?.country_code || "-"} />
                        </div>
                      )}
                      {(contact?.mobile || contact?.land_line_number) && (
                        <TitleValue title={t("venues.contactNumber")} value={contact?.mobile || contact?.land_line_number || "-"} />
                      )}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-x-5 my-2">
                  <TitleValue title={t("venues.email1")} value={detail?.emails?.[0]?.personal || detail?.emails?.[0]?.work || "-"} />
                  <TitleValue title={t("venues.email2")} value={detail?.emails?.[1]?.work || detail?.emails?.[1]?.personal || "-"} />
                </div>

                <div className="mt-2">
                  <div className="w-full">
                    <h3 className="mb-5 text-xs text-info-color">{t("headings.relevantImages")}</h3>
                    {detail?.images && detail.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 w-full">
                        <PhotoProvider>
                          {detail?.images?.map((item, index) => (
                            <PhotoView key={item} src={mediaUrl + item}>
                              <img src={mediaUrl + item} alt={`image-${index}`} className="object-cover w-full h-full cursor-pointer rounded-10" />
                            </PhotoView>
                          ))}
                        </PhotoProvider>
                      </div>
                    ) : (
                      <p className="text-xs text-info-color">-</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="mb-5 sub-heading">{t("headings.socialMediaLinks")}</h2>
                  <div className="flex flex-wrap gap-5">
                    <div className="flex flex-wrap gap-5">
                      {detail?.social_media_links && detail.social_media_links.length > 0 ? (
                        detail.social_media_links.map((item, index) => (
                          <TitleValue
                            url={item?.url}
                            key={index}
                            isLink
                            title={item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                            value={item?.url || "-"}
                          />
                        ))
                      ) : (
                        <p className="text-xs text-info-color">-</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
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
        message={t("modal.message")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Venues;
