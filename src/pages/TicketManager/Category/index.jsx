import Lottie from "react-lottie";
import AddCategory from "./AddCategory";
import ReactPaginate from "react-paginate";
import ApiServices from "@api";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import React, { useEffect, useState } from "react";
import Button from "@components/common/Button";
import { useThemeContext } from "@context";
import { useSortableData } from "@sorting";
import { emptyFolderAnimation } from "@utilities/lottieAnimations";
import ConfirmationModal from "@components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Badge from "../../../components/common/Badge";
import { useTranslation } from "react-i18next";

const Category = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("category.name"), t("category.customField"), t("headings.actions")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, setErrorMessage } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");

  // Data
  const [allCategories, setAllCategories] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [openAddNewModal, setOpenAddNewModal] = useState({ open: false, data: null, editMode: false });

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allCategories);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Categories
  const getCategories = async (emptySearch) => {
    let payload = {
      search: emptySearch ? "" : searchText,
      page: currentPage,
      records_no: itemsPerPage,
      type: 1,
       event_id: eventSelect,
    };

    setLoading(true);

    const res = await ApiServices.category
      .getCategory(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setLoading(false);
          setAllCategories(data.data.data);
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

  // Delete Category
  const handleDeleteCategory = async () => {
    try {
      setBtnLoading(true);

      const response = await ApiServices.category.deleteCategory(openDeleteModal?.data?.id);
      if (response.data.code === 200) {
        setBtnLoading(false);
        getCategories();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("messages.success"),
          message: t("category.categoryDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      } else {
        setBtnLoading(false);
      }
    } catch (err) {
      setBtnLoading(false);
      setErrorMessage(err?.response?.data?.message);
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
        await getCategories(false);
        setCurrentPage(1);
      }
    }
  };

  //   useEffects
  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getCategories();
  //   }
  // }, [searchText]);

  useEffect(() => {
    getCategories();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Category</h3>
              <div className="flex w-full items-center justify-between">
                <Button title={t("category.addCategory")} onClick={() => setOpenAddNewModal({ open: true, data: null })} />
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
                        getCategories(true);
                      }
                    }}
                    onKeyPress={handleSearch}
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
                        <tr key={item?.uuid} className="even:bg-gray-50">
                          <td className="py-3 pl-6 pr-4">
                            {console.log({ item })}
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name}</p>
                          </td>
                          <td className="py-3 pl-6 pr-4">
                            {item?.custom_field_library?.length > 0 ? (
                              item.custom_field_library.map((tag, index) => (
                                <span key={index}>
                                  <Badge title={tag?.name || "-"} />
                                </span>
                              ))
                            ) : (
                              <span className="text-primary-color-200 text-xs font-normal 3xl:text-sm">-</span>
                            )}
                          </td>

                          <td className="flex items-end justify-end gap-x-3 px-7 py-3 pl-4">
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
      </div>

      {/* Add Category Modal */}
      <AddCategory
        data={openAddNewModal.data}
        isOpen={openAddNewModal.open}
        refreshData={getCategories}
        editMode={openAddNewModal.editMode}
        setIsOpen={(open) => setOpenAddNewModal((prev) => ({ ...prev, open }))}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteCategory}
        message={t("category.categoryDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Category;
