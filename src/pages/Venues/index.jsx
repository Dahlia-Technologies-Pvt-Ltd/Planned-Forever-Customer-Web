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
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import Badge from "../../components/common/Badge";
import { useTranslation } from "react-i18next";

const Venues = () => {
  // Translations
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("venues.venueName"), t("venues.contactPerson"), t("venues.phone"), t("venues.type"), t("venues.city")];

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
        setAllVenues(data.data.data);
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
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">{t("title")}</h3>

              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {selectedEventRights?.rights?.includes("Recommended Venues") && (
                    <Link to={RECOMMENDED_VENUES}>
                      <Button title={t("venues.recommendedVenue")} buttonColor="border-primary  bg-primary " />
                    </Link>
                  )}
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "venues-create")) && (
                    <Button title={t("venues.addVenue")} onClick={() => setAddNewModal(true)} />
                  )}

                  <Link to={VENUE_PRINT}>
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
                        getVenues(true);
                      }
                    }}
                    onKeyDown={handleKeyPress}
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
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
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
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.contact_person_name}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.contact_numbers[0] && (
                                <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                                  {item?.contact_numbers[0].mobile || item?.contact_numbers[0].land_line_number}
                                </p>
                              )}
                            </p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            {item?.recommend_trending_venue === "recommended" ? (
                              <Badge title="Recommended" />
                            ) : (
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">-</p>
                            )}

                            {/* <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.recommend_trending_venue}</p> */}
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            {item.emails[0] ? (
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                                {/* {item.emails[0].personal || item.emails[0].work ? item.emails[0].personal || item.emails[0].work : "-"} */}
                                {item?.city}
                              </p>
                            ) : (
                              <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">-</p>
                            )}
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
            {/* Table End */}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items?.length > 0 ? (
              <>
                <div className="flex justify-between">
                  <h3 className="heading">{t("headings.details")}</h3>
                </div>
                <div className="-mr-6 h-[70vh] space-y-8 overflow-y-auto 3xl:mr-0">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="sub-heading">{t("headings.basicInfo")}</h2>
                      <div className="flex items-center gap-x-3">
                        {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "venues-edit")) && (
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
                        {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "venues-delete")) && (
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
                    <div className="grid grid-cols-2 gap-5 3xl:grid-cols-2">
                      <TitleValue title={t("venues.venueName")} value={detail?.name || "-"} />
                      <TitleValue title={t("venues.city")} value={detail?.city || "-"} />
                      <TitleValue title={t("venues.state")} value={detail?.state || "-"} />
                      <TitleValue title={t("venues.pin")} value={detail?.pin || "-"} />
                      <TitleValue title={t("venues.country")} value={detail?.country || "-"} />
                    </div>
                  </div>

                  <TitleValue title={t("venues.address")} value={detail?.address || "-"} />

                  <div>
                    <h2 className="sub-heading mb-5">{t("headings.contactInfo")}</h2>
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <TitleValue title={t("venues.contactPerson")} value={detail?.contact_person_name || "-"} />
                      </div>

                      <div className="flex items-center gap-x-3">
                        <TitleValue title={t("venues.countryCode")} value={detail?.contact_numbers[0]?.country_code || "-"} />
                        <TitleValue
                          title={t("venues.contact")}
                          value={detail?.contact_numbers[0]?.land_line_number || detail?.contact_numbers[0]?.mobile || "-"}
                        />
                      </div>

                      <div className="flex items-center gap-x-3">
                        <TitleValue title={t("venues.countryCode")} value={detail?.contact_numbers[1]?.country_code || "-"} />

                        <TitleValue
                          title={t("venues.contact")}
                          value={detail?.contact_numbers[1]?.land_line_number || detail?.contact_numbers[1]?.mobile || "-"}
                        />
                      </div>

                      <div className="flex items-center gap-x-3">
                        <TitleValue title={t("venues.countryCode")} value={detail?.contact_numbers[2]?.country_code || "-"} />

                        <TitleValue
                          title={t("venues.contact")}
                          value={detail?.contact_numbers[2]?.land_line_number || detail?.contact_numbers[2]?.mobile || "-"}
                        />
                      </div>
                      <div className="space-y-3">
                        <TitleValue title={t("venues.email")} value={detail?.emails[0]?.personal || detail?.emails[0]?.work || "-"} />
                        <TitleValue title={t("venues.email")} value={detail?.emails[1]?.work || detail?.emails[1]?.personal || "-"} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="sub-heading mb-5">{"Other Info"}</h2>
                    <TitleValue title={t("headings.notes")} value={detail?.description || "-"} />
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
