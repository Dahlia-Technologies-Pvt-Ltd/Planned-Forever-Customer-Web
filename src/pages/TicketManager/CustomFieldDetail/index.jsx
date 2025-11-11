import ApiServices from "@api";
import Lottie from "react-lottie";
import { useThemeContext } from "@context";
import { useSortableData } from "@sorting";
import ReactPaginate from "react-paginate";
import Skeleton from "react-loading-skeleton";
import Button from "@components/common/Button";
import { useMediaQuery } from "react-responsive";
import React, { useEffect, useState } from "react";
import AddCustomField from "./AddCustomFieldDetail";
import { emptyFolderAnimation } from "@utilities/lottieAnimations";
import ConfirmationModal from "@components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Badge from "../../../components/common/Badge";
import TitleValue from "../../../components/common/TitleValue";
import { useTranslation } from "react-i18next";

const CustomFieldDetail = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("customFieldTypeDetail.fieldName"), t("customFieldTypeDetail.fieldDetail"), t("headings.actions")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, setErrorMessage } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");

  // Data
  const [allCustomFieldDetail, setAllCustomFieldDetail] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [openAddNewModal, setOpenAddNewModal] = useState({ open: false, data: null, editMode: false });

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allCustomFieldDetail);
  const [activeRow, setActiveRow] = useState(null);
  const detail = allCustomFieldDetail?.find((item) => item?.id === (activeRow || allCustomFieldDetail[0]?.id));

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get CustomFieldDetail
  const getCustomFieldDetail = async (emptySearch) => {
    let payload = {
      search: emptySearch ? "" : searchText,
      page: currentPage,
      records_no: itemsPerPage,
      event_id: eventSelect,
    };

    setLoading(true);

    const res = await ApiServices.Custom_Field_Type.getCustomFieldType(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setLoading(false);
          setAllCustomFieldDetail(data.data.data);
          setCurrentPage(data?.data?.current_page);
          setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  // Delete Custom Field Detail
  const handleDeleteCategory = async () => {
    try {
      setBtnLoading(true);

      const response = await ApiServices.Custom_Field_Type.deleteCustomFiledType(openDeleteModal?.data?.id);
      if (response.data.code === 200) {
        setBtnLoading(false);
        getCustomFieldDetail();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("messages.success"),
          message: t("customFieldTypeDetail.customFieldTypeDetailDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      } else {
        setBtnLoading(false);
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

  // Handle Search
  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getCustomFieldDetail(false);
        setCurrentPage(1);
      }
    }
  };

  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  //   useEffects
  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getCustomFieldDetail();
  //   }
  // }, [searchText]);

  useEffect(() => {
    getCustomFieldDetail();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Custom Field Detail</h3>
              <div className="flex w-full items-center justify-between">
                <Button title={t("customFieldTypeDetail.addCustomFieldDetail")} onClick={() => setOpenAddNewModal({ open: true, data: null })} />
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    autoComplete="off"
                    value={searchText}
                    placeholder={t("placeholders.search") + "..."}
                    onKeyPress={handleSearch}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getCustomFieldDetail(true);
                      }
                    }}
                    className="focus:border-primary-color-100 block h-11 w-44 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
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
                          className="border-b border-gray-100 bg-white p-4 first:pl-6 last:flex last:items-end last:justify-end last:pr-6"
                          onClick={() => {
                            let sortKey;
                            if (head === "Hotel Name") {
                              sortKey = "name";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key === (head === "Hotel Name" ? "name" : head.toLowerCase()) && sortConfig.direction === "asc" ? (
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
                            {console.log({ item })}
                          </td>
                          <td className="py-3 pl-6 pr-4">
                            {item?.detail?.slice(0, 3).map((tag, index) => (
                              <span key={index}>
                                <Badge title={tag.name} />
                              </span>
                            ))}
                          </td>

                          <td className="flex items-end justify-end gap-x-3 py-3 pl-4 pr-6">
                            <span
                              onClick={() => setOpenAddNewModal({ open: true, data: item, editMode: true })}
                              className="cursor-pointer text-xs font-normal text-secondary underline underline-offset-4 3xl:text-sm"
                            >
                              {t("buttons.edit")}
                            </span>
                            <span
                              onClick={() => setOpenDeleteModal({ open: true, data: item })}
                              className="cursor-pointer text-xs font-normal text-red-500 underline underline-offset-4 3xl:text-sm"
                            >
                              {t("buttons.delete")}
                            </span>
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

        <div className="col-span-12 lg:col-span-5">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items.length > 0 ? (
              <>
                <div className="flex justify-between">
                  <h3 className="heading">{t("headings.details")}</h3>
                </div>

                <div className="h-[70vh] overflow-y-auto">
                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t("headings.basicInfo")}</h2>
                    <div className="flex flex-wrap gap-5">
                      <TitleValue title={t("customFieldTypeDetail.vendorName")} value={detail?.name || "-"} />
                    </div>
                    <div className="mt-3 w-full space-y-2">
                      <h3 className="text-xs text-info-color">{t("customFieldTypeDetail.tags")}</h3>
                      {detail?.detail?.map((tag, index) => (
                        <span className="inline-block" key={index}>
                          <Badge title={tag.name} />
                        </span>
                      ))}
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

      {/* Add CustomField Modal */}
      <AddCustomField
        data={openAddNewModal.data}
        isOpen={openAddNewModal.open}
        refreshData={getCustomFieldDetail}
        editMode={openAddNewModal.editMode}
        setIsOpen={(open) => setOpenAddNewModal((prev) => ({ ...prev, open }))}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteCategory}
        message={t("customFieldTypeDetail.customFieldTypeDetailDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default CustomFieldDetail;
