import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import AddQuickContactModal from "./AddQuickContactModal";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const QuickContact = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("quickContact.name"), t("headings.actions")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, userData } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allQuickContact, setAllQuickContact] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allQuickContact);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // Delete quick Contact
  const handleDeleteQuickContact = async () => {
    try {
      setBtnLoading(true);

      let payload = {
        mode: "remove",
        user_ids: [openDeleteModal?.data?.uuid],
      };
      const response = await ApiServices.quickContact.deleteQuickContact(payload);
      if (response.data.code === 200) {
        setBtnLoading(false);
        getContacts();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("quickContact.quickContactDeleteSuccess"),
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

  const getContacts = (emptySearch) => {
    let payload = {
      search: emptySearch ? "" : searchText,
      page: currentPage,
      records_no: itemsPerPage,
      quick_contact: 1,
      event_id: eventSelect,
    };

    setLoading(true);

    ApiServices.contact
      .GetAllContact(payload)
      .then((res) => {
        const { data, message } = res;
        if (data?.code === 200) {
          setLoading(false);
          setAllQuickContact(data.data.data);
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

  // Use Effects
  // useEffect(() => {
  //   if (searchText?.length > 1 || searchText?.length === 0) {
  //     getContacts();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getContacts(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === '') {
  //     getContacts();
  //   }
  // }, [searchText]);

  useEffect(() => {
    getContacts();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Quick Contact</h3>
              <div className="flex w-full items-center justify-between">
                {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "quick-contact-create")) && (
                  <Button title={t("quickContact.addQuickContact")} onClick={() => setAddNewModal(true)} />
                )}
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
                        getContacts(true);
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
                          key={item?.uuid}
                          className={`cursor-pointer ${item?.uuid === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                          onClick={() => handleRowClick(item?.uuid)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.first_name + " " + item?.last_name}
                              {/* {item?.last_name} */}
                            </p>
                          </td>

                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "quick-contact-delete")) && (
                            <td className="flex items-end justify-end px-12 py-3 pl-4">
                              <span
                                onClick={() => setOpenDeleteModal({ open: true, data: item })}
                                className="cursor-pointer text-xs font-normal text-red-500 underline underline-offset-4 3xl:text-sm"
                              >
                                Delete
                              </span>
                            </td>
                          )}
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

      <AddQuickContactModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        refreshData={getContacts}
        setModalData={setModalData}
        data={modalData}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteQuickContact}
        message={t("quickContact.quickContactDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default QuickContact;
