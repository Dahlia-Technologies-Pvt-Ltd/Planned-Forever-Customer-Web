// Modified Vendors.jsx with checkbox selection and Import button

import moment from "moment";
import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useEffect, useState } from "react";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import Badge from "../../components/common/Badge";
import { MENU, VENDOR_PRINT } from "../../routes/Names";
import Button from "../../components/common/Button";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import AddMenuModal from "./AddMenuModal";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Dropdown from "../../components/common/Dropdown";
import { mediaUrl } from "@utilities/config";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";

const normalizeLinks = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((link) => link?.url);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((link) => link?.url) : [];
    } catch {
      return [];
    }
  }

  return [];
};

const Vendors = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [
    t("menu.itemType"), 
    t("menu.cuisine"), 
    t("menu.tasteProfile"), 
    t("menu.itemName")
  ];

  // Context
  const { loading, setLoading, setBtnLoading, openSuccessModal, closeSuccessModel, setErrorMessage } = useThemeContext();

  // Use States
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Data
  const [allVendors, setAllVendors] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // New state for selected items

  // Pagination
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [modalData, setModalData] = useState(null);
  const [addNewModal, setAddNewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  
  // Add Menu Modal
  const [addMenuModalOpen, setAddMenuModalOpen] = useState(false);
  const [selectedTrendingItems, setSelectedTrendingItems] = useState([]);

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
    getMenuById(id);
  };

  // Detail of selected row
  const detail = allVendors?.find((item) => item?.id === (activeRow || allVendors[0]?.id));
  const socialMediaLinks = normalizeLinks(detail?.social_media_links);

  // Table Sorting
  const { items, requestSort, sortConfig } = useSortableData(allVendors);

  // Media Queries
  const isLaptop = useMediaQuery({ minWidth: 1024 });
  const isLaptopMedium = useMediaQuery({ minWidth: 1536 });
  const isLargeScreenLaptop = useMediaQuery({ minWidth: 1700 });
  const itemsPerPage = isLargeScreenLaptop ? 10 : isLaptopMedium ? 8 : isLaptop ? 7 : 10;

  // Handle checkbox selection
  const handleCheckboxChange = (e, item) => {
    e.stopPropagation(); // Prevent row click
    if (e.target.checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
    }
  };

  // Handle import button click
  const handleImportClick = () => {
    // Transform selected trending items to menu items format
    const formattedItems = selectedItems.map(item => ({
      item: item.name,
      type: item?.menu_type?.name || "",
      quantity: "",
      description: item?.notes || "",
      img: item?.image,
      id: item?.id,
      source: "trending",
    }));
    
    setSelectedTrendingItems(formattedItems);
    setAddMenuModalOpen(true);
  };

  // Get Vendors
  const getVendorsListing = async (emptySearch) => {
    try {
      setLoading(true);

      let payload = {
        search: emptySearch ? "" : searchText,
        page: currentPage,
        records_no: itemsPerPage,
        menu_type_id: menuType?.value,
        cuisine_id: menuCuisine?.value,
        taste_profile_id: menuTaste?.value,
      };

      const res = await ApiServices.menu.getTrendingMenus(payload);
      const { data } = res;

      if (data.code === 200) {
        const pageData = data?.data;
        const rows = Array.isArray(pageData?.data)
          ? pageData.data
          : Array.isArray(pageData)
            ? pageData
            : [];

        setAllVendors(rows);
        setCurrentPage(pageData?.current_page || 1);
        setTotalPages(
          pageData?.last_page ||
            Math.ceil((pageData?.total || rows.length) / (pageData?.per_page || itemsPerPage))
        );
      }
    } catch (err) {
      setAllVendors([]);
      setTotalPages(0);
      setErrorMessage(err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Vendor
  const handleDeleteVendor = async () => {
    try {
      setBtnLoading(true);

      const res = await ApiServices.menu.deleteMenu(openDeleteModal?.data?.id);
      const { data, message } = res;

      if (data.code === 200) {
        setBtnLoading(false);
        getVendorsListing();
        setOpenDeleteModal({ open: false, data: null });
        openSuccessModal({
          title: "Success!",
          message: "Trending Menu has been deleted successfully",
          onClickDone: (close) => {
            closeSuccessModel();
          },
        });
      }
    } catch (err) {
      setErrorMessage(err?.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // Pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      if (searchText.trim() !== "") {
        await getVendorsListing(false);
        setCurrentPage(1);
      }
    }
  };

  const [menuType, setMenuType] = useState("");
  const [menuTaste, setMenuTaste] = useState("");
  const [menuCuisine, setMenuCuisine] = useState("");

  const [allRecCeremonies, setAllRecCeremonies] = useState([]);
  const [allRecCeremonies1, setAllRecCeremonies1] = useState([]);
  const [allRecCeremonies2, setAllRecCeremonies2] = useState([]);

  const getMenuType = async () => {
    try {
      const res = await ApiServices.menu.getMenuType();
      const { data, message } = res;
      if (data.code === 200) {
        const formattedCeremonies = data?.data?.map((ceremony) => ({
          value: ceremony.id,
          label: ceremony.name,
        }));
        setAllRecCeremonies(formattedCeremonies);
      }
    } catch (err) {}
  };

  const getTasteProfile = async () => {
    try {
      const res = await ApiServices.menu.getTasteProfile();
      const { data, message } = res;
      if (data.code === 200) {
        const formattedCeremonies = data?.data?.map((ceremony) => ({
          value: ceremony.id,
          label: ceremony.name,
        }));
        setAllRecCeremonies1(formattedCeremonies);
      }
    } catch (err) {}
  };

  const getCuisine = async () => {
    try {
      const res = await ApiServices.menu.getCuisine();
      const { data, message } = res;
      if (data.code === 200) {
        const formattedCeremonies = data?.data?.map((ceremony) => ({
          value: ceremony.id,
          label: ceremony.name,
        }));
        setAllRecCeremonies2(formattedCeremonies);
      }
    } catch (err) {}
  };

  useEffect(() => {
    getVendorsListing();
  }, [currentPage, menuType, menuTaste, menuCuisine]);

  useEffect(() => {
    getMenuType();
    getTasteProfile();
    getCuisine();
  }, []);

  const [ceremonyDetail, setCeremonyDetial] = useState({});
  const [ceremonyDetailLoading, setCeremonyDetialLoading] = useState({});

  const getMenuById = async (id) => {
    if (!id) {
      setCeremonyDetial({});
      return;
    }

    try {
      setCeremonyDetialLoading(true);
      const res = await ApiServices.menu.getMenuById(id);
      const { data, message } = res;

      if (data.code === 200) {
        setCeremonyDetialLoading(false);
        setCeremonyDetial(res?.data?.data);
      }
    } catch (err) {
    } finally {
      setCeremonyDetialLoading(false);
    }
  };

  useEffect(() => {
    if (allVendors.length === 0) {
      setActiveRow(null);
      setCeremonyDetial({});
      return;
    }

    const activeItemStillExists = allVendors.some((item) => item?.id === activeRow);
    const nextActiveId = activeItemStillExists ? activeRow : allVendors[0]?.id;

    if (nextActiveId && nextActiveId !== activeRow) {
      setActiveRow(nextActiveId);
      getMenuById(nextActiveId);
    }
  }, [allVendors, activeRow]);

  return (
    <>
      <div className="venues-page-layout grid grid-cols-12 items-start gap-5 lg:items-stretch">
        <div className="col-span-12 lg:col-span-8">
          <div className="venues-list-card card flex min-h-[72vh] flex-col shadow-[0_12px_34px_rgba(15,23,42,0.14)]">
            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-4">
                <h2 className="shrink-0 text-xl font-semibold text-black">{t("menu.trending_menu")}</h2>
                <div className="relative ml-auto flex items-center">
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
                        getVendorsListing(true);
                      }
                    }}
                    onKeyDown={handleKeyPress}
                    className="block h-11 w-52 rounded-10 border border-primary-light-color px-4 pl-11 text-sm text-primary-color focus:border-primary-color-100 focus:ring-primary-color"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <Link to={MENU} className="inline-flex items-center text-sm font-medium text-secondary hover:underline">
                  <ArrowLeftIcon className="mr-2 h-5 w-4" />
                  {t("menu.backToMenuList")}
                </Link>
                {selectedItems.length > 0 && (
                  <Button
                    type="button"
                    title={t("buttons.import")}
                    onClick={handleImportClick}
                    buttonColor="border border-orange-400 bg-transparent"
                    className="h-9 px-4 !text-orange-500 shadow-none hover:bg-orange-50 hover:!text-orange-600 hover:shadow-none"
                  />
                )}
              </div>
            </div>
            <div className="mb-5 mt-6 grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-4">
              <Dropdown
                isSearchable
                options={allRecCeremonies}
                placeholder={t("menu.itemType")}
                title={t("menu.itemType")}
                value={menuType}
                onChange={(e) => {
                  setMenuType(e);
                }}
              />
              <Dropdown
                isSearchable
                options={allRecCeremonies2}
                placeholder={t("menu.cuisine")}
                title={t("menu.cuisine")}
                value={menuCuisine}
                onChange={(e) => {
                  setMenuCuisine(e);
                }}
              />
              <Dropdown
                isSearchable
                options={allRecCeremonies1}
                placeholder={t("menu.tasteProfile")}
                value={menuTaste}
                onChange={(e) => {
                  setMenuTaste(e);
                }}
                title={t("menu.tasteProfile")}
              />
              <Button
                  title={t("buttons.clearFilters")}
                  onClick={() => {
                    setMenuTaste(null);
                    setMenuCuisine(null);
                    setMenuType(null);
                  }}
                  className="px-3 py-2 text-sm w-auto"
                />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="-mx-6 mb-8 flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {TABLE_HEAD.map((head) => (
                        <th
                          key={head}
                          className="p-4 bg-white border-b border-gray-100 first:pl-6"
                          onClick={() => {
                            // Don't sort the checkbox column
                            if (head === t("menu.select")) return;
                            
                            let sortKey;
                            if (head === "Item Type") {
                              sortKey = "mene_type";
                            } else if (head === "Cuisine") {
                              sortKey = "cuisine";
                            } else if (head === "Taste Profile") {
                              sortKey = "taste_profile";
                            } else if (head === "Item Name") {
                              sortKey = "session";
                            } else {
                              sortKey = head.toLowerCase();
                            }
                            requestSort(sortKey);
                          }}
                        >
                          <p className="text-sm font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">
                            {head}
                            {head !== t("menu.select") && sortConfig.key ===
                              (head === "Item Type"
                                ? "mene_type"
                                : head === "Cuisine"
                                  ? "cuisine"
                                  : head === "Taste Profile"
                                    ? "taste_profile"
                                    : head === "Item Name"
                                      ? "session"
                                      : head.toLowerCase()) && sortConfig.direction === "asc" ? (
                              <ChevronUpIcon className="inline-block w-3.5 h-4" />
                            ) : (
                              head !== t("menu.select") && <ChevronDownIcon className="inline-block w-3.5 h-4" />
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
                          <td className="py-3 pr-4 pl-4 flex gap-x-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.some(selected => selected.id === item.id)}
                              onChange={(e) => handleCheckboxChange(e, item)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary"
                            />
                            <p className="text-sm font-normal text-primary-color 3xl:text-sm">{item?.menu_type?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-sm font-normal text-primary-color 3xl:text-sm">{item?.cuisine?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-sm font-normal text-primary-color 3xl:text-sm">{item?.taste_profile?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-sm font-normal text-primary-color 3xl:text-sm">{item?.name || "-"}</p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Render "No Data" message
                      <tr>
                        <td colSpan="4">
                          <div className="flex min-h-[43vh] flex-col items-center justify-center px-4 text-center">
                            <Lottie options={emptyFolderAnimation} width={170} height={170} />
                            <h4 className="-mt-4 text-base font-semibold text-black">{t("menu.noTrendingItems")}</h4>
                            <p className="mt-2 text-sm text-primary-light-color">{t("menu.tryChangingFilters")}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {items.length > 0 && <div className="absolute bottom-4">
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
                  nextLabel={<ChevronRightIcon className="w-5 h-5" />}
                  previousLabel={<ChevronLeftIcon className="w-5 h-5" />}
                />
              </div>}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="venues-details-card card flex h-[72vh] flex-col overflow-hidden shadow-[0_12px_34px_rgba(15,23,42,0.14)] lg:sticky lg:top-0">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : detail ? (
              <div className="-mx-1 -my-1 flex min-h-0 flex-1 flex-col px-1 py-1">
                <div className="shrink-0">
                  <h2 className="text-xl font-semibold text-black">{detail?.name || "Menu Item"}</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {[detail?.menu_type?.name, detail?.cuisine?.name].filter(Boolean).join(" · ") || "-"}
                  </p>
                </div>

                <div className="venue-details-scroll -mr-2 mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
                  <section>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                      <SparklesIcon className="h-5 w-5" />
                      <h3 className="text-sm font-semibold">{t("menu.menuItemDetails")}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-5">
                      <div>
                        <p className="text-xs text-gray-600">{t("menu.itemType")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.menu_type?.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t("menu.cuisine")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.cuisine?.name || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600">{t("menu.tasteProfile")}</p>
                        <p className="mt-1 text-sm font-medium text-black">{detail?.taste_profile?.name || "-"}</p>
                      </div>
                      {detail?.notes && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-600">{t("headings.notes")}</p>
                          <p className="mt-1 text-sm leading-6 text-black">{detail.notes}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {detail?.image && (
                    <section className="mt-8">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                        <PhotoIcon className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">{t("headings.relevantImages")}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-5">
                        <PhotoProvider>
                          <PhotoView src={mediaUrl + detail.image}>
                            <img
                              src={mediaUrl + detail.image}
                              alt={detail?.name || "Menu item"}
                              className="h-24 w-full cursor-pointer rounded-10 object-cover"
                            />
                          </PhotoView>
                        </PhotoProvider>
                      </div>
                    </section>
                  )}

                  {socialMediaLinks.length > 0 && (
                    <section className="mt-8 pb-2">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-secondary">
                        <LinkIcon className="h-5 w-5" />
                        <h3 className="text-sm font-semibold">{t("headings.socialMediaLinks")}</h3>
                      </div>
                      <div className="space-y-3 pt-5">
                        {socialMediaLinks.map((link, index) => (
                          <a
                            key={`${link.url}-${index}`}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block break-all text-sm font-medium text-secondary hover:underline"
                          >
                            {link?.name ? `${link.name}: ` : ""}
                            {link.url}
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div>
                  <Lottie options={emptyFolderAnimation} width={170} height={170} />
                  <h4 className="-mt-4 text-base font-semibold text-black">{t("menu.noMenuItemSelected")}</h4>
                  <p className="mt-2 text-sm text-primary-light-color">{t("menu.selectMenuItemToView")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddMenuModal
        label={t("menu.addMenu")}
        isOpen={addMenuModalOpen}
        setIsOpen={setAddMenuModalOpen}
        refreshData={() => {
          setSelectedItems([]);
          setSelectedTrendingItems([]);
          getVendorsListing();
        }}
        data={null}
        setModalData={setModalData}
        preselectedItems={selectedTrendingItems}
      />

      {/* Delete Modal*/}
      <ConfirmationModal
        data={openDeleteModal.data}
        isOpen={openDeleteModal.open}
        handleSubmit={handleDeleteVendor}
        message="Are you sure you want to delete this Trending Menu?"
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default Vendors;
