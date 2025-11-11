import moment from "moment";
import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import AddVendorModal from "./AddVendorModal";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Badge from "../../components/common/Badge";
import { VENDOR_PRINT, VENDORS } from "../../routes/Names";
import Button from "../../components/common/Button";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon , ArrowLeftIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/common/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { mediaUrl } from "@utilities/config";
import { useTranslation } from "react-i18next";

// Table Head

const Vendors = () => {

  const { t } = useTranslation("common");

  const TABLE_HEAD = [
    t("vendor.vendorName"),
    t("vendor.category"),
    t("vendor.subCategory"),
    t("vendor.furtherClassification"),
    t("vendor.customTag"),
    t("vendor.imported")
];

  // Context
  const { eventSelect , loading, setLoading, setBtnLoading, allType2CategoryList, getType2CategoryList } = useThemeContext();

  // Use States
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Data
  const [allVendors, setAllVendors] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [modalData, setModalData] = useState(null);
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  const [recommendedData, setRecommendedData] = useState(null);

  const navigate = useNavigate();

  // Active Row
  // const handleRowClick = (id) => {
  //   setActiveRow(id);
  // };

  // Detail of selected row
  const detail = allVendors?.find((item) => item?.id === (activeRow || allVendors[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allVendors);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Vendors
  const getVendorsListing = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        category_id: category?.value,
        sub_category_id: subCategory?.value,
        classification_id: furtherClassification?.value,
        event_id : eventSelect
      };

      const res = await ApiServices.vendors.getRecommandedVendors(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllVendors(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete Vendor
  const handleDeleteVendor = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.vendors.deleteRecommandedVendor(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getVendorsListing();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: "Vendor has been deleted successfully",
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

  // Use Effects
  // useEffect(() => {
  //   if (searchText?.length > 1 || searchText?.length === 0) {
  //     getVendorsListing();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getVendorsListing(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getVendorsListing();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  const [category, setCategory] = useState("");
  const [allSubCategoryList, setAllSubCategoryList] = useState([]);
  const [allClassificationList, setAllClassificatioinList] = useState([]);
  const [subCategory, setSubCategory] = useState(null);
  const [furtherClassification, setFurtherClassification] = useState([]);

  // Event handler for Category dropdown change
  const handleCategoryChange = async (selectedCategory) => {
    setCategory(selectedCategory);
    // setCategoryError("");
    await getSubCategoryList(selectedCategory.value);
  };

  const handleSubCategoryChange = async (selectedSubCategory) => {
    setSubCategory(selectedSubCategory);
    await getFurtherClassification(selectedSubCategory);
  };

  // Get Sub Category List
  const getSubCategoryList = async (categoryId) => {
    try {
      const payload = {
        type: 2,
        event_id : eventSelect
      };

      const response = await ApiServices.sub_category.getSubCategoryByCategory(categoryId, payload);

      if (response.data.code === 200) {
        const formattedSubCategory = response.data.data.map((subcategory) => ({
          value: subcategory.id,
          label: subcategory.name,
        }));

        setAllSubCategoryList(formattedSubCategory);
      }
    } catch (err) {}
  };

  const getFurtherClassification = async (selectedSubCategory) => {
    if (selectedSubCategory?.value) {
      try {
        setBtnLoading(true);

        let payload = {
          // category_id: category?.value,
          sub_category_id: selectedSubCategory?.value,
          type: 2,
          // event_id : eventSelect
        };

        const response = await ApiServices.further_classification.addFurtherClassificationByIds(payload);

        if (response.data.code === 200) {
          const formattedSubCategory = response.data.data.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
          }));

          setAllClassificatioinList(formattedSubCategory);
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
      }
    }
  };

  useEffect(() => {
    getVendorsListing();
  }, [currentPage, category, subCategory, furtherClassification]);

  useEffect(() => {
    getType2CategoryList();
  }, []);

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
        type: "vendor",
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

  const handleRowClick = (item) => {
    setActiveRow(item?.id);
    // if (!actionData.includes(item.id)) {
    //   setAddNewModal(true);
    //   setRecommendedData(item);
    // } else {
    //   // You can add other actions here if needed when the item is already in actionData
    //   // alert("This item is already added in the venue action is check");
    //   openSuccessModal({
    //     title: "Success!",
    //     message: "This item is already added in the vendors that why action is check",
    //     onClickDone: (close) => {
    //       closeSuccessModel();
    //     },
    //   });
    // }
  };

  const handleCheckboxChange = (id) => {
    if (actionData.includes(id)) {
      // If the id exists, uncheck it by removing it from actionData
      setActionData(actionData.filter((actionId) => actionId !== id));
    } else {
      // If the id doesn't exist, check it by adding it to actionData
      setActionData([...actionData, id]);
    }
  };

  useEffect(() => {
    getAction();
  }, [currentPage]);

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
  }

  console.log({detail})

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Vendors</h3>
              <div className="flex w-full items-center justify-between">
              <Link to={VENDORS}>
              <div className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
                <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
                <span>{t("vendor.backToVendorList")}</span>
              </div>
            </Link>
                {/* <Link to={VENDOR_PRINT}>
                <Button title={commonT('buttons.print')} buttonColor="border-primary  bg-primary " />
                </Link> */}
                {/* <Button title="Add Vendor" onClick={() => setAddNewModal(true)} /> */}
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    placeholder={t('placeholders.search')+'...'}
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getVendorsListing(true);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
                  />
                </div>
              </div>
            </div>
            <div className="mb-5 mt-7 grid grid-cols-3 gap-7">
              <Dropdown
                isSearchable
                options={allType2CategoryList}
                placeholder="Category"
                title={t("vendor.category")}
                value={category}
                onChange={(selectedCategory) => handleCategoryChange(selectedCategory)}
              />
              <Dropdown
                isSearchable
                options={allSubCategoryList}
                placeholder="Sub Category"
                title={t("vendor.subCategory")}
                value={subCategory}
                onChange={(selectedSubCategory) => handleSubCategoryChange(selectedSubCategory)}
              />
              <Dropdown
                isSearchable
                options={allClassificationList}
                placeholder="Further Classification"
                value={furtherClassification}
                onChange={(e) => {
                  setFurtherClassification(e);
                }}
                title={t("vendor.furtherClassification")}
              />
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
                            if (head === "Vendor Name") {
                              sortKey = "name";
                            } else if (head === "Category") {
                              sortKey = "category.name";
                            } else if (head === "Sub Category") {
                              sortKey = "sub_category.name";
                            } else if (head === "Further Classification") {
                              sortKey = "classification.name";
                            } else if (head === "Custom Tags") {
                              sortKey = "tags[0].tag_details.name";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Vendor Name"
                                ? "name"
                                : head === "Category"
                                  ? "category.name"
                                  : head === "Sub Category"
                                    ? "sub_category.name"
                                    : head === "Further Classification"
                                      ? "classification.name"
                                      : head === "Custom Tags"
                                        ? "tags[0].tag_details.name"
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
                            {console.log({ item })}
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.category?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.sub_category?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.classification?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                              {item?.tags?.slice(0, 2).map((tag, index) => (
                                <span key={index}>
                                  <Badge title={tag?.name} />
                                </span>
                              ))}
                            </p>
                          </td>

                          {/* <td className="py-3 pl-4 3xl:px-4">
                            <input type="checkbox" checked={actionData.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} disabled />
                          </td> */}

<td className="py-3 pl-4 flex gap-x-2 items-center 3xl:px-4">
                            {/* <input type="checkbox" checked={actionData.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} disabled /> */}
                            <p className={`${actionData.includes(item?.id) ? "text-xs text-secondary border border-secondary   p-1 font-normal 3xl:text-sm" : "text-xs text-primary border border-primary p-1 font-normal 3xl:text-sm"}`} onClick={() => handleAddVenue(item)}>{actionData.includes(item?.id) ? "Imported" : "Import"}</p>
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
          </div>
        </div>
        

        <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items.length > 0 ? (
              <>
                <div className="h-[70vh] overflow-y-auto">
                  <div className="mt-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="sub-heading">{t('headings.basicInfo')}</h2>
                      <div className="flex justify-between">
                        <h3 className="heading">{t("headings.details")} </h3>
                        {/* <div className="flex items-center gap-x-3">
                          <button
                            className="border-b border-secondary text-sm font-medium text-secondary"
                            type="button"
                            onClick={() => {
                              setAddNewModal(true);
                              setModalData(detail);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setOpenDeleteModal({ open: true, data: detail })}
                            className="border-b border-red-500 text-sm font-medium text-red-500 "
                            type="button"
                          >
                            Delete
                          </button>
                        </div> */}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-5">
                      <TitleValue title={t("vendor.vendorName")} value={detail?.name || "-"} />
                      <TitleValue title={t("vendor.vendorAddress")} value={detail?.address || "-"} />
                      <TitleValue title={t("vendor.countryCode")} value={detail?.contact?.countryCode || "-"} />
                      <TitleValue title={t("vendor.contactNumber")} value={detail?.contact?.phone || "-"} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t("vendor.1stContactPerson")}</h2>
                    <div className="flex flex-wrap gap-5">
                      <TitleValue title={t("vendor.name")} value={detail?.["1st_contact_person_name"] || "-"} />
                      <TitleValue title={t("vendor.designation")} value={detail?.["1st_contact_person_designation"] || "-"} />
                      <TitleValue title={t("vendor.countryCode")} value={detail?.["1st_contact_person_contact_number"]?.countryCode || "-"} />
                      <TitleValue title={t("vendor.contactNumber")} value={detail?.["1st_contact_person_contact_number"]?.phone || "-"} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t("vendor.2ndContactPerson")}</h2>
                    <div className="flex flex-wrap gap-5">
                      <TitleValue title={t("vendor.name")} value={detail?.["2nd_contact_person_name"] || "-"} />
                      <TitleValue title={t("vendor.designation")} value={detail?.["2nd_contact_person_designation"] || "-"} />
                      <TitleValue title={t("vendor.countryCode")} value={detail?.["2nd_contact_person_contact_number"]?.countryCode || "-"} />
                      <TitleValue title={t("vendor.contactNumber")} value={detail?.["2nd_contact_person_contact_number"]?.phone || "-"} />
                    </div>
                  </div>

                  

                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t('headings.otherInfo')}</h2>
                    <div className="grid grid-cols-1 gap-5">
                      <div className="w-full space-y-2">
                        <h3 className="text-xs text-info-color">{t("vendor.tags")} </h3>
                        {detail?.tags?.map((tag, index) => (
                          <span className="inline-block" key={index}>
                            <Badge title={tag?.name} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                  <div className="w-full">
                    <h3 className="mb-5 text-xs text-info-color">{t('headings.relevantImages')}</h3>
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

      {/* Add Vendor */}
      <AddVendorModal
        data={modalData}
        isOpen={addNewModal}
        setModalData={setModalData}
        refreshData={() => getVendorsListing()}
        setIsOpen={() => setAddNewModal(false)}
        rData={recommendedData}
        setRecommendedData={setRecommendedData}
      />

      {/* Delete Modal*/}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteVendor}
        message="Are you sure you want to delete this vendor?"
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Vendors;
