import moment from "moment";
import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import AddVendorModal from "./AddVendorModal";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Badge from "../../components/common/Badge";
import { RECOMMENDED_VENDORS, VENDOR_PRINT } from "../../routes/Names";
import Button from "../../components/common/Button";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { tabClasses } from "@mui/material";

// Table Head

const Vendors = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD = [t("vendor.vendorName"), t("vendor.contactPerson"), t("vendor.contactNumber"), t("vendor.tags")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, userData, selectedEventRights } = useThemeContext();

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

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

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
        event_id: eventSelect,
      };

      const res = await ApiServices.vendors.getVendors(payload);
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

      const res = await ApiServices.vendors.deleteVendor(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getVendorsListing();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("vendor.vendorDeleteSuccess"),
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

  useEffect(() => {
    getVendorsListing();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Vendors</h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  {selectedEventRights?.rights?.includes("Recommended Vendors") && (
                    <Link to={RECOMMENDED_VENDORS}>
                      <Button title={t("vendor.recommendedVendors")} buttonColor="border-primary  bg-primary " />
                    </Link>
                  )}
                  {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "vendors-create")) && (
                    <Button title={t("vendor.addVendor")} onClick={() => setAddNewModal(true)} />
                  )}

                  <Link to={VENDOR_PRINT}>
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
                            } else if (head === "Contact Person") {
                              sortKey = "first_contact_person_name";
                            } else if (head === "Contact Number") {
                              sortKey = "first_contact_person_phone";
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
                                : head === "Contact Person"
                                  ? "first_contact_person_name"
                                  : head === "Contact Number"
                                    ? "first_contact_person_phone"
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
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.first_contact_person_name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.first_contact_person_phone?.phone || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">
                              {item?.tags?.slice(0, 3).map((tag, index) => (
                                <span key={index}>
                                  <Badge title={tag} />
                                </span>
                              ))}
                            </p>
                          </td>
                          {/* 
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
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
                      <h2 className="sub-heading ">{t("headings.basicInfo")}</h2>
                      <div className="flex justify-between">
                        <h3 className="heading">{t("headings.details")} </h3>
                        <div className="flex items-center gap-x-3">
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "vendors-edit")) && (
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
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "vendors-delete")) && (
                            <button
                              onClick={() => setOpenDeleteModal({ open: true, data: detail })}
                              className="border-b border-red-500 text-sm font-medium text-red-500 "
                              type="button"
                            >
                              {t("buttons.delete")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-5">
                      <TitleValue title={t("vendor.vendorName")} value={detail?.name || "-"} />
                      <TitleValue title={t("vendor.vendorAddress")} value={detail?.address || "-"} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t("vendor.1stContactPerson")}</h2>
                    <div className="flex flex-wrap gap-5">
                      <TitleValue title={t("vendor.name")} value={detail?.first_contact_person_name || "-"} />
                      <TitleValue title={t("vendor.designation")} value={detail?.first_contact_person_designation || "-"} />
                      <TitleValue title={t("vendor.countryCode")} value={detail?.first_contact_person_phone?.countryCode || "-"} />
                      <TitleValue title={t("vendor.contactNumber")} value={detail?.first_contact_person_phone?.phone || "-"} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t("vendor.2ndContactPerson")}</h2>
                    <div className="flex flex-wrap gap-5">
                      <TitleValue title={t("vendor.name")} value={detail?.second_contact_person_name || "-"} />
                      <TitleValue title={t("vendor.designation")} value={detail?.second_contact_person_designation || "-"} />
                      <TitleValue title={t("vendor.countryCode")} value={detail?.second_contact_person_phone?.countryCode || "-"} />
                      <TitleValue title={t("vendor.contactNumber")} value={detail?.second_contact_person_phone?.phone || "-"} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t("headings.otherInfo")}</h2>
                    <div className="grid grid-cols-1 gap-5">
                      <div className="w-full space-y-2">
                        <h3 className="text-xs text-info-color">{t("vendor.tags")}</h3>
                        {detail?.tags?.map((tag, index) => (
                          <span className="inline-block" key={index}>
                            <Badge title={tag} />
                          </span>
                        ))}
                      </div>
                      <TitleValue title={t("headings.notes")} value={detail?.notes || "-"} />
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
        rData={null}
      />

      {/* Delete Modal*/}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteVendor}
        message={t("vendor.vendorDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Vendors;
