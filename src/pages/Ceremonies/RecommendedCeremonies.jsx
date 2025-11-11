import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import AddCeremoniesModal from "./AddCeremoniesModal";
import { CEREMONIES_PRINT, CEREMONIES } from "../../routes/Names";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { mediaUrl } from "@utilities/config";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";

const Ceremonies = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("ceremonies.ceremonyName"), t("ceremonies.ceremonySignificance"), t("headings.actions")];

  // Context
  const { eventSelect, eventDetail, loading, setLoading, setBtnLoading, btnLoading, closeSuccessModel, openSuccessModal, setErrorMessage } =
    useThemeContext();

  console.log("eventDetail", eventDetail);

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

  const [recommendedData, setRecommendedData] = useState(null);

  const { t: commonT } = useTranslation("common");

  // Active Row
  const handleRowClick = (item) => {
    setActiveRow(item?.id);
    // if (!actionData.includes(item.id)) {
    //   setAddNewModal(true);
    //   setRecommendedData(item);
    // } else {
    //   // You can add other actions here if needed when the item is already in actionData
    //   // alert("This item is already added in the ceremony action is check");
    //   openSuccessModal({
    //     title: "Success!",
    //     message: "This item is already added in the ceremony that why action is check",
    //     onClickDone: (close) => {
    //       closeSuccessModel();
    //     },
    //   });
    // }
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
        wedding_type_id: eventDetail?.wedding_types?.map((item) => item?.id),
        status: "recommended",
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
          title: "Success!",
          message: "Ceremony has been deleted successfully",
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
        type: "ceremony",
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
        type: "ceremony",
        recommended_trending_id: actionData,
        recommended_trending_type: "recommended",
      };

      const response = await ApiServices.ceremonies.addAction(payload);

      if (response.data.code === 200) {
        setBtnLoading(false);
        getAction();
        getCeremonies();
        openSuccessModal({
          title: "Success!",
          message: data === null ? "Ceremony has been added successfully" : "Ceremony has been updated successfully",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
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
    getCeremonies();
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
            <Link to={CEREMONIES}>
              <div className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
                <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
                <span>{t("ceremonies.backToCeremonies")}</span>
              </div>
            </Link>
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
                          onClick={() => handleRowClick(item)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.name}</p>
                          </td>

                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="line-clamp-1 text-xs font-normal text-primary-color 3xl:text-sm">{item?.recommended_significance}</p>
                          </td>

                          <td className="py-3 pl-4 3xl:px-4">
                            {/* <input type="checkbox" checked={actionData.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} disabled /> */}
                            <p
                              className={`${actionData.includes(item?.id) ? "border border-secondary p-1 text-xs   font-normal text-secondary 3xl:text-sm" : "border border-primary p-1 text-xs font-normal text-primary 3xl:text-sm"}`}
                              onClick={() => handleAddVenue(item)}
                            >
                              {actionData.includes(item?.id) ? "Imported" : "Import"}
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

              <div className="absolute bottom-4 flex w-full justify-between pr-10">
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
                {/* <Button
                       
                          title="Done"
                          type="button"
                          onClick={addActionCeremony}
                          loading={btnLoading}
                        /> */}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            <>
              <div className="h-[70vh] overflow-y-auto">
                <div className="mt-6">
                  <h2 className="sub-heading mb-5">{t("headings.details")}</h2>
                </div>

                <div>
                  <TitleValue title="Ceremony Significance" value={detail?.recommended_significance} />
                </div>

                <div className="mt-6 ltr:text-left rtl:text-right">
                  <h2 className="sub-heading mb-5">{t("headings.otherInfo")}</h2>
                </div>

                <div className="mt-2">
                  <div className="w-full">
                    <h3 className="mb-5 text-xs text-info-color">{t("headings.relevantImages")}</h3>
                    {detail?.images && detail.images.length > 0 ? (
                      <div className="grid w-full grid-cols-3 gap-2">
                        <PhotoProvider>
                          {detail.images.map((item) => (
                            <PhotoView key={item} src={mediaUrl + item}>
                              <img src={mediaUrl + item} alt="image" className="h-full w-full cursor-pointer rounded-10 object-cover" />
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
                  <h2 className="sub-heading mb-5">{t("headings.socialMediaLinks")}</h2>
                  <div className="flex flex-wrap gap-5">
                    <div className="flex flex-wrap gap-5">
                      {detail?.social_media_links && detail.social_media_links.length > 0 ? (
                        detail.social_media_links.map((item, index) => (
                          <TitleValue
                            key={index}
                            isLink
                            title={item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                            value={item?.url || "-"}
                            url={item?.url || "-"}
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

      {/* Add Ceremony Modal */}
      <AddCeremoniesModal
        data={modalData}
        isOpen={addNewModal}
        setModalData={setModalData}
        refreshData={() => getCeremonies()}
        setIsOpen={() => setAddNewModal(false)}
        rData={recommendedData}
        setRecommendedData={setRecommendedData}
        tData={null}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteCeremony}
        message="Are you sure you want to delete this ceremony?"
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Ceremonies;
