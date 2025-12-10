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
import TitleValue from "../../components/common/TitleValue";
import { useThemeContext } from "../../context/GlobalContext";
import { useSortableData } from "../../hooks/useSortableData";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import AddMenuModal from "./AddMenuModal"; // Import the AddMenuModal component
import AddTrendingModal from "./AddTrendingModal"; // Import the new AddTrendingModal component
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, MagnifyingGlassIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/common/Dropdown";
import { mediaUrl } from "@utilities/config";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";

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
  const [addTrendingModalOpen, setAddTrendingModalOpen] = useState(false); // New state for trending modal
  const [selectedTrendingItems, setSelectedTrendingItems] = useState([]);

  // Active Row
  const handleRowClick = (id) => {
    setActiveRow(id);
    getMenuById(id);
  };

  // Detail of selected row
  const detail = allVendors?.find((item) => item?.id === (activeRow || allVendors[0]?.id));

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
      id: item?.id
    }));
    
    setSelectedTrendingItems(formattedItems);
    setAddTrendingModalOpen(true); // Open the trending modal instead of menu modal
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
        status: "trending",
      };

      const res = await ApiServices.menu.getTrendingMenus(payload);
      const { data, message } = res;

      if (data.code === 200) {
        setLoading(false);
        setAllVendors(data.data.data);
        setCurrentPage(data?.data?.current_page);
        setTotalPages(Math.ceil(data?.data?.total / data?.data?.per_page));
      }
    } catch (err) {
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

  useEffect(() => {
    setActiveRow(items[0]?.id);
    getMenuById(items[0]?.id);
  }, [items]);

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

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <div className="card min-h-[82vh]">
            <div className="flex justify-between">
              <h3 className="heading">Vendors</h3>
              <div className="flex gap-x-3 justify-between items-center w-full">
                <Link to={MENU}>
                  <div className={`flex mb-5 text-base font-medium cursor-pointer text-secondary hover:underline`}>
                    <ArrowLeftIcon className="mr-2 w-4 h-6 text-secondary" />
                    <span>{t("menu.backToMenuList")}</span>
                  </div>
                </Link>
                
                <div className="flex items-center gap-x-5">

                {/* Import Button - Only show when items are selected */}
                {selectedItems.length > 0 && (
                  <Button 
                    title={`Import Selected (${selectedItems.length})`} 
                    onClick={handleImportClick} 
                    buttonColor="bg-secondary"
                  />
                )}
                
                <div className="flex relative items-center">
                  <div className="flex absolute inset-y-0 left-0 z-20 items-center pl-4 pointer-events-none">
                    <MagnifyingGlassIcon className="w-5 h-5 text-primary-light-color" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    placeholder={t("placeholders.search") + "..."}
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      if (e.target.value.trim() === "") {
                        getVendorsListing(true);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    className="block px-4 pl-11 w-52 h-11 text-sm border focus:border-primary-color-100 rounded-10 border-primary-light-color text-primary-color focus:ring-primary-color 3xl:w-full"
                  />
                </div>
                </div>
              </div>
            </div>
            <div className="mt-7 mb-7 grid gap-4 items-end grid-cols-[1fr_1fr_1fr_auto]">
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
                  title="Clear"
                  onClick={() => {
                    setMenuTaste(null);
                    setMenuCuisine(null);
                    setMenuType(null);
                  }}
                  className="px-3 py-2 text-sm w-auto"
                />
            </div>
            <div className="mt-5">
              <div className="overflow-x-auto -mx-6 mb-8">
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
                          <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">
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
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.menu_type?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.cuisine?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.taste_profile?.name || "-"}</p>
                          </td>
                          <td className="py-3 pl-4 3xl:px-4">
                            <p className="text-xs font-normal text-primary-color 3xl:text-sm">{item?.name || "-"}</p>
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
                  nextLabel={<ChevronRightIcon className="w-5 h-5" />}
                  previousLabel={<ChevronLeftIcon className="w-5 h-5" />}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="card min-h-[82vh]">
            {loading ? (
              <Skeleton count={8} height={50} className="mt-3" />
            ) : items.length > 0 ? (
              <>
                <div className="mt-6">
                  <h2 className="mb-5 sub-heading">{t("headings.otherInfo")}</h2>

                  <div className="mt-2">
                    {detail?.image !== null && (
                      <div className="w-full">
                        <h3 className="mb-5 text-xs text-info-color">{t("headings.relevantImages")}</h3>
                        <div className="grid grid-cols-3 gap-2 w-full">
                          <PhotoProvider>
                            <PhotoView src={mediaUrl + detail?.image}>
                              <img src={mediaUrl + detail?.image} alt="image" className="object-cover w-full h-full cursor-pointer rounded-10" />
                            </PhotoView>
                          </PhotoProvider>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <h2 className="mb-5 sub-heading">{t("headings.socialMediaLinks")}</h2>
                    <div className="flex flex-wrap gap-5">
                      {detail?.social_media_links?.length > 0 ? (
                        detail.social_media_links.map((item, index) => (
                          <TitleValue key={index} isLink title={item.name.charAt(0).toUpperCase() + item.name.slice(1)} value={item?.url || "-"} />
                        ))
                      ) : (
                        <p>-</p>
                      )}
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

      {/* Add Menu Modal - Keep for reference but not used now */}
      {/* 
      <AddMenuModal
        label={t("menu.addMenu")}
        isOpen={addMenuModalOpen}
        setIsOpen={setAddMenuModalOpen}
        refreshData={getVendorsListing}
        data={null}
        setModalData={setModalData}
        preselectedItems={selectedTrendingItems}
      />
      */}

      {/* Add Trending Modal - New modal for adding trending items to existing menus */}
      <AddTrendingModal
        isOpen={addTrendingModalOpen}
        setIsOpen={setAddTrendingModalOpen}
        selectedTrendingItems={selectedTrendingItems}
        setSelectedTrendingItems={setSelectedTrendingItems} // Added setter function
        refreshData={getVendorsListing}
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