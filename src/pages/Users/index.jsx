import Lottie from "react-lottie";
import AddUserModal from "./AddUserModal";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import TitleValue from "../../components/common/TitleValue";
import { useSortableData } from "../../hooks/useSortableData";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";
import { mediaUrl } from "../../utilities/config";
import { Images } from "../../assets/Assets";
import { useTranslation } from "react-i18next";
import ImportUserModal from "./ImportUserModal";

const Users = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [t("users.name"), t("users.email"), t("users.userType"), t("users.status")];

  // Context
  const { eventSelect, openSuccessModal, closeSuccessModel, setBtnLoading, setErrorMessage, userData } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allUsers, setAllUsers] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Detail of selected row
  const detail = allUsers?.find((item) => item?.uuid === (activeRow || allUsers[0]?.uuid));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allUsers);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 9 : isLaptopMedium ? 7 : isLaptop ? 6 : 9;

  // Delete Event
  const handleDeleteUser = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.users.deleteUser(openDeleteModal?.data?.uuid);
      const { data, message } = res;

      if (data.code === 200) {
        getUsersListing();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("users.userDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      console.log({ aaaaaaaaaaaa: err });
      setErrorMessage(err?.response?.data?.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // get all cars
  const getUsersListing = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.users.GetAllUsers(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllUsers(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Use Effects
  // useEffect(() => {
  //   if (searchText?.length > 1 || searchText?.length === 0) {
  //     getUsersListing();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getUsersListing(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === '') {
  //     getUsersListing();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.uuid);
  }, [items]);

  useEffect(() => {
    getUsersListing();
  }, [currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Users</h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "users-create")) && (
                  <Button title={t("users.addUser")} onClick={() => setAddNewModal(true)} />
                )}
                <Button title="Import Excel" buttonColor="bg-purple-600" onClick={() => setImportModalOpen(true)} />
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
                        getUsersListing(true);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    className="focus:border-primary-color-100 block h-11 w-full rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
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
                            if (head === " Name") {
                              sortKey = "first_name";
                            } else if (head === "Email") {
                              sortKey = "email";
                            } else if (head === "User Type") {
                              sortKey = "role.name";
                            } else if (head === "Status") sortKey = "status";
                            else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === " Name"
                                ? "first_name"
                                : head === "Email"
                                  ? "email"
                                  : head === "User Type"
                                    ? "role.name"
                                    : head === "Status"
                                      ? "status"
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
                          key={item?.uuid}
                          className={`cursor-pointer ${item?.uuid === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                          onClick={() => handleRowClick(item?.uuid)}
                        >
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-primary-color-200 flex items-center gap-x-3 text-xs font-normal 3xl:text-sm">
                              <img
                                className="h-9 w-9 rounded-full object-cover"
                                src={item?.profile_image ? mediaUrl + item?.profile_image : Images.PLACEHOLDER}
                                alt="profile_img"
                              />
                              <span>{item?.salutation + " " + item?.first_name + " " + item?.last_name}</span>
                            </p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.email}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.role?.display_name}</p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className={`${item?.status === 1 ? "text-secondary" : "text-red-500"} text-xs font-normal 3xl:text-sm`}>
                              {item?.status === 1 ? "Active" : "Inactive"}
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
                      <h2 className="sub-heading">{t("headings.basicInfo")}</h2>
                      <div className="flex justify-between">
                        <h3 className="heading">Details</h3>
                        <div className="flex items-center gap-x-3">
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "users-edit")) && (
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
                          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "users-delete")) && (
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
                    </div>
                    <div className="my-5">
                      {detail?.profile_image !== null && (
                        <div>
                          <h3 className="mb-2 text-xs text-info-color">{t("users.profileImage")}</h3>
                          <div className="h-full w-full">
                            <img src={mediaUrl + detail?.profile_image} alt="image" className="h-20 w-20 rounded-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-between gap-5">
                      <TitleValue title={t("users.salutation")} value={detail?.salutation || "-"} />
                      <TitleValue title={t("users.firstName")} value={detail?.first_name || "-"} />
                      <TitleValue title={t("users.lastName")} value={detail?.last_name || "-"} />
                      <TitleValue title={t("users.emailAddress")} value={detail?.email || "-"} />
                    </div>
                  </div>
                  <div className="mt-6">
                    <h2 className="sub-heading mb-5">{t("users.settings")}</h2>
                    <div className="flex flex-wrap justify-between gap-5">
                      <TitleValue title={t("users.userType")} value={detail?.role?.display_name || "-"} />
                      <TitleValue title={t("users.date")} value={getLocalDateFromUnixTimestamp(detail?.created_at_unix, "DD MMM, YYYY")} />
                      <TitleValue title={t("users.status")} value={detail?.status === 1 ? "Active" : "Inactive" || "-"} />
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

      <AddUserModal
        isOpen={addNewModal}
        setIsOpen={() => setAddNewModal(false)}
        refreshData={getUsersListing}
        setModalData={setModalData}
        data={modalData}
      />
      <ImportUserModal isOpen={importModalOpen} setIsOpen={setImportModalOpen} refreshData={getUsersListing} />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteUser}
        message={t("users.userDeleteSuccess")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Users;
