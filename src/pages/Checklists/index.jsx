import Lottie from "react-lottie";
import ApiServices from "../../api/services";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Button from "../../components/common/Button";
import { useMediaQuery } from "react-responsive";
import TitleValue from "../../components/common/TitleValue";
import { useSortableData } from "../../hooks/useSortableData";
import { useThemeContext } from "../../context/GlobalContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import AddChecklistModal from "./AddChecklistModal";
import Dropdown from "../../components/common/Dropdown";
import { Switch } from "@headlessui/react";
import { useTranslation } from "react-i18next";

// Table Head
const TABLE_HEAD = ["Title", "Short Description", "Status"];

const Checklists = () => {

  const { t: commonT } = useTranslation("common");

  // Context
  const { eventSelect,loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, getEventList, allEvents } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [event, setEvent] = useState(null);
  const [enabled, setEnabled] = useState(false);
  // Data
  const [allCheckList, setAllCheckList] = useState([]);
  // const [status, setStatus] = useState(null);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [openStatusModal, setOpenStatusModal] = useState({ open: false, data: null });

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Detail of selected row
  const detail = allCheckList?.find((item) => item?.id === (activeRow || allCheckList[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allCheckList);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // get all checklist
  const getChecklist = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.checklist.GetAllChecklist(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllCheckList(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (detail?.id) {
      try {
        setBtnLoading(true);

        let payload = {
          ids: [detail.id],
        };

        const res = await ApiServices.checklist.updateChecklistStatus(payload);
        const { data, message } = res;

        if (data.code === 200) {
          setBtnLoading(false);
          getChecklist();
          setOpenStatusModal({ open: false, data: null });
          openSuccessModal({
            title: "Success!",
            message: "Checklist status has been updated successfully",
            onClickDone: (close) => {
              closeSuccessModel();
            },
          });
        }
      } catch (err) {
      } finally {
        setBtnLoading(false);
      }
    }
  };

  // Delete Checklist
  const handleDeleteCheckList = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.checklist.deleteChecklist(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getChecklist();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: " Checklist has been deleted successfully",
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

  // Use Effects
  // useEffect(() => {
  //   if (searchText?.length > 1 || searchText?.length === 0) {
  //     getChecklist();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getChecklist(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === '') {
  //     getChecklist();
  //   }
  // }, [searchText]);

  useEffect(() => {
    if (event) {
      getChecklist();
    }
  }, [event]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getChecklist();
  }, [currentPage]);

  // useEffect(() => {
  //   getEventList();
  // }, []);

  const handleStatusChange = (item) => {
    setOpenStatusModal({ open: true, data: item });
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Checklists</h3>
              <div className="flex w-full items-center justify-between">
                <Button title="Add Checklist" onClick={() => setAddNewModal(true)} />
                <div className="grid grid-cols-2 gap-x-3">
                  {/* <Dropdown
                    placeholder="Events"
                    options={allEvents}
                    value={event}
                    onChange={(e) => {
                      setEvent(e);
                    }}
                    withoutTitle
                    noMargin
                  /> */}
                  <div className="relative  ">
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
                          getChecklist(true);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      className="focus:border-primary-color-100 block h-11 w-full rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                    />
                  </div>
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
                          className="border-b border-gray-100 bg-white p-4 first:pl-6 "
                          onClick={() => {
                            let sortKey;
                            if (head === "Title") {
                              sortKey = "title";
                            } else if (head === "Short Description") {
                              sortKey = "description";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key === (head === "Title" ? "title" : head === "Short Description" ? "description" : head.toLowerCase()) &&
                            sortConfig.direction === "asc" ? (
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
                          <td className="w-48 py-3 pl-6 pr-4 xl:w-56 3xl:w-68">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.title}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.description}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              <Switch
                                checked={item?.status === 1}
                                onChange={() => handleStatusChange(item)}
                                className={`group relative flex h-6 w-12 cursor-pointer rounded-full ${item?.status === 1 ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item?.status === 1 ? "translate-x-6" : "translate-x-0"}`}
                                />
                              </Switch>
                            </p>
                          </td>

                          {/* <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <div className="flex items-center gap-x-3">
                              <span
                                onClick={() => {
                                  setAddNewModal(true);
                                  setModalData(item);
                                }}
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
            ) : items.length > 0 ? (
              <>
                <div className="h-[70vh] overflow-y-auto">
                  <div className="mt-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="sub-heading">{commonT('headings.basicInfo')}</h2>
                      <div className="flex justify-between">
                        <h3 className="heading">Details</h3>
                        <div className="flex items-center gap-x-3">
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
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-between gap-5">
                      <TitleValue title="Title" value={detail?.title || "-"} />
                      <TitleValue title="Short Description" value={detail?.description || "-"} />
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

      <AddChecklistModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        refreshData={getChecklist}
        setModalData={setModalData}
        data={modalData}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteCheckList}
        message="Are you sure you want to delete this Checklist?"
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />

      {/* Status Change Confirmation */}
      <ConfirmationModal
        data={openStatusModal.data}
        isOpen={openStatusModal.open}
        handleSubmit={confirmStatusChange}
        message="Are you sure you want to change the status of this Checklist?"
        setIsOpen={(open) => setOpenStatusModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Checklists;
