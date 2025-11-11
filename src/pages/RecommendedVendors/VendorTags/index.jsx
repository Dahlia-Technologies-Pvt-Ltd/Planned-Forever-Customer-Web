import AddTags from "./AddTags";
import Lottie from "react-lottie";
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
import { useTranslation } from "react-i18next";

// Table Head
const TABLE_HEAD = ["Name", "Actions"];

const Tags = () => {

  const { t: commonT } = useTranslation("common");

  // Context
  const { eventSelect , loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");

  // Data
  const [allTags, setAllTags] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [addNewModal, setAddNewModal] = useState({ open: false, data: null });
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allTags);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get Tags
  // Get Categories
  const getTags = async (emptySearch) => {
    let payload = {
      search: emptySearch ? "" : searchText,
      page: currentPage,
      records_no: itemsPerPage,
      quick_contact: 1,
      event_id : eventSelect
    };

    setLoading(true);

    const res = await ApiServices.Vendor_Tags.getVendorTags(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setLoading(false);
          setAllTags(data.data.data);
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

  // Delete Tag
  const handleDeleteTags = async () => {
    try {
      setBtnLoading(true);

      const response = await ApiServices.Vendor_Tags.deleteVendorTag(openDeleteModal?.data?.id);
      if (response.data.code === 200) {
        setBtnLoading(false);
        getTags();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: "Tag has been deleted successfully",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      } else {
        setBtnLoading(false);
      }
    } catch (err) {
      setBtnLoading(false);
    }
  };
  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // Handle Search
  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getTags(false);
        setCurrentPage(1);
      }
    }
  };

  //   useEffects
  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getTags();
  //   }
  // }, [searchText]);

  useEffect(() => {
    getTags();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Tags</h3>
              <div className="flex items-center justify-between w-full">
                <Button title="Add Tag" onClick={() => setAddNewModal({ open: true, data: null })} />
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    placeholder={commonT('search')+'...'}
                    autoComplete="off"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getTags(true) 
                      }
                    }}
                    onKeyPress={handleKeyPress}
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
                            if (head === "Name") {
                              sortKey = "name";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key === (head === "Name" ? "name" : head.toLowerCase()) && sortConfig.direction === "asc" ? (
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
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name}</p>
                          </td>

                          <td className="flex items-end justify-end gap-x-3 py-3 pl-4 pr-6">
                            <span
                              onClick={() => setAddNewModal({ open: true, data: item, editMode: true })}
                              className="cursor-pointer text-xs font-normal text-secondary underline underline-offset-4 3xl:text-sm"
                            >
                              Edit
                            </span>
                            <span
                              onClick={() => setOpenDeleteModal({ open: true, data: item })}
                              className="cursor-pointer text-xs font-normal text-red-500 underline underline-offset-4 3xl:text-sm"
                            >
                              Delete
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
      <AddTags
        data={addNewModal.data}
        isOpen={addNewModal.open}
        refreshData={getTags}
        setIsOpen={(open) => setAddNewModal((prev) => ({ ...prev, open }))}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteTags}
        message="Are you sure you want to delete this Tag?"
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Tags;
