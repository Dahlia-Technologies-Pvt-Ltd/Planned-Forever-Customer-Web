import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import { ADD_USER_TYPE } from "../../routes/Names";
import Button from "../../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { useSortableData } from "../../hooks/useSortableData";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { hasPermission } from "../../utilities/permissions";
import { createUserTypePermissionState, mergePermissionsIntoState } from "../../utilities/userTypePermissions";

// Table Head

const normalizeUserTypeResponse = (data) => {
  if (Array.isArray(data?.data?.data)) {
    return {
      list: data.data.data,
      currentPage: data.data.current_page,
      totalPages: data.data.last_page,
      total: data.data.total,
      perPage: data.data.per_page,
    };
  }

  if (Array.isArray(data?.data)) {
    return {
      list: data.data,
      currentPage: data.current_page,
      totalPages: data.last_page,
      total: data.total,
      perPage: data.per_page,
    };
  }

  if (Array.isArray(data?.roles)) {
    return {
      list: data.roles,
      currentPage: data.current_page,
      totalPages: data.last_page,
      total: data.total,
      perPage: data.per_page,
    };
  }

  return { list: [], currentPage: 1, totalPages: 0, total: 0, perPage: 0 };
};

const UsersType = () => {
  const { t } = useTranslation("common");

  const navigate = useNavigate();

  const TABLE_HEAD = [
    { label: t("userType.sr"), sortKey: "name" },
    { label: t("userType.name"), sortKey: "display_name" },
    { label: t("headings.actions"), sortKey: "actions" },
  ];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, setErrorMessage, userData } = useThemeContext();
  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [permissions, setPermissions] = useState(createUserTypePermissionState);
  // Data
  const [allUserType, setAllUserType] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  // Table Sorting

  // const detail = allUserType?.find((item) => item?.id === (activeRow || allUserType[0]?.id));
  // //

  const { items, requestSort, sortConfig } = useSortableData(allUserType);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleEditClick = (data) => {
    // Navigate to the edit screen, passing the data as state
    navigate("/add-user-type", { state: { data } });
  };

  // Active Row
  const handleRowClick = (id) => {
    if (id !== activeRow) {
      setActiveRow(id); // Update active row

      // Find the selected user type's details
      const selectedUser = allUserType.find((user) => user?.id === id);

      if (selectedUser?.permissions) {
        setPermissions((prevPermissions) => mergePermissionsIntoState(prevPermissions, selectedUser.permissions));
      }
    }
  };

  // get all user type
  const getUserType = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.userType.GetAllUserType(payload);

      if (res?.data?.code === 200) {
        const { list, totalPages: pageCount, total, perPage } = normalizeUserTypeResponse(res.data);

        setAllUserType(list);
        setTotalPages(pageCount || (total && perPage ? Math.ceil(total / perPage) : 0));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete User type
  const handleDeleteUserType = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.userType.deleteUserType(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        getUserType();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("messages.success"),
          message: message || t("userType.userTypeDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getUserType(false);
        setCurrentPage(1);
      }
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getUserType();
  }, [currentPage]);

  useEffect(() => {
    if (allUserType?.length > 0) {
      const detail = allUserType.find((item) => item?.id === (activeRow || allUserType[0]?.id));

      if (detail?.permissions) {
        setPermissions((prevPermissions) => mergePermissionsIntoState(prevPermissions, detail.permissions));
      }
    }
  }, [allUserType]);

  return (
    <>
      <div className="venues-page-layout grid grid-cols-12 items-start gap-5 lg:items-stretch">
        <div className="col-span-12 lg:col-span-8">
          <div className="venues-list-card card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)]">
            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-4">
                <h2 className="shrink-0 text-xl font-semibold text-black">User Type</h2>
                <div className="relative ml-auto flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="search"
                    id="search"
                    name="search"
                    placeholder={`${t("placeholders.search")}...`}
                    autoComplete="off"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getUserType(true);
                      }
                    }}
                    onKeyDown={handleKeyPress}
                    className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                  />
                </div>
              </div>

              <div className="mt-4 flex w-full items-center justify-between gap-4">
                <div className="ml-auto flex items-center gap-3">
                  {hasPermission(userData, "user-type-create") && <Button title={t("userType.addUserType")} href={ADD_USER_TYPE} link />}
                </div>
              </div>
            </div>

            <div className="mt-5 flex min-h-0 flex-1 flex-col">
              <div className="-mx-6 mb-8 flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {TABLE_HEAD.map((head) => (
                        <th
                          key={head.sortKey}
                          className="border-b border-gray-100 bg-white p-4 first:pl-6"
                          onClick={() => {
                            if (head.sortKey !== "actions") {
                              requestSort(head.sortKey);
                            }
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-sm font-semibold leading-5 3xl:text-sm">
                            {head.label}
                            {sortConfig.key === head.sortKey && sortConfig.direction === "asc" ? (
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
                        <td colSpan="3">
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
                            <p className="text-primary-color-200 text-sm font-normal 3xl:text-sm">{(currentPage - 1) * itemsPerPage + index + 1}</p>
                          </td>
                          <td className="w-2/3 py-3 pl-4 3xl:px-4">
                            <p className="text-primary-color-200 text-sm font-normal 3xl:text-sm">{item?.display_name || "-"}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <div className="flex items-center gap-x-3">
                              {hasPermission(userData, "user-type-edit") && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleEditClick(item);
                                  }}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-secondary underline underline-offset-4"
                                >
                                  {t("buttons.edit")}
                                </button>
                              )}

                              {hasPermission(userData, "user-type-delete") && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenDeleteModal({ open: true, data: item });
                                  }}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-red-500 underline underline-offset-4"
                                >
                                  {t("buttons.delete")}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="h-full">
                        <td colSpan="3">
                          <div className="flex min-h-[52vh] flex-col items-center justify-center px-4 text-center">
                            <Lottie options={emptyFolderAnimation} width={170} height={170} />
                            <h4 className="-mt-4 text-base font-semibold text-primary-color">No User Type Added</h4>
                            <p className="mt-2 max-w-xs text-sm leading-5 text-primary-light-color">Add a user type to manage menu access.</p>
                            {hasPermission(userData, "user-type-create") && (
                              <Link to={ADD_USER_TYPE} className="mt-5">
                                <Button title={t("userType.addUserType")} />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {items.length > 0 && totalPages > 1 && (
                <div className="absolute bottom-4">
                  <ReactPaginate
                    breakLabel="..."
                    pageRangeDisplayed={5}
                    marginPagesDisplayed={2}
                    activeClassName="active"
                    nextClassName="item next"
                    renderOnZeroPageCount={null}
                    breakClassName="item break-me"
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
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="venues-details-card card flex h-[72vh] flex-col overflow-hidden shadow-[0_12px_34px_rgba(15,23,42,0.14)] lg:sticky lg:top-0">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : activeRow ? (
              <div className="-mx-1 -my-1 flex min-h-0 flex-1 flex-col px-1 py-1">
                <div className="shrink-0">
                  <h2 className="text-xl font-semibold text-black">{t("headings.permissions")}</h2>
                  <p className="mt-2 text-sm text-gray-600">{t("userType.givenPermissions")}</p>
                </div>

                <div className="venue-details-scroll -mr-2 mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
                  <div className="space-y-3">
                    {permissions.map((module, index) => (
                      <div key={module.base || module.name} className={`rounded-lg px-4 py-4 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                          <span className="min-w-0 break-words text-sm font-semibold text-black">{module.name}</span>
                          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
                            {Object.keys(module.permission).map((perm) => (
                              <label key={perm} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={module.permission[perm] || false}
                                  readOnly
                                  disabled
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-100"
                                />
                                <span>{perm}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div className="flex h-full max-w-xs flex-col items-center justify-center">
                  <Lottie options={emptyFolderAnimation} width={170} height={170} />
                  <h4 className="-mt-4 text-base font-semibold text-primary-color">No User Type Selected</h4>
                  <p className="mt-2 text-sm leading-5 text-primary-light-color">Select a user type to view permissions.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteUserType}
        message={t("userType.userTypeDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default UsersType;
