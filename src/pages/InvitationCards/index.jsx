import Lottie from "react-lottie";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Button from "../../components/common/Button";
import animationData from "../../assets/lottie/no_data";
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import AddInvitationCardModal from "./AddInvitationCardModal";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { Images } from "../../assets/Assets";
import { useEffect } from "react";
import ApiServices from "../../api/services";
import { mediaUrl } from "../../utilities/config";
import { INVITATION_CARD_PRINT } from "../../routes/Names";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaFilePdf } from "react-icons/fa";
import QRCode from "qrcode"; // Add this import

// Table Head

const InvitationCards = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD = [t("invitationCard.invitationCardName"), t("invitationCard.invitationCardNotes")];

  // Context
  const { eventSelect, loading, setLoading, setBtnLoading, openSuccessModal, setErrorMessage, closeSuccessModel, userData } = useThemeContext();

  // Use States
  const [searchText, setSearchText] = useState("");
  const [activeRow, setActiveRow] = useState(null);

  // Data

  const [allInvitationCards, setAllInvitationCards] = useState([]);

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

  // Detail of selected row
  const detail = allInvitationCards?.find((item) => item?.id === (activeRow || allInvitationCards[0]?.id));

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allInvitationCards);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 9 : isLaptop ? 9 : 10;

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  // Get Invitation Cards
  const getInvitationCards = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        event_id: eventSelect,
      };

      const res = await ApiServices.invitation_card.getInvitationCards(payload);
      const { data, message } = res;

      if (data?.code === 200) {
        setLoading(false);
        setAllInvitationCards(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // Delete Gift
  const handleDeleteInvitationCard = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.invitation_card.deleteInvitationCard(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getInvitationCards();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: t("message.success"),
          message: t("invitationCard.invitationCardDeleteSuccess"),
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      setErrorMessage(err.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // Use Effects
  // useEffect(() => {
  //   if (searchText?.length > 1 || searchText?.length === 0) {
  //     getInvitationCards();
  //   }
  // }, [searchText]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getInvitationCards(false);
        setCurrentPage(1);
      }
    }
  };

  // useEffect(() => {
  //   if (searchText.trim() === "") {
  //     getInvitationCards();
  //   }
  // }, [searchText]);

  useEffect(() => {
    setActiveRow(items[0]?.id);
  }, [items]);

  useEffect(() => {
    getInvitationCards();
  }, [currentPage]);

  const fileUrl = detail?.invitation_card ? mediaUrl + detail?.invitation_card : Images.PLACEHOLDER;
  const fileType = detail?.invitation_card ? detail.invitation_card.split(".").pop() : "";

  const isImage = ["png", "jpeg", "jpg"].includes(fileType.toLowerCase());
  const isVideo = ["mp4", "avi", "mkv"].includes(fileType.toLowerCase());
  const isPdf = ["pdf"].includes(fileType.toLowerCase());

  // Updated function to generate and download QR code
  const handleDownloadGuestInvitationsQr = async () => {
    try {
      const url = "https://app.plannedforever.com/get-invitation-card";

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 800,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      //Create a temporary anchor element to trigger download
      const anchor = document.createElement("a");
      anchor.href = qrCodeDataUrl;
      anchor.download = "guest-invitations-qr-code.png";
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

  console.log("items----------------------", items);
  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">{t("invitationCard.invitationCards")} </h3>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-x-3">
                  {(userData?.role?.display_name === "web_admin" ||
                    userData.role.permissions?.some((item) => item === "invitation-cards-create")) && (
                    <Button
                      title={t("invitationCard.addInvitationCard")}
                      onClick={() => {
                        setModalData(null); // Clear modalData first
                        setAddNewModal(true);
                      }}
                    />
                  )}

                  <Link to={INVITATION_CARD_PRINT}>
                    <Button title={t("buttons.print")} buttonColor="border-primary  bg-primary " />
                  </Link>
                  <Button title={t("Download Guest Invitations QR")} onClick={handleDownloadGuestInvitationsQr} />
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
                        getInvitationCards(true);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    className="focus:border-primary-color-100 block h-11 w-36 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:ring-primary-color 3xl:w-full"
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
                            if (head === "Invitation Card Name") {
                              sortKey = "name";
                            } else if (head === "Invitation Card Notes") {
                              sortKey = "room_type";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">
                            {head}
                            {sortConfig.key ===
                              (head === "Invitation Card Name" ? "name" : head === "Invitation Card Notes" ? "room_type" : head.toLowerCase()) &&
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
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name}</p>
                          </td>

                          <td className="py-3 pl-4 pr-3 3xl:px-4">
                            <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.description ? item?.description : '-'}</p>
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
                <div className="-mr-6 h-[70vh] space-y-8 overflow-y-auto 3xl:mr-0">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="sub-heading">{t("headings.basicInfo")}</h2>
                      <div className="flex justify-between">
                        <h3 className="heading">{t("headings.details")} </h3>
                        <div className="flex items-center gap-x-3">
                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "invitation-cards-edit")) && (
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
                          {(userData?.role?.display_name === "web_admin" ||
                            userData.role.permissions?.some((item) => item === "invitation-cards-delete")) && (
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
                    <div className="grid grid-cols-2 gap-5 3xl:grid-cols-1">
                      <TitleValue title={t("invitationCard.invitationCardName")} value={detail?.name || "-"} />
                    </div>
                    <div className="mt-5">
                      <h3 className="my-2 text-xs text-info-color">{t("invitationCard.invitationCardFile")}</h3>
                      <div className="h-full w-full">
                        {isImage ? (
                          <img src={fileUrl} alt="media" className="h-80 w-80  object-cover" />
                        ) : isVideo ? (
                          <video src={fileUrl} controls className="h-full w-full object-cover" />
                        ) : isPdf ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-20 w-20 flex-col items-center justify-center rounded-md bg-gray-200"
                          >
                            <FaFilePdf className="h-10 w-10 text-red-500" />
                            <p className="mt-2 text-sm text-gray-700">PDF</p>
                          </a>
                        ) : (
                          <img src={Images.PLACEHOLDER} alt="placeholder" className="h-20 w-20 object-cover" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="sub-heading mb-5">{t("headings.otherInfo")}</h2>
                    <TitleValue title={t("headings.notes")} value={detail?.description ? detail?.description : '-'} />
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

            <AddInvitationCardModal
              isOpen={addNewModal}
              setIsOpen={() => setAddNewModal(false)}
              refreshData={getInvitationCards}
              data={modalData}
              setModalData={setModalData}
            />

            <ConfirmationModal
              message="Are you sure you want to delete this Invitation Card?"
              isOpen={openDeleteModal.open}
              setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
              handleSubmit={handleDeleteInvitationCard}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default InvitationCards;
