import Lottie from "react-lottie";
import ReactPaginate from "react-paginate";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import QuickImportContactModal from "./QuickImportContactModal"
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { ADD_CONTACT, CONTACT_PRINT } from "../../routes/Names";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { baseUrl, mediaUrl } from "../../utilities/config";
import { Images } from "../../assets/Assets";
import { Switch } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import Badge from "../../components/common/Badge";
import { registerQrSubscriber, registerSubscriber } from "../../api/services/qr_codes";
import QRCode from "qrcode"; // Add this import
import MessageSchedule from "./MessageSchedule";
import { hasPermission } from "../../utilities/permissions";

const Contact = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD = [
    { label: t("contacts.name"), sortKey: "first_name" },
    { label: t("contacts.nickName"), sortKey: "nick_name" },
    { label: t("contacts.members"), sortKey: "no_of_members" },
    { label: t("contacts.groups"), sortKey: "group.name" },
    { label: t("contacts.colorCode"), sortKey: "color_code.name" },
    { label: t("contacts.contactNo"), sortKey: "contactNumbersContact" },
    { label: t("contacts.quickContact"), sortKey: "quick_contact_status" },
    { label: "My Bag Tags", sortKey: "auto_id" },
    { label: t("headings.actions"), sortKey: null },
  ];

  // react router dom
  const navigate = useNavigate();

  // context
  const { eventSelect, loading, setErrorMessage, setLoading, setBtnLoading, closeSuccessModel, openSuccessModal, userData } = useThemeContext();

  // useStates
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [quickImportModal, setquickImportModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [openQuickContactModal, setOpenQuickContactModal] = useState({ open: false, data: null });
  const [openRegisterModal, setOpenRegisterModal] = useState({ open: false, data: null });
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [currentSubscriberData, setCurrentSubscriberData] = useState(null);
  const [addNewSendMessageModal, setAddNewSendMessageModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  // Data
  const [allContact, setAllContact] = useState([]);
  // Pagination 
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const inFlightRequestKeyRef = useRef(null);

  // useMediaQuery for responsiveness
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });

  const itemsPerPage = isLargeScreenLaptop ? 9 : isLaptopMedium ? 7 : isLaptop ? 6 : 9;

  const { items, requestSort, sortConfig } = useSortableData(allContact);

  const formatContactNumber = (contact) => {
    if (!contact) return "-";

    const countryCode = String(contact?.country_code || "")
      .replace(/\bIndia\b/gi, "")
      .trim();
    const number = String(contact?.contact_number || "").trim();

    return [countryCode, number].filter(Boolean).join(" ") || "-";
  };

  const formatContactName = (contact) =>
    [contact?.salutation, contact?.first_name, contact?.middle_name, contact?.last_name]
      .filter(Boolean)
      .join(" ") || "-";

  // getContact API
  const getContacts = (emptySearch) => {
    let payload = {
      search: emptySearch ? "" : searchText,
      page: currentPage,
      records_no: itemsPerPage,
      event_id: eventSelect,
    };

    if (!payload.event_id) return;

    const requestKey = JSON.stringify(payload);

    if (inFlightRequestKeyRef.current === requestKey) {
      return;
    }

    inFlightRequestKeyRef.current = requestKey;

    setLoading(true);

    ApiServices.contact
      .GetAllContact(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setLoading(false);
          setAllContact(data.data.data);
          setModalData(data.data.data);
          const nextPage = Number(data?.data?.current_page || 1);
          setCurrentPage((prev) => (Number(prev) === nextPage ? prev : nextPage));
          setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
      })
      .finally(() => {
        if (inFlightRequestKeyRef.current === requestKey) {
          inFlightRequestKeyRef.current = null;
        }
      });
  };

  // Delete Contact API
  const deleteContact = () => {
    setBtnLoading(true);
    ApiServices.contact
      .deleteContact(openDeleteModal?.data)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setBtnLoading(false);
          getContacts();
          setOpenDeleteModal({ open: false, data: null });
          openSuccessModal({
            title: t("message.success"),
            message: t("contacts.contactDeleteSuccess"),
            onClickDone: (close) => {
              closeSuccessModel();
              // onSuccess();
            },
          });
        }
      })
      .catch((err) => {
        setErrorMessage(err?.response?.data?.message);
        setBtnLoading(false);
      });
  };

  const quickContact = () => {
    let payload = {};

    if (openQuickContactModal?.data?.quick_contact_status === 0) {
      payload = {
        mode: "add",
        user_ids: [openQuickContactModal.data.uuid],
      };
    } else {
      payload = {
        mode: "remove",
        user_ids: [openQuickContactModal?.data?.uuid],
      };
    }
    setBtnLoading(true);
    ApiServices.contact
      .addQuickContact(payload)
      .then((res) => {
        const { data, message } = res;

        console.log({ res });

        if (res?.code === 200) {
          setBtnLoading(false);
          getContacts();
          setOpenQuickContactModal({ open: false, data: null });
          openSuccessModal({
            title: "Success!",
            message: "Contact has been add to quick contact successfully!",
            onClickDone: (close) => {
              closeSuccessModel();
              // onSuccess();
            },
          });
        }
      })
      .catch((err) => {
        setOpenQuickContactModal({ open: false, data: null });
        setBtnLoading(false);
      });
  };

  const handleRegisterSubscriber = async () => {
    try {
      setRegistrationLoading(true);
      setRegistrationError("");

      const item = openRegisterModal?.data;

      const registrationPayload = {
        contact_uuid: item?.uuid,
      };

      // Call the register API (you'll need to implement this in your ApiServices)
      const registerResponse = await registerQrSubscriber(registrationPayload);
      const { data, message } = registerResponse;

      // Handle the API response structure
      if (data?.code === 200) {
        setRegistrationLoading(false);
        setOpenRegisterModal({ open: false, data: null });

        // Refresh contacts to update the UI
        getContacts();

        openSuccessModal({
          title: "Success!",
          message: "Contact has been registered successfully!",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      } else {
        setRegistrationError("Registration failed: " + (registerResponse.data.message || "Unknown error"));
        setRegistrationLoading(false);
        return null;
      }
    } catch (err) {
      console.error("Error in registration:", err);
      setRegistrationError("Registration failed: " + (err.message || "Unknown error"));
      setRegistrationLoading(false);
      return null;
    }
  };

  useEffect(() => {
    setActiveRow(items[0]?.uuid);
  }, [items]);

  const handleRowClick = (id) => {
    setActiveRow(id);
  };

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleEditClick = (data) => {

    // console.log("edit data--------", data); return false;
    // Navigate to the edit screen, passing the data as state
    navigate("/add-contact", { state: { data } });
  };

  // Updated function to generate and download QR code
  const handleDownloadContactEditQr = async () => {
    try {
      const url = "https://app.plannedforever.com/get-contact-details";
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 800,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create a temporary anchor element to trigger download
      const anchor = document.createElement("a");
      anchor.href = qrCodeDataUrl;
      anchor.download = "contact-edit-qr-code.png";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      // Optional: Show success message
      openSuccessModal({
        title: "Success!",
        message: "QR code has been downloaded successfully!",
        onClickDone: (close) => {
          closeSuccessModel();
        },
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      setErrorMessage("Failed to generate QR code. Please try again.");
    }
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getContacts(false);
        setCurrentPage(1);
      }
    }
  };

  useEffect(() => {
    if (!eventSelect) return;
    getContacts();
  }, [currentPage, eventSelect, itemsPerPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12">
          <div className="card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)]">
            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-4">
                <h2 className="shrink-0 text-xl font-semibold text-black">{t("contacts.contacts")}</h2>
                <div className="relative ml-auto flex items-center">
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
                    onKeyDown={handleKeyPress}
                    className="focus:border-primary-color-100 block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color"
                  />
                </div>
              </div>

              <div className="mt-4 flex w-full items-center justify-end gap-3">
                <div className="flex items-center gap-3">
                  {(hasPermission(userData, "contacts-create")) && (
                    <>
                      <Button title={t("contacts.addContact")} onClick={() => navigate(ADD_CONTACT)} />
                      <Button
                        title={t("buttons.import")}
                        buttonColor="border border-[#f4a62a] bg-transparent"
                        className="!text-[#d98200] hover:bg-[#fff8ec]"
                        onClick={() => setquickImportModal(true)}
                      />
                    </>
                  )}

                  <Link to={CONTACT_PRINT}>
                    <Button
                      title={t("buttons.print")}
                      buttonColor="border border-secondary bg-transparent"
                      className="!text-secondary hover:bg-secondary/5"
                    />
                  </Link>
                  {/* <Button title={t("Download Contact Details Edit QR")} onClick={handleDownloadContactEditQr} /> */}
                  {/* <Button title={t("Send Message")} onClick={() => {setAddNewSendMessageModal(true); setModalData(allContact);}} buttonColor="bg-green-600" /> */}
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
                          key={head.label}
                          className={`border-b border-gray-100 bg-white p-4 first:pl-6 ${!head.sortKey ? "text-center" : "text-left"}`}
                          onClick={() => head.sortKey && requestSort(head.sortKey)}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-sm font-semibold leading-5 3xl:text-sm">
                            {head.label}
                            {head.sortKey &&
                              (sortConfig.key === head.sortKey && sortConfig.direction === "asc" ? (
                                <ChevronUpIcon className="inline-block h-4 w-3.5" />
                              ) : (
                                <ChevronDownIcon className="inline-block h-4 w-3.5" />
                              ))}
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
                    ) : items.length > 0 ? (
                      items.map((item, index) => (
                        <tr
                          key={index}
                          className={`cursor-pointer ${item?.uuid === activeRow ? "border-l-4 border-secondary bg-secondary/15" : "even:bg-gray-50"}`}
                          onClick={() => handleRowClick(item?.uuid)}
                        >
                          <td
                            className="cursor-pointer py-3 pl-6 pr-4"
                            onClick={() => {
                              navigate("/contact-detail", { state: { item } });
                            }}
                          >
                            <p className="flex items-center gap-x-3 text-sm font-normal text-primary-color 3xl:text-sm">
                              <img
                                className="h-9 w-9 rounded-full object-cover"
                                src={item?.profile_image ? mediaUrl + item?.profile_image : Images.PLACEHOLDER}
                                alt="profile_img"
                              />
                              <span>{formatContactName(item)}</span>
                            </p>
                          </td>
                          <td
                            className="py-3 pl-4 3xl:px-4"
                            onClick={() => {
                              navigate("/contact-detail", { state: { item } });
                            }}
                          >
                            <p className="text-sm font-normal text-primary-color 3xl:text-sm">{item?.nick_name || "-"}</p>
                          </td>
                          <td
                            className="py-3 pl-4 3xl:px-4"
                            onClick={() => {
                              navigate("/contact-detail", { state: { item } });
                            }}
                          >
                            <p className="pl-8 text-sm font-normal text-primary-color 3xl:text-sm">{item?.no_of_members}</p>
                          </td>
                          <td
                            className="py-3 pl-4 3xl:px-4"
                            onClick={() => {
                              navigate("/contact-detail", { state: { item } });
                            }}
                          >
                            <p className="text-sm font-normal text-primary-color 3xl:text-sm">{item?.group?.name || "-"}</p>
                          </td>
                          <td
                            className="py-3 pl-4 3xl:px-4"
                            onClick={() => {
                              navigate("/contact-detail", { state: { item } });
                            }}
                          >
                            <p className="text-sm font-normal text-primary-color 3xl:text-sm">{item?.color_code?.name || "-"}</p>
                          </td>
                          <td
                            className="py-3 pl-4 3xl:px-4"
                            onClick={() => {
                              navigate("/contact-detail", { state: { item } });
                            }}
                          >
                            <p className="whitespace-nowrap text-sm font-normal text-primary-color 3xl:text-sm">
                              {formatContactNumber(item?.contact_numbers?.[0])}
                            </p>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <div className="flex items-center gap-x-3 pl-8">
                              <Switch
                                checked={item?.quick_contact_status === 1}
                                onChange={() => setOpenQuickContactModal({ open: true, data: item })}
                                className={`group relative flex h-6 w-12 cursor-pointer rounded-full ${item?.quick_contact_status === 1 ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item?.quick_contact_status === 1 ? "translate-x-6" : "translate-x-0"}`}
                                />
                              </Switch>
                            </div>
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <Badge
                              title={item.auto_id && item.qr_token ? "Registered" : "Not Registered"}
                              className={item.auto_id && item.qr_token ? "bg-green-200 text-green-500" : "bg-red-200 text-red-500"}
                            />
                          </td>
                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <div className="flex items-center justify-center gap-2">
                              {item.auto_id && item.qr_token ? (
                                <></>
                              ) : (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenRegisterModal({ open: true, data: item });
                                  }}
                                  className="cursor-pointer text-xs font-normal text-yellow-500 underline underline-offset-4 3xl:text-sm"
                                >
                                  Register
                                </span>
                              )}

                              {(hasPermission(userData, "contacts-edit")) && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(item);
                                  }}
                                  className="cursor-pointer text-xs font-normal text-secondary underline underline-offset-4 3xl:text-sm"
                                >
                                  {t("buttons.edit")}
                                </span>
                              )}

                              {(hasPermission(userData, "contacts-delete")) && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDeleteModal({ open: true, data: item?.uuid });
                                  }}
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
                        <td colSpan={TABLE_HEAD.length}>
                          <Lottie options={emptyFolderAnimation} width={200} height={200} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-auto pt-4">
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
          </div>
        </div>
      </div>

      <QuickImportContactModal isOpen={quickImportModal} setIsOpen={() => setquickImportModal(false)} refreshData={getContacts} />

      <ConfirmationModal
        message="Are you sure you want to delete this contact?"
        isOpen={openDeleteModal.open}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
        handleSubmit={deleteContact}
      />

      <ConfirmationModal
        message={`${openQuickContactModal?.data?.quick_contact_status === 1 ? "Removing this contact to the Quick Contact's , will not make it visible to all guests." : "Adding this contact to the Quick Contact's , will make it visible to all guests."} `}
        isOpen={openQuickContactModal?.open}
        setIsOpen={(open) => setOpenQuickContactModal((prev) => ({ ...prev, open }))}
        handleSubmit={quickContact}
      />
      <MessageSchedule
        refreshData=""
        isOpen={addNewSendMessageModal}
        setIsOpen={() => setAddNewSendMessageModal(false)}
        setModalData={setModalData}
        data={modalData}
      />
      <ConfirmationModal
        message="Are you sure you want to register My Bag Tag for this contact?"
        isOpen={openRegisterModal.open}
        setIsOpen={(open) => setOpenRegisterModal((prev) => ({ ...prev, open }))}
        handleSubmit={handleRegisterSubscriber}
        loading={registrationLoading}
      />
    </>
  );
};

export default Contact;
