import moment from "moment";
import ApiServices from "@api";
import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import { useThemeContext } from "@context";
import ReactPaginate from "react-paginate";
import { useSortableData } from "@sorting";
import Badge from "@components/common/Badge";
import Skeleton from "react-loading-skeleton";
import Button from "@components/common/Button";
import { useMediaQuery } from "react-responsive";
import Dropdown from "@components/common/Dropdown";
import TitleValue from "@components/common/TitleValue";
import { Dialog, Transition } from "@headlessui/react";
import RadioInput from "@components/common/RadioInput";
import React, { useEffect, useState, Fragment } from "react";
import { emptyFolderAnimation } from "@utilities/lottieAnimations";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { QR_OVERVIEW_PRINT } from "../../routes/Names";

const QrCodesOverview = () => {
  // Translation hook
  const { t } = useTranslation("common");

  // Table Head with translations
  const TABLE_HEAD = ["Qr Code", t("qrCodeOverview.name"), "Status"];

  // Context
  const { loading, setLoading, setBtnLoading, btnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, eventSelect, eventDetail } =
    useThemeContext();

  console.log("Event eventDetail:", eventDetail);
  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data
  const [allQrCodes, setAllQrCodes] = useState([]);
  const [allContact, setAllContact] = useState([]);
  const [userCounts, setUserCounts] = useState({
    totalAvailable: 0,
    allocated: 0,
    used: 0,
    expiryDate: "",
  });
  const [userAssignedQrCodes, setUserAssignedQrCodes] = useState([]);
  const [filteredAssignedQrCodes, setFilteredAssignedQrCodes] = useState([]);

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState(null);

  // Modal
  const [requestQrCodeModal, setRequestQrCodeModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });

  // Bulk Allocation Modal States
  const [selectedColorCode, setSelectedColorCode] = useState(null);
  const [tagsPerItem, setTagsPerItem] = useState("1");
  const [serverError, setServerError] = useState("");
  const [colorCodeOptions, setColorCodeOptions] = useState([]);

  // Loading states for individual API calls
  const [contactsLoading, setContactsLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [qrListLoading, setQrListLoading] = useState(false);

  // Tags per item options for radio buttons
  const tagsPerItemOptions = [
    { id: "1", value: "1", label: "1 Tag for each" },
    { id: "2", value: "2", label: "2 Tags for each" },
    { id: "3", value: "3", label: "3 Tags for each" },
    { id: "4", value: "4", label: "4 Tags for each" },
  ];

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(filteredAssignedQrCodes);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 9 : isLaptopMedium ? 7 : isLaptop ? 6 : 9;

  // Get User Counts - FIXED VERSION WITHOUT DELAY
  const getUserCounts = async () => {
    try {
      setCountsLoading(true);
      console.log("Fetching user counts...");
      const userData = JSON.parse(localStorage.getItem("eventDetail"));
      const authToken = userData?.qr_token;
      // Create headers like in your test project
      const myHeaders = new Headers();
      myHeaders.append("Auth-Token", authToken);
      const raw = "";

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch("https://plannedforever.my-bagtags.com/api/index.php/PfQrCodesController/getUserQrCodeCounts", requestOptions);

      const result = await response.text();
      console.log("User counts response:", result);

      const data = JSON.parse(result);

      // Handle the API response structure
      if (data.status === 200 || data.status === true) {
        const messageData = data?.message || {};
        setUserCounts({
          totalAvailable: (messageData.allotted_qr_codes || 0) + (messageData.used_qr_codes || 0),
          allocated: messageData.allotted_qr_codes || 0,
          used: messageData.used_qr_codes || 0,
          expiryDate: "23rd Feb, 2026", // Default value as it's not in API response
        });
      }
    } catch (err) {
      console.error("Error fetching user counts:", err);
      // Set default values in case of error
      setUserCounts({
        totalAvailable: 0,
        allocated: 0,
        used: 0,
        expiryDate: "23rd Feb, 2026",
      });
    } finally {
      setCountsLoading(false);
    }
  };

  // Get User Assigned QR Codes List - FIXED VERSION WITHOUT DELAY
  const getUserAssignedQrCodesList = async () => {
    try {
      setQrListLoading(true);
      console.log("Fetching QR codes list...");
      const userData = JSON.parse(localStorage.getItem("eventDetail"));
      const authToken = userData?.qr_token;
      // Create headers like in your test project
      const myHeaders1 = new Headers();
      myHeaders1.append("Auth-Token", authToken);
      const raw1 = "";

      const requestOptions1 = {
        method: "POST",
        headers: myHeaders1,
        body: raw1,
        redirect: "follow",
      };

      const response = await fetch("https://plannedforever.my-bagtags.com/api/index.php/PfQrCodesController/getQrCodeList", requestOptions1);

      const result = await response.text();
      const data = JSON.parse(result);

      // Handle the API response structure
      if (data.status === 200 || data.status === true) {
        const assignedCodes = data?.result || [];

        // Transform the data to match the expected structure
        const transformedCodes = assignedCodes.map((item) => ({
          id: item.AutoID,
          qr_code: item.QRCodeText,
          contact: {
            first_name: item.alertedUserName || "N/A",
            last_name: "",
            contact_no: "N/A", // Not available in this response
          },
          color_code: {
            name: "N/A", // Not available in this response
          },
          status: item.status,
          mask_email: item.MaskEmail,
          qr_image: item.QRCodeImage,
          is_used: item.IsUsed,
          is_download: item.isDownload,
          alerted_date: item.alertedDateTime,
        }));

        setUserAssignedQrCodes(transformedCodes);
        setFilteredAssignedQrCodes(transformedCodes);

        // Set up pagination for assigned QR codes
        const totalItems = transformedCodes.length;
        setTotalPages(Math.ceil(totalItems / itemsPerPage));

        // Set active row to first item
        if (transformedCodes.length > 0) {
          setActiveRow(transformedCodes[0]?.id);
        }
      }
    } catch (err) {
      console.error("Error fetching user assigned QR codes:", err);
      setUserAssignedQrCodes([]);
      setFilteredAssignedQrCodes([]);
    } finally {
      setQrListLoading(false);
    }
  };

  // Get color codes - REMOVED DELAY
  const getColorCodes = async () => {
    try {
      const requestData = {};
      const res = await ApiServices.contact.getColorCodes(requestData);
      const { data, message } = res;

      if (data.status === true) {
        const colorCodes = data?.data?.map((color) => ({ id: color.id, value: color.id, label: color.name }));
        setColorCodeOptions(colorCodes);
      }
    } catch (err) {
      console.error("Error fetching color codes:", err);
    }
  };

  // Updated getContacts function - REMOVED DELAY
  const getContacts = async () => {
    try {
      setContactsLoading(true);
      setServerError("");

      let payload = {
        color_code_id: selectedColorCode?.value,
        event_id: eventSelect,
      };

      const res = await ApiServices.contact.GetAllContact(payload);
      const { data, message } = res;

      if (data?.code === 200) {
        const contacts = data.data;

        // Log contacts to verify auto_id is present
        console.log("Fetched contacts:", contacts);

        // Validate that contacts have auto_id
        const contactsWithAutoId = contacts.filter((contact) => contact.auto_id);

        if (contactsWithAutoId.length !== contacts.length) {
          console.warn(
            "Some contacts are missing auto_id:",
            contacts.filter((contact) => !contact.auto_id),
          );
        }

        setAllContact(contacts);
      } else {
        setServerError("Failed to fetch contacts: " + (message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setServerError("Error fetching contacts: " + (err.message || "Unknown error"));
    } finally {
      setContactsLoading(false);
    }
  };

  // Pagination - handles assigned QR codes with client-side pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);

    // Calculate start and end indices for current page
    const startIndex = selected * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Apply search filter first, then pagination
    let filteredData = userAssignedQrCodes;
    if (searchText.trim() !== "") {
      filteredData = userAssignedQrCodes.filter(
        (item) =>
          item?.qr_code?.toLowerCase().includes(searchText.toLowerCase()) ||
          item?.contact?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
          item?.mask_email?.toLowerCase().includes(searchText.toLowerCase()) ||
          item?.status?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    const paginatedData = filteredData.slice(startIndex, endIndex);
    setFilteredAssignedQrCodes(paginatedData);
  };

  // Handle Search
  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  // Perform search on assigned QR codes
  const performSearch = () => {
    let filteredData = userAssignedQrCodes;

    if (searchText.trim() !== "") {
      filteredData = userAssignedQrCodes.filter(
        (item) =>
          item?.qr_code?.toLowerCase().includes(searchText.toLowerCase()) ||
          item?.contact?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
          item?.mask_email?.toLowerCase().includes(searchText.toLowerCase()) ||
          item?.status?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // Reset to first page and update pagination
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));

    // Show first page of filtered results
    const paginatedData = filteredData.slice(0, itemsPerPage);
    setFilteredAssignedQrCodes(paginatedData);
  };

  // Status badge renderer
  const renderStatusBadge = (status) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";

    switch (status) {
      case "active":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "expired":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      default:
        break;
    }

    // Translate the status
    const translatedStatus = status ? t(`${status}`) : "";

    return <span className={`rounded px-2.5 py-0.5 ${bgColor} ${textColor} text-xs font-semibold`}>{translatedStatus}</span>;
  };

  // Close Bulk Allocation Modal
  const closeBulkAllocationModal = () => {
    setRequestQrCodeModal(false);
    setSelectedColorCode(null);
    setTagsPerItem("1");
    setServerError("");
    setAllContact([]);
  };

  // Handle bulk allocation submission - REMOVED DELAY
  const handleBulkAllocation = async (e) => {
    e.preventDefault();

    // Validate form
    if (!selectedColorCode) {
      setServerError("Please select a color code");
      return;
    }

    if (!allContact || allContact.length === 0) {
      setServerError("No contacts found for the selected color code");
      return;
    }

    // Validate that contacts have auto_id
    const contactsWithAutoId = allContact.filter((contact) => contact.auto_id);

    if (contactsWithAutoId.length === 0) {
      setServerError("No valid contacts found with auto_id for allocation");
      return;
    }

    if (contactsWithAutoId.length !== allContact.length) {
      console.warn(`Warning: ${allContact.length - contactsWithAutoId.length} contacts are missing auto_id and will be skipped`);
    }

    try {
      setBtnLoading(true);

      // Create payload for bulk assignment
      const bulkAssignPayload = {};

      // Iterate through contacts with auto_id and assign the selected number of tags per item
      contactsWithAutoId.forEach((contact) => {
        bulkAssignPayload[contact.auto_id] = parseInt(tagsPerItem);
      });

      // Log payload for debugging
      console.log("Bulk assign payload:", bulkAssignPayload);
      console.log(`Allocating ${tagsPerItem} tag(s) to ${contactsWithAutoId.length} contacts`);

      // Call the bulk assign QR codes API
      const response = await ApiServices.qr_codes.assignBulkQrCodes(bulkAssignPayload);

      // Handle response
      if (response.data.code === 200 || response.data.status === true || response.data.status === 200) {
        closeBulkAllocationModal();

        // Refresh data immediately without delays
        getUserCounts(); // Refresh the counts
        getUserAssignedQrCodesList(); // Refresh assigned QR codes list

        const totalTagsAllocated = contactsWithAutoId.length * parseInt(tagsPerItem);

        openSuccessModal({
          title: "Success!",
          message: `${totalTagsAllocated} QR codes have been allocated successfully to ${contactsWithAutoId.length} contacts (${tagsPerItem} tag(s) each)`,
          onClickDone: closeSuccessModel,
        });
      } else {
        setServerError(response.data.message || "Failed to allocate QR codes");
      }
    } catch (err) {
      console.error("Error in bulk allocation:", err);
      setServerError(err.response?.data?.message || err.message || "An error occurred during bulk allocation");
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    if (items.length > 0) {
      setActiveRow(items[0]?.id);
    }
  }, [items]);

  useEffect(() => {
    // When currentPage changes, update the displayed data
    if (userAssignedQrCodes.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      let filteredData = userAssignedQrCodes;
      if (searchText.trim() !== "") {
        filteredData = userAssignedQrCodes.filter(
          (item) =>
            item?.qr_code?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.contact?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.mask_email?.toLowerCase().includes(searchText.toLowerCase()) ||
            item?.status?.toLowerCase().includes(searchText.toLowerCase()),
        );
      }

      const paginatedData = filteredData.slice(startIndex, endIndex);
      setFilteredAssignedQrCodes(paginatedData);
    }
  }, [currentPage, userAssignedQrCodes, searchText, itemsPerPage]);

  // Initial data loading
  useEffect(() => {
    getColorCodes();
    getUserCounts();
    getUserAssignedQrCodesList();
  }, []);

  // // Refresh counts when eventSelect changes
  // useEffect(() => {
  //   if (eventSelect) {
  //     getUserCounts();
  //     getUserAssignedQrCodesList();
  //   }
  // }, [eventSelect]);

  useEffect(() => {
    if (selectedColorCode) {
      getContacts();
    }
  }, [selectedColorCode]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="card col-span-12 h-[44vh] space-y-10 lg:col-span-4">
          <h2 className="text-xl font-semibold">{t("qrCodeOverview.qrCodeStatus")}</h2>
          <div className="space-y-5">
            <div className="flex cursor-pointer gap-2 rounded-lg border-2 border-transparent bg-indigo-100 px-2 py-4 transition-all duration-300 hover:border-indigo-400 hover:shadow-gray-card 3xl:gap-3 3xl:p-4">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-400 3xl:h-10 3xl:w-10">
                <ChevronDownIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
              </div>
              <div className="space-y-">
                <p className="text-sm font-medium 3xl:text-base">{"Total Qr Codes to Wedding"}</p>
                <h3 className="text-lg font-bold 3xl:text-xl">{countsLoading ? <Skeleton width={50} height={20} /> : userCounts.totalAvailable - userCounts.used}</h3>
              </div>
            </div>
            <div className="flex cursor-pointer gap-2 rounded-lg border-2 border-transparent bg-orange-100 px-2 py-4 transition-all duration-300 hover:border-orange-300 hover:shadow-orange-card 3xl:gap-3 3xl:p-4">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-400 3xl:h-10 3xl:w-10">
                <ChevronDownIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
              </div>
              <div className="space-y-">
                <p className="text-sm font-medium 3xl:text-base">{"Available Qr Codes"}</p>
                <h3 className="text-lg font-bold 3xl:text-xl">{countsLoading ? <Skeleton width={50} height={20} /> : userCounts.allocated - userCounts.used}</h3>
              </div>
            </div>
            <div className="flex cursor-pointer gap-2 rounded-lg border-2 border-transparent bg-green-100 px-2 py-4 transition-all duration-300 hover:border-green-300 hover:shadow-green-card 3xl:gap-3 3xl:p-4">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400 3xl:h-10 3xl:w-10">
                <ChevronDownIcon className="h-5 w-5 text-white 3xl:h-6 3xl:w-6" />
              </div>
              <div className="space-y-">
                <p className="text-sm font-medium 3xl:text-base">QR Codes Used</p>
                <h3 className="text-lg font-bold 3xl:text-xl">{countsLoading ? <Skeleton width={50} height={20} /> : userCounts.used}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <div className="card h-[82vh]">
            <div className="flex justify-between">
              <div className="flex w-full items-center justify-between gap-x-3">
                <div className="flex items-center gap-x-3">
                  <Button title={"Bulk Assign"} buttonColor="bg-purple-600" onClick={() => setRequestQrCodeModal(true)} />
                  {/* <Link to={QR_OVERVIEW_PRINT}>
                    <Button title={t("buttons.print")} buttonColor="border-primary  bg-primary " />
                  </Link> */}
                </div>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    placeholder={t("search.placeholder", "Search...")}
                    autoComplete="off"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        // Reset to show all assigned QR codes
                        setCurrentPage(1);
                        const paginatedData = userAssignedQrCodes.slice(0, itemsPerPage);
                        setFilteredAssignedQrCodes(paginatedData);
                        setTotalPages(Math.ceil(userAssignedQrCodes.length / itemsPerPage));
                      }
                    }}
                    onKeyPress={handleSearch}
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
                            if (head === t("qrCodeOverview.qrCode")) {
                              sortKey = "qr_code";
                            } else if (head === t("qrCodeOverview.name")) {
                              sortKey = "contact.first_name";
                            } else if (head === t("qrCodeOverview.colourCode")) {
                              sortKey = "color_code.name";
                            } else if (head === t("qrCodeOverview.contactNo")) {
                              sortKey = "contact.contact_no";
                            } else if (head === t("qrCodeOverview.status")) {
                              sortKey = "status";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === t("qrCodeOverview.qrCode")
                                ? "qr_code"
                                : head === t("qrCodeOverview.name")
                                  ? "contact.first_name"
                                  : head === t("qrCodeOverview.colourCode")
                                    ? "color_code.name"
                                    : head === t("qrCodeOverview.contactNo")
                                      ? "contact.contact_no"
                                      : head === t("qrCodeOverview.status")
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
                    {qrListLoading ? (
                      <tr>
                        <td colSpan="5">
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
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.qr_code || t("unavailable", "N/A")}</p>
                          </td>
                          <td className="py-3 pl-6 pr-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                              {item?.contact?.first_name || t("unavailable", "N/A")}
                            </p>
                          </td>
                          <td className="py-3 pl-6 pr-4">{item?.status}</td>
                        </tr>
                      ))
                    ) : (
                      // Render "No Data" message
                      <tr className="h-[400px]">
                        <td colSpan="5">
                          <Lottie options={emptyFolderAnimation} width={200} height={200} />
                          <p className="text-center text-gray-500">{t("noData", "No Data")}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="absolute bottom-4 right-4">
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
                  nextLabel={<ChevronRightIcon className="h-5 w-5" aria-label={t("pagination.next", "Next")} />}
                  previousLabel={<ChevronLeftIcon className="h-5 w-5" aria-label={t("pagination.previous", "Previous")} />}
                />
              </div>
            </div>
            {/* Table End */}
          </div>
        </div>
      </div>

      {/* Bulk Allocation Modal */}
      <Transition appear show={requestQrCodeModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeBulkAllocationModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-6 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      Bulk Assign QR Codes
                    </Dialog.Title>
                    <XMarkIcon onClick={closeBulkAllocationModal} className="h-6 w-6 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleBulkAllocation} className="h-[450px]">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <div>
                          <Dropdown
                            isSearchable
                            options={colorCodeOptions}
                            placeholder="Select Color Code"
                            title="Select Guest Colour Code"
                            onChange={(value) => {
                              setSelectedColorCode(value);
                              setServerError("");
                            }}
                            value={selectedColorCode}
                            withError={!selectedColorCode && serverError ? "Required" : ""}
                          />
                        </div>
                        <div className="mt-5">
                          <h2 className="mb-2 text-left text-sm font-medium">Number of Tags</h2>
                          <RadioInput
                            name="tagsPerItem"
                            options={tagsPerItemOptions}
                            Classes="flex flex-col items-start "
                            checked={tagsPerItem}
                            onChange={(value) => setTagsPerItem(value)}
                          />
                        </div>
                      </div>
                      <div className="-mr-4 h-80 overflow-auto rounded border border-gray-200 bg-gray-50 p-4 pr-4">
                        {contactsLoading ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="flex flex-col items-center space-y-2">
                              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                              <p className="text-center text-sm text-gray-500">Loading contacts...</p>
                            </div>
                          </div>
                        ) : allContact?.length === 0 && !selectedColorCode ? (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-center text-gray-500">Select Color Code to get the contacts</p>
                          </div>
                        ) : allContact?.length === 0 && selectedColorCode ? (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-center text-gray-500">No Contact found against this color code</p>
                          </div>
                        ) : (
                          allContact?.map((item, index) => (
                            <div key={index} className="mb-2 flex items-center justify-between rounded bg-white p-2 shadow-sm">
                              <h2 className="text-left text-sm font-medium">
                                {item?.first_name} {item?.last_name}
                              </h2>
                              <p className="text-xs text-gray-600">Auto ID: {item?.auto_id || "N/A"}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {serverError && (
                      <div className="mt-4 rounded-md bg-red-50 p-3">
                        <p className="text-sm font-medium text-red-800">{serverError}</p>
                      </div>
                    )}

                    {allContact?.length > 0 && (
                      <div className="mt-4 rounded-md bg-blue-50 p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Summary:</strong> {allContact.filter((contact) => contact.auto_id).length} contacts will receive {tagsPerItem}{" "}
                          tag(s) each (Total: {allContact.filter((contact) => contact.auto_id).length * parseInt(tagsPerItem)} QR codes)
                        </p>
                        {allContact.some((contact) => !contact.auto_id) && (
                          <p className="mt-1 text-sm text-yellow-600">
                            <strong>Warning:</strong> {allContact.filter((contact) => !contact.auto_id).length} contacts missing auto_id will be
                            skipped
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-8 flex justify-center gap-4">
                      <Button
                        loading={btnLoading}
                        icon={<CheckIcon />}
                        title="Allocate"
                        type="submit"
                        disabled={!selectedColorCode || allContact?.length === 0}
                      />
                      <Button icon={<XMarkIcon />} title="Cancel" type="button" buttonColor="bg-red-500" onClick={closeBulkAllocationModal} />
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default QrCodesOverview;
