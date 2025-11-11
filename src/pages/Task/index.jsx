import moment from "moment";
import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import AddTaskModal from "./AddTaskModal";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { Images } from "../../assets/Assets";
import { TASK_PRINT } from "../../routes/Names";
import { useMediaQuery } from "react-responsive";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { useEffect, Fragment, useState } from "react";
import { useSortableData } from "../../hooks/useSortableData";
import { useThemeContext } from "../../context/GlobalContext";
import RangePicker from "../../components/common/RangePicker";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { Menu } from "@headlessui/react";
const statuses = ["pending", "completed"];
const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};

const Tasks = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [
    t("tasks.priority"),
    t("tasks.title"),
    t("tasks.dueDate"),
    t("tasks.updatedOn"),
    t("tasks.status"),
    t("tasks.assignedBy"),
    t("tasks.tags"),
    t("headings.actions"),
  ];
  const TABLE_HEAD_DELEGATED = [
    t("tasks.priority"),
    t("tasks.title"),
    t("tasks.dueDate"),
    t("tasks.updatedOn"),
    t("tasks.status"),
    t("tasks.assignedTo"),
    t("tasks.tags"),
    t("headings.actions"),
  ];
  const TABLE_HEAD_OTHERS = [
    t("tasks.priority"),
    t("tasks.title"),
    t("tasks.dueDate"),
    t("tasks.updatedOn"),
    t("tasks.status"),
    t("tasks.assignedBy"),
    t("tasks.assignedTo"),
    t("tasks.tags"),
    t("headings.actions"),
  ];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, userData } = useThemeContext();

  // Use States
  const [activeTab, setActiveTab] = useState(2);
  const [searchText, setSearchText] = useState("");

  // Data
  const [allTasks, setAllTasks] = useState([]);
  const [allOthersTasks, setAllOthersTasks] = useState([]);
  const [allDelegateTasks, setAllDelegateTasks] = useState([]);

  // Pagination
  const [totalPagesMyTask, setTotalPagesMyTask] = useState(0);
  const [totalPagesOthers, setTotalPagesOthers] = useState(0);
  const [currentPageMyTask, setCurrentPageMyTask] = useState(1);
  const [currentPageOthers, setCurrentPageOthers] = useState(1);
  const [totalPagesDelighted, setTotalPagesDelighted] = useState(0);
  const [currentPageDelighted, setCurrentPageDelighted] = useState(1);

  // Date
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  // Modal
  const [modalData, setModalData] = useState(null);
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [openStatusModal, setOpenStatusModal] = useState({ open: false, id: null, status: "" });

  // Active Tab
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allTasks);
  const { items: othersTasksItems, requestSort: othersTasksRequestSort, sortConfig: othersTasksSortConfig } = useSortableData(allOthersTasks);
  const { items: delegateTasksItems, requestSort: delegateTasksRequestSort, sortConfig: delegateTasksSortConfig } = useSortableData(allDelegateTasks);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Get My Tasks
  const getTasks = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        type: "my",
        search: emptySearch ? "" : searchText,
        page: currentPageMyTask,
        records_no: itemsPerPage,
        start_date: dateRange?.startDate ? dateRange?.startDate : null,
        end_date: dateRange?.endDate ? dateRange?.endDate : null,
        event_id: eventSelect,
      };

      const res = await ApiServices.tasks.getTasks(payload);
      const { data, message } = res;
      //

      if (data.code === 200) {
        setAllTasks(data.data.data);
        setCurrentPageMyTask(data?.data?.current_page);
        setTotalPagesMyTask(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Get Delegate Tasks
  const getDelegateTasks = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        type: "delegate",
        search: emptySearch ? "" : searchText,
        records_no: itemsPerPage,
        page: currentPageDelighted,
        start_date: dateRange?.startDate ? dateRange?.startDate : null,
        end_date: dateRange?.endDate ? dateRange?.endDate : null,
        event_id: eventSelect,
      };

      const res = await ApiServices.tasks.getTasks(payload);
      const { data, message } = res;
      //

      if (data.code === 200) {
        setAllDelegateTasks(data.data.data);
        setCurrentPageDelighted(data?.data?.current_page);
        setTotalPagesDelighted(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Get Others Tasks
  const getOthersTasks = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPageOthers,
        records_no: itemsPerPage,
        start_date: dateRange?.startDate ? dateRange?.startDate : null,
        end_date: dateRange?.endDate ? dateRange?.endDate : null,
        event_id: eventSelect,
      };

      const res = await ApiServices.tasks.getTasks(payload);
      const { data, message } = res;
      //

      if (data.code === 200) {
        setAllOthersTasks(data.data.data);
        setCurrentPageOthers(data?.data?.current_page);
        setTotalPagesOthers(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Refresh Data
  const refreshData = async () => {
    await getTasks();
    await getDelegateTasks();
    await getOthersTasks();
  };

  // Delete Task
  const handleDeleteTask = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.tasks.deleteTask(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        refreshData();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("messages.success"),
          message: t("tasks.taskDeleteSuccess"),
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

  const handleUpdateTaskStatus = async ()=>{
    try {
      setBtnLoading(true);
      let payload = {
        status: openStatusModal.status
      };
      const res = await ApiServices.tasks.updateTaskStatus(openStatusModal?.id, payload);
      const { data, message } = res;

      if (data.code === 200) {
        refreshData();
        setOpenStatusModal({ open: false, id: null, status: '' });
        openSuccessModal({
          title: t("messages.success"),
          message: "Your task status has been updated successfully",
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
  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPageMyTask(selected + 1);
  };

  const handlePageChangeDelighted = ({ selected }) => {
    setCurrentPageDelighted(selected + 1);
  };

  const handlePageChangeOthers = ({ selected }) => {
    setCurrentPageOthers(selected + 1);
  };

  // Use Effects
  useEffect(() => {
    if (searchText?.length > 1 || searchText?.length === 0) {
      activeTab === 0 ? getTasks() : activeTab === 1 ? getDelegateTasks() : getOthersTasks();
    }
  }, [searchText, activeTab]);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        activeTab === 0 ? getTasks(false) : activeTab === 1 ? getDelegateTasks(false) : getOthersTasks(false);
        setCurrentPageMyTask(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getTasks();
  //     getDelegateTasks();
  //     getOthersTasks();
  //   }
  // }, [searchText]);

  // useEffect(() => {
  //   getTasks();
  // }, [currentPageMyTask, dateRange]);

  // useEffect(() => {
  //   getDelegateTasks();
  // }, [currentPageDelighted, dateRange]);

  useEffect(() => {
    getOthersTasks();
  }, [currentPageOthers, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        {/* <div className="flex gap-x-3 3xl:gap-x-6">
          <div
            className={`flex cursor-pointer  items-start justify-start space-x-2 rounded-10 px-6 py-2.5 transition duration-200 ease-in-out md:items-center md:justify-center 3xl:px-8 ${
              activeTab === 0 ? "shadow-tab bg-primary" : "bg-transparent"
            } `}
            onClick={() => handleTabClick(0)}
          >
            {t("tasks.myTask")}
          </div>
          <div
            className={`flex cursor-pointer  items-start justify-start space-x-2 rounded-10 px-6 py-2.5 transition duration-200 ease-in-out md:items-center md:justify-center 3xl:px-8 ${
              activeTab === 1 ? "shadow-tab bg-primary" : "bg-transparent"
            } `}
            onClick={() => handleTabClick(1)}
          >
            {t("tasks.delegated")}
          </div>
          <div
            className={`flex cursor-pointer  items-start justify-start space-x-2 rounded-10 px-6 py-2.5 transition duration-200 ease-in-out md:items-center md:justify-center 3xl:px-8 ${
              activeTab === 2 ? "shadow-tab bg-primary" : "bg-transparent"
            } `}
            onClick={() => handleTabClick(2)}
          >
            {t("tasks.others")}
          </div>
        </div> */}
        <h2 className="text-xl font-medium">All Tasks</h2>
        <div className="flex items-center gap-x-3">
          <Link to={TASK_PRINT}>
            <Button title={t("buttons.print")} buttonColor="border-primary bg-primary" />
          </Link>
          {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "tasks-create")) && (
            <Button title={t("tasks.addTask")} onClick={() => setAddNewModal(true)} />
          )}
          {/* <RangePicker setRangePicker={setDateRange} refreshData={refreshData} /> */}
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
                  activeTab === 0 ? getTasks(true) : activeTab === 1 ? getDelegateTasks(true) : getOthersTasks(true);
                }
              }}
              onKeyPress={handleSearch}
              className="focus:border-primary-color-100 block h-11 w-48 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
            />
          </div>
        </div>
      </div>

      {/*      
      {activeTab === 0 && (
        <div className="card h-[71vh] 3xl:h-[77vh]">
          <div>
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
                          if (head === "Due Date") {
                            sortKey = "end_date";
                          } else if (head === "Updated On") {
                            sortKey = "updated_at_unix";
                          } else if (head === "Assigned By") {
                            sortKey = "assign_by";
                          } else {
                            sortKey = head.toLowerCase();
                          }
                          requestSort(sortKey);
                        }}
                      >
                        <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                          {head}
                          {sortConfig.key ===
                            (head === "Due Date"
                              ? "end_date"
                              : head === "Updated On"
                                ? "updated_at_unix"
                                : head === "Assigned By"
                                  ? "assign_by"
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
                      <td colSpan="8">
                        <Skeleton count={itemsPerPage} height={50} />
                      </td>
                    </tr>
                  ) : items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={item?.id} className="even:bg-gray-100" onClick={() => handleRowClick(item?.id)}>
                        <td className="py-3 pl-6 pr-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.priority}</p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.title || "-"}</p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {" "}
                            {moment.unix(item?.end_date).format("D MMM YYYY") || "-"}
                          </p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {moment.unix(item?.start_date).format("D MMM YYYY") || "-"}
                          </p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <Badge title={item?.status} />
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {`${item?.assign_by?.first_name} ${item?.assign_by?.last_name}` || "-"}
                          </p>
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          {item?.tags.length > 0
                            ? item?.tags.map((tag, index) => (
                                <span key={index}>
                                  <Badge title={tag} />
                                </span>
                              ))
                            : "No Tags"}
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <div className="flex items-center gap-x-3">
                            {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "tasks-edit")) && (
                              <span
                                onClick={() => {
                                  setAddNewModal(true);
                                  setModalData(item);
                                }}
                                className="cursor-pointer text-xs font-normal text-secondary underline underline-offset-4 3xl:text-sm"
                              >
                                {t("buttons.edit")}
                              </span>
                            )}

                            {(userData?.role?.display_name === "web_admin" || userData.role.permissions?.some((item) => item === "tasks-delete")) && (
                              <span
                                onClick={() => setOpenDeleteModal({ open: true, data: item })}
                                className="cursor-pointer text-xs font-normal text-red-500 underline underline-offset-4 3xl:text-sm"
                              >
                                {t("buttons.delete")}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Render "No Data" message
                    <tr className="h-[400px]">
                      <td colSpan="8">
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
                pageCount={totalPagesMyTask}
                pageClassName="item pagination-page"
                forcePage={currentPageMyTask - 1}
                onPageChange={handlePageChange}
                nextLabel={<ChevronRightIcon className="h-5 w-5" />}
                previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      )}

   
      {activeTab === 1 && (
        <div className="card h-[71vh] 3xl:h-[77vh]">
          <div>
            <div className="-mx-6 mb-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD_DELEGATED.map((head) => (
                      <th
                        key={head}
                        className="border-b border-gray-100 bg-white p-4 first:pl-6"
                        onClick={() => {
                          let sortKey;
                          if (head === "Due Date") {
                            sortKey = "end_date";
                          } else if (head === "Updated On") {
                            sortKey = "updated_at_unix";
                          } else if (head === "Assigned To") {
                            sortKey = "assign_to";
                          } else {
                            sortKey = head.toLowerCase();
                          }
                          delegateTasksRequestSort(sortKey);
                        }}
                      >
                        <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                          {head}
                          {delegateTasksSortConfig.key ===
                            (head === "Due Date"
                              ? "end_date"
                              : head === "Updated On"
                                ? "updated_at_unix"
                                : head === "Assigned To"
                                  ? "assign_to"
                                  : head.toLowerCase()) && delegateTasksSortConfig.direction === "asc" ? (
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
                      <td colSpan="8">
                        <Skeleton count={itemsPerPage} height={50} />
                      </td>
                    </tr>
                  ) : delegateTasksItems.length > 0 ? (
                    delegateTasksItems.map((item, index) => (
                      <tr key={item?.id} className="even:bg-gray-100" onClick={() => handleRowClick(item?.id)}>
                        <td className="py-3 pl-6 pr-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.priority}</p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.title || "-"}</p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {" "}
                              {moment.unix(item?.end_date).format("D MMM YYYY") || "-"}
                            </p>
                          </p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {moment.unix(item?.start_date).format("D MMM YYYY") || "-"}
                          </p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <Badge title={item?.status} />
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {`${item?.to?.first_name} ${item?.assign_to?.last_name}` || "-"}
                          </p>
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          {item?.tags.length > 0
                            ? item?.tags.map((tag, index) => (
                                <span key={index}>
                                  <Badge title={tag} />
                                </span>
                              ))
                            : "No Tags"}
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <div className="flex items-center gap-x-3">
                            <span
                              onClick={() => {
                                setAddNewModal(true);
                                setModalData(item);
                              }}
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
                      <td colSpan="8">
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
                pageCount={totalPagesDelighted}
                pageClassName="item pagination-page"
                forcePage={currentPageDelighted - 1}
                onPageChange={handlePageChangeDelighted}
                nextLabel={<ChevronRightIcon className="h-5 w-5" />}
                previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      )} */}

      {/* My Tasks */}
      {activeTab === 2 && (
        <>
          <div className="card h-[71vh] 3xl:h-[77vh]">
            <div className="-mx-6 mb-8 h-full overflow-x-auto">
              <table className="w-full text-left ">
                <thead>
                  <tr>
                    {TABLE_HEAD_OTHERS.map((head) => (
                      <th
                        key={head}
                        className="border-b border-gray-100 bg-white p-4 first:pl-6"
                        onClick={() => {
                          let sortKey;
                          if (head === "Due Date") {
                            sortKey = "end_date";
                          } else if (head === "Updated On") {
                            sortKey = "updated_at_unix";
                          } else if (head === "Assigned By") {
                            sortKey = "assign_by";
                          } else if (head === "Assigned To") {
                            sortKey = "assign_to";
                          } else {
                            sortKey = head.toLowerCase();
                          }
                          othersTasksRequestSort(sortKey);
                        }}
                      >
                        <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                          {head}
                          {othersTasksSortConfig.key ===
                            (head === "Due Date"
                              ? "end_date"
                              : head === "Updated On"
                                ? "updated_at_unix"
                                : head === "Assigned By"
                                  ? "assign_by"
                                  : head === "Assigned To"
                                    ? "assign_to"
                                    : head.toLowerCase()) && othersTasksSortConfig.direction === "asc" ? (
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
                      <td colSpan="9">
                        <Skeleton count={itemsPerPage} height={50} />
                      </td>
                    </tr>
                  ) : othersTasksItems.length > 0 ? (
                    othersTasksItems.map((item, index) => (
                      <tr key={item?.id} className="relative even:bg-gray-100" onClick={() => handleRowClick(item?.id)}>
                        <td className="py-3 pl-6 pr-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.priority}</p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.title || "-"}</p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {" "}
                              {moment.unix(item?.end_date).format("D MMM YYYY") || "-"}
                            </p>
                          </p>
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {moment.unix(item?.start_date).format("D MMM YYYY") || "-"}
                          </p>
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          {/* <Badge title={item?.status} /> */}
                          <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="cursor-pointer">
                              <Badge title={item?.status} showIcon />
                            </Menu.Button>

                            <Menu.Items className="absolute z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {statuses
                                .filter((status) => status !== item?.status)
                                .map((status) => (
                                  <Menu.Item key={status} as={Fragment}>
                                    {({ active }) => (
                                      <button
                                        onClick={() => setOpenStatusModal({ open: true, id: item?.id, status })}
                                        className={`${
                                          active ? "bg-gray-100" : "bg-white"
                                        } ${statusStyles[status]} my-2 block w-full px-4 py-2 text-left`}
                                      >
                                        {status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                                      </button>
                                    )}
                                  </Menu.Item>
                                ))}
                            </Menu.Items>
                          </Menu>
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {`${item?.assign_by?.first_name} ${item?.assign_by?.last_name}` || "-"}
                          </p>
                        </td>

                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {`${item?.assign_to?.first_name} ${item?.assign_to?.last_name}` || "-"}
                          </p>
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          {item?.tags.length > 0
                            ? item?.tags.map((tag, index) => (
                                <span key={index}>
                                  <Badge title={tag} />
                                </span>
                              ))
                            : "No Tags"}
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <div className="flex items-center gap-x-3">
                            <span
                              onClick={() => {
                                setAddNewModal(true);
                                setModalData(item);
                              }}
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
                      <td colSpan="9">
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
                pageCount={totalPagesOthers}
                pageClassName="item pagination-page"
                forcePage={currentPageOthers - 1}
                onPageChange={handlePageChangeOthers}
                nextLabel={<ChevronRightIcon className="h-5 w-5" />}
                previousLabel={<ChevronLeftIcon className="h-5 w-5" />}
              />
            </div>
          </div>
          {/* <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-8">
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="card h-[77vh]">
              {loading ? (
                <Skeleton count={10} height={50} />
              ) : activeRow ? (
                <>
                  <div className="flex justify-between">
                    <h3 className="heading">Details</h3>
                    <div className="flex gap-x-3 items-center">
                      <button
                        className="text-sm font-medium border-b border-secondary text-secondary"
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
                        className="text-sm font-medium text-red-500 border-b border-red-500"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8 3xl:mr-0">
                    <div>
                      <h2 className="mb-5 sub-heading">{commonT('headings.basicInfo')}</h2>
                      <div className="grid grid-cols-2 gap-5 3xl:grid-cols-3">
                        <TitleValue title="Title" value={detail?.title || "-"} />
                        <TitleValue title="Priority" value={detail?.priority || "-"} />
                        <TitleValue title="Start Date" value={moment.unix(detail?.start_date).format("D MMM YYYY") || "-"} />
                        <TitleValue title="End Date" value={moment.unix(detail?.end_date).format("D MMM YYYY") || "-"} />
                     
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="mb-5 sub-heading">Tags</h2>
                      {detail?.tags.length > 0
                        ? detail?.tags.map((tag, index) => (
                            <span key={index}>
                              <Badge title={tag} />
                            </span>
                          ))
                        : "No Tags"}
                    </div>
                    <div>
                      <h2 className="mb-5 sub-heading">{commonT('headings.otherInfo')}</h2>
                      <TitleValue title={commonT('note')} value={detail?.description || "-"} />
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
        </div> */}
        </>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        data={modalData}
        allTasks={allTasks}
        isOpen={addNewModal}
        refreshData={refreshData}
        setModalData={setModalData}
        setIsOpen={() => setAddNewModal(false)}
      />

      {/* Delete */}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteTask}
        message={t("tasks.taskDeleteConf")}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />

      <ConfirmationModal
        data={openStatusModal.data}
        isOpen={openStatusModal.open}
        handleSubmit={handleUpdateTaskStatus}
        message="Are you sure you want to update the status of this task?"
        setIsOpen={(open) => setOpenStatusModal((prev) => ({ ...prev, open }))}
      />
    </div>
  );
};

export default Tasks;
