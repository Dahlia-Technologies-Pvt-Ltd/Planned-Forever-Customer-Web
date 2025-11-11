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

// Table Head

const UsersType = () => {
  const { t } = useTranslation("common");

  const navigate = useNavigate();

  const TABLE_HEAD = [t("userType.sr"), t("userType.name"), t("headings.actions")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, setErrorMessage } = useThemeContext();
  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [permissions, setPermissions] = useState([
    {
      name: "Dashboard",
      permission: { View: false },
    },
    {
      name: "Venues",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Ceremonies",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Menu",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Contacts",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Invitees",
      permission: { View: false },
    },
    {
      name: "Rsvp",
      permission: { View: false },
    },
    {
      name: "Gifts",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Gift Allocation",
      permission: { View: false },
    },
    {
      name: "Received Gifts",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Invitation Cards",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Card Allocation",
      permission: { View: false },
    },
    {
      name: "Card Schedule",
      permission: { View: false },
    },
    {
      name: "Samagri",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Vendors",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Arrivals",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Departures",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Hotels",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Hotel Rooms",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Allocated Rooms",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Cars",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Car Allocation",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Guest Flights",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Guest Trains",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Send SMS",
      permission: { View: false },
    },
    {
      name: "Schedule/Send SMS",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Send Email",
      permission: { View: false },
    },
    {
      name: "Greetings",
      permission: { View: false },
    },
    {
      name: "Budget",
      permission: { View: false },
    },
    {
      name: "Calendar",
      permission: { View: false },
    },
    {
      name: "Tasks",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Quick Contact",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "User Type",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "Users",
      permission: { View: false, Create: false, Edit: false, Delete: false },
    },
    {
      name: "My Profile",
      permission: { View: false },
    },
    {
      name: "Reports",
      permission: { View: false },
    },
    {
      name: "Export Data",
      permission: { View: false },
    },
    {
      name: "Service Requests",
      permission: { View: false },
    },
    // {
    //   name: "Nearby Attractions",
    //   permission: { View: false, Create: false, Edit: false, Delete: false },
    // },

    {
      name: "Live Event",
      permission: { View: false },
    },
    {
      name: "Panchang Caldendar",
      permission: { View: false },
    },

    {
      name: "Ticket Manager",
      permission: { View: false },
    },
  ]);
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
        // Transform backend permissions into a structured object
        const transformedPermissions = selectedUser.permissions.reduce((acc, item) => {
          const [module, action] = item.name.split("-"); // Split "gifts-view" -> ["gifts", "view"]

          const moduleKey = module.charAt(0).toUpperCase() + module.slice(1); // Capitalize "gifts" -> "Gifts"
          const actionKey = action.charAt(0).toUpperCase() + action.slice(1); // Capitalize "view" -> "View"

          if (!acc[moduleKey]) {
            acc[moduleKey] = {};
          }
          acc[moduleKey][actionKey] = true; // Set permission to true

          return acc;
        }, {});

        // Update state while preserving existing permissions structure
        setPermissions((prevPermissions) =>
          prevPermissions.map((module) => ({
            ...module,
            permission: Object.keys(module.permission).reduce((acc, key) => {
              acc[key] = transformedPermissions[module.name]?.[key] || false; // Set transformed to true, others remain false
              return acc;
            }, {}),
          })),
        );
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

      console.log({ res });

      if (res?.data?.code === 200) {
        setLoading(false);
        setAllUserType(res?.data?.data);
        // setCurrentPage(res?.data?.current_page);
        // setTotalPages(Math.ceil(res?.data?.total / res?.data?.per_page));
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
        // Transform backend permissions into a structured object
        const transformedPermissions = detail.permissions.reduce((acc, item) => {
          const parts = item.name.split("-"); // Split all parts
          const action = parts.pop(); // Get last part as action
          const module = parts // Join remaining parts with space and capitalize each word
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          const actionKey = action.charAt(0).toUpperCase() + action.slice(1); // Capitalize action

          if (!acc[module]) {
            acc[module] = {};
          }
          acc[module][actionKey] = true; // Set permission to true

          return acc;
        }, {});

        console.log("Transformed Permissions =>", transformedPermissions);

        // Update state while preserving existing permissions structure
        setPermissions((prevPermissions) =>
          prevPermissions.map((module) => ({
            ...module,
            permission: {
              ...module.permission, // Keep existing structure
              ...(transformedPermissions[module.name] || {}), // Merge backend data (set to true)
            },
          })),
        );
      }
    }
  }, [allUserType]);

  console.log({ allUserType });

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="card col-span-6 min-h-[82vh]">
          <div className="flex justify-between">
            <h3 className="heading">User Type</h3>
            <div className="flex w-full items-center justify-between">
              <Button title={t("userType.addUserType")} href={ADD_USER_TYPE} link />
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                  <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                </div>
                <input
                  type="search"
                  id="search"
                  name="search"
                  placeholder={t("placeholders.search") + "..."}
                  autoComplete="off"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    if (e.target.value.trim() === "") {
                      getUserType(true);
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
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
                          if (head === "Sr #") {
                            sortKey = "name";
                          } else if (head === "Name") {
                            sortKey = "name";
                          } else {
                            sortKey = head.toLowerCase();
                          }
                          requestSort(sortKey);
                        }}
                      >
                        <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                          {head}
                          {sortConfig.key === (head === "Sr #" ? "name" : head === "Name" ? "name" : head.toLowerCase()) &&
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
                        <td className="py-3 pl-6 pr-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{index + 1}</p>
                        </td>
                        <td className="w-2/3 py-3 pl-4 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.display_name}</p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <div className="flex items-center gap-x-3">
                            <span
                              onClick={() => handleEditClick(item)}
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
                          </div>
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
          </div>
          {/* Table End */}
        </div>
        <div className="card col-span-6 -mr-4 max-h-[82vh] space-y-8 overflow-auto pr-4">
          {loading ? (
            <Skeleton count={9} height={50} />
          ) : activeRow ? (
            <>
              <div>
                <h3 className="heading">{t("headings.permissions")}</h3>
                <h2 className="label mb-2 text-left text-secondary">{t("userType.givenPermissions")}</h2>
              </div>
              <div>
                <div className="grid gap-5 md:grid-cols-1 xl:grid-cols-1">
                  <div className="w-full space-y-4">
                    {permissions.map((module, index) => (
                      <div key={index} className={`p-4 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <div className="flex items-center space-x-4">
                          <div className="w-1/3">
                            <span className="text-sm font-medium text-gray-700">{module.name}</span>
                          </div>
                          <div className="flex flex-1 space-x-8">
                            {Object.keys(module.permission).map((perm, permIndex) => (
                              <label key={permIndex} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={module.permission[perm] || false}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-600">{perm}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-[70vh] items-center justify-center">
              <Lottie options={emptyFolderAnimation} width={200} height={200} />
            </div>
          )}
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
