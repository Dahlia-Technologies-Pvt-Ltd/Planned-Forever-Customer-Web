import Lottie from "react-lottie";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSortableData } from "../../hooks/useSortableData";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { getLocalDateFromUnixTimestamp } from "../../utilities/HelperFunctions";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from "recharts";
import { ARRIVALS, DEPARTURES, CARS, CEREMONIES, CONTACTS, EVENTS, GIFTS, HOTELS, INVITATION_CARDS, VENDORS, VENUES } from "../../routes/Names";
import {
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GiftIcon,
  IdentificationIcon,
  MapPinIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { t } = useTranslation("common");

  const navigate = useNavigate();
  // Table Head
  const TABLE_HEAD = [
    t("dashboard.table.priority"),
    t("dashboard.table.tasks"),
    t("dashboard.table.assigendBy"),
    t("dashboard.table.startDate"),
    t("dashboard.table.endDate"),
  ];

  // Context
  const { eventSelect, loading, userData } = useThemeContext();

  console.log("userData", userData);
  // use States
  const [statsData, setStatsData] = useState([]);
  const [taskCount, setTaskCount] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);

  // Get Stats
  const getStats = () => {
    setStatsLoading(true);
    ApiServices.dashboard
      .getStats(eventSelect)
      .then(({ data }) => {
        if (data.code === 200) {
          setStatsLoading(false);
          setStatsData(data?.data);
        }
      })
      .catch(({ response }) => {
        setStatsLoading(false);
      });
  };

  const getTaskStatus = () => {
    setStatsLoading(true);
    ApiServices.dashboard
      .getTaskStatus(eventSelect)
      .then(({ data }) => {
        if (data.code === 200) {
          setStatsLoading(false);
          setTaskCount(data?.data);
        }
      })
      .catch(({ response }) => {
        setStatsLoading(false);
      });
  };

  const [pendingTask, setPendingTask] = useState([]);

  const getPendingStatus = () => {
    setStatsLoading(true);
    ApiServices.dashboard
      .getPendingTask(eventSelect)
      .then(({ data }) => {
        if (data.code === 200) {
          setStatsLoading(false);
          setPendingTask(data?.data);
        }
      })
      .catch(({ response }) => {
        setStatsLoading(false);
      });
  };

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(pendingTask);

  useEffect(() => {
    getStats();
    getTaskStatus();
    getPendingStatus();
  }, []);

  // Example API data fetching - replace this with actual API call
  useEffect(() => {
    // Fetch data from API and update the state
    const fetchData = async () => {
      const apiData = {
        pending: 1,
        completed: 1,
        over_due: 5,
      };
      setData(apiData);
    };

    fetchData();
  }, []);

  const totalTasks = taskCount?.pending + taskCount?.completed + taskCount?.over_due;

  // Calculate width percentages for each section
  const completedWidth = totalTasks > 0 ? (taskCount?.completed / totalTasks) * 100 : 0;
  const pendingWidth = totalTasks > 0 ? (taskCount?.pending / totalTasks) * 100 : 0;
  const overDueWidth = totalTasks > 0 ? (taskCount?.over_due / totalTasks) * 100 : 0;

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="card col-span-12 lg:col-span-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium">{t("dashboard.allStatistics")}</h1>
              <p className="mt-1 text-sm text-gray-500">{t("dashboard.statisticsSummary")}</p>
            </div>
          </div>

          {statsLoading ? (
            <div className="mt-12 grid grid-cols-5 gap-3">
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-5 gap-3 3xl:gap-4">
              <Link
                to={
                  userData?.role === "superAdmin"
                    ? VENUES
                    : userData?.role?.permissions?.includes("venues-view")
                      ? VENUES
                      : userData.role?.permissions?.length === 0
                        ? VENUES
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-orange-100 px-2 py-4 transition-all duration-300 hover:border-orange-300 hover:shadow-orange-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-400 3xl:h-10 3xl:w-10">
                  <MapPinIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.venues")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.venue_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? GIFTS
                    : userData?.role?.permissions?.includes("Gifts")
                      ? GIFTS
                      : userData.role?.permissions?.length === 0
                        ? GIFTS
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-blue-100 px-2 py-4 transition-all duration-300 hover:border-blue-300 hover:shadow-gray-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-400 3xl:h-10 3xl:w-10">
                  <GiftIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.gifts")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.gift_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? HOTELS
                    : userData?.role?.permissions?.includes("Hotels")
                      ? HOTELS
                      : userData.role?.permissions?.length === 0
                        ? HOTELS
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-red-100 px-2 py-4 transition-all duration-300 hover:border-red-300 hover:shadow-orange-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-400 3xl:h-10 3xl:w-10">
                  <BuildingOfficeIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.hotels")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.hotel_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? VENDORS
                    : userData?.role?.permissions?.includes("Vendors")
                      ? VENDORS
                      : userData.role?.permissions?.length === 0
                        ? VENDORS
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-green-100 px-2 py-4 transition-all duration-300 hover:border-green-400 hover:shadow-gray-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400 3xl:h-10 3xl:w-10">
                  <BuildingStorefrontIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.vendors")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.vendor_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? DEPARTURES
                    : userData?.role?.permissions?.includes("Invitation Cards")
                      ? DEPARTURES
                      : userData.role?.permissions?.length === 0
                        ? DEPARTURES
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-violet-100 px-2 py-4 transition-all duration-300 hover:border-violet-400 hover:shadow-gray-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-400 3xl:h-10 3xl:w-10">
                  <ChevronUpIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.departure")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.departure_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? CARS
                    : userData?.role?.permissions?.includes("Cars")
                      ? CARS
                      : userData.role?.permissions?.length === 0
                        ? CARS
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-purple-100 px-2 py-4 transition-all duration-300 hover:border-purple-400 hover:shadow-gray-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-400 3xl:h-10 3xl:w-10">
                  <TruckIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.cars")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.car_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? CONTACTS
                    : userData?.role?.permissions?.includes("Contacts")
                      ? CONTACTS
                      : userData.role?.permissions?.length === 0
                        ? CONTACTS
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-teal-100 px-2 py-4 transition-all duration-300 hover:border-teal-400 hover:shadow-gray-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-400 3xl:h-10 3xl:w-10">
                  <UsersIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.contacts")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.contact_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? ARRIVALS
                    : userData?.role?.permissions?.includes("Invitation Cards")
                      ? ARRIVALS
                      : userData.role?.permissions?.length === 0
                        ? ARRIVALS
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-indigo-100 px-2 py-4 transition-all duration-300 hover:border-indigo-400 hover:shadow-gray-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-400 3xl:h-10 3xl:w-10">
                  <ChevronDownIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.arrival")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.arrival_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? CEREMONIES
                    : userData?.role?.permissions?.includes("Ceremonies")
                      ? CEREMONIES
                      : userData.role?.permissions?.length === 0
                        ? CEREMONIES
                        : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-yellow-100 px-2 py-4 transition-all duration-300 hover:border-yellow-400 hover:shadow-gray-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 3xl:h-10 3xl:w-10">
                  <CalendarIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.ceremony")}</p>
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.ceremony_count}</h3>
                </div>
              </Link>

              <Link
                to={
                  userData?.role === "superAdmin"
                    ? INVITATION_CARDS
                    : userData?.role?.permissions?.includes("Invitation Cards")
                      ? INVITATION_CARDS
                      : userData.role?.permissions?.length === 0
                      ? INVITATION_CARDS
                      : ""
                }
                className="flex gap-2 rounded-lg border-2 border-transparent bg-cyan-100 px-2 py-4 transition-all duration-300 hover:border-cyan-400 hover:shadow-gray-card 3xl:gap-3 3xl:p-4"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 3xl:h-10 3xl:w-10">
                  <IdentificationIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
                </div>
                <div className="space-y-">
                  <p className="text-sm font-medium 3xl:text-base">{t("dashboard.stats.cards")}</p>{" "}
                  <h3 className="text-lg font-bold 3xl:text-xl">{statsData?.invitation_card_count}</h3>
                </div>
              </Link>
            </div>
          )}
        </div>

        <div className="card col-span-6 lg:col-span-6">
          {/* <div className="flex justify-between items-start">
            <div>
              <h1 className="heading">Events </h1>
              <p className="mt-1 text-sm text-gray-500">List of events</p>
            </div>
            <Link to={userData?.role === "superAdmin" ? EVENTS : userData?.role?.permissions?.includes("Events") ? EVENTS : ""}>
              <div className="underline cursor-pointer">View All</div>
            </Link>
          </div> */}
          <div className="mt-2">
            <div className="-mx-6 mb-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD?.map((head) => (
                      <th
                        key={head}
                        className="border-b border-gray-100 bg-white p-4 first:pl-6"
                        onClick={() => {
                          let sortKey;
                          if (head === "Event Name") {
                            sortKey = "name";
                          } else if (head === "Venue") {
                            sortKey = "venue.name";
                          } else if (head === "Start Date & Time") {
                            sortKey = "created_at_unix";
                          } else {
                            sortKey = head.toLowerCase();
                          }
                          requestSort(sortKey);
                        }}
                      >
                        <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                          {head}
                          {sortConfig.key ===
                            (head === "Event Name"
                              ? "name"
                              : head === "Venue"
                                ? "venue.name"
                                : head === "Start Date & Time"
                                  ? "created_at_unix"
                                  : head.toLowerCase()) && sortConfig?.direction === "asc" ? (
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
                        <Skeleton count={5} height={50} />
                      </td>
                    </tr>
                  ) : items?.length > 0 ? (
                    items?.map((item, index) => (
                      <tr key={item?.id} className="even:bg-gray-50">
                        <td className="py-3 pl-6 pr-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.priority}</p>
                        </td>
                        <td className="py-3 pl-4 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.title}</p>
                        </td>
                        <td className="py-3 pl-4 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {item?.assign_to?.first_name} {item?.assign_to?.last_name}
                          </p>
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {getLocalDateFromUnixTimestamp(item?.start_date, "DD MMM, YYYY, HH:mmA")}
                          </p>
                        </td>
                        <td className="py-3 pl-4 pr-3 3xl:px-4">
                          <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                            {getLocalDateFromUnixTimestamp(item?.end_date, "DD MMM, YYYY, HH:mmA")}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Render "No Data" message
                    <tr className="h-[300px]">
                      <td colSpan="6">
                        <Lottie options={emptyFolderAnimation} width={200} height={200} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card col-span-6 lg:col-span-6">
          {/* Legend */}
          <div className="mb-4 flex justify-between text-sm">
            <div className="flex items-center">
              <span className="mr-2 inline-block h-4 w-4 bg-green-500"></span>
              {t("dashboard.chart.completed")} ({taskCount.completed})
            </div>
            <div className="flex items-center">
              <span className="mr-2 inline-block h-4 w-4 bg-orange-500"></span>
              {t("dashboard.chart.pending")} ({taskCount.pending})
            </div>
            <div className="flex items-center">
              <span className="mr-2 inline-block h-4 w-4 bg-[#FAA502]"></span>
              {t("dashboard.chart.overdue")} ({taskCount.over_due})
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex h-8 w-full">
            {/* Completed */}
            <div className="bg-green-500" style={{ width: `${completedWidth}%` }} />
            {/* Pending */}
            <div className="bg-orange-500" style={{ width: `${pendingWidth}%` }} />
            {/* Overdue */}
            <div className="bg-[repeating-linear-gradient(45deg,orange,orange_10px,white_10px,white_20px)]" style={{ width: `${overDueWidth}%` }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
