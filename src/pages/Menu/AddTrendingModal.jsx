import React from "react";
import Button from "../../components/common/Button";
import ApiServices from "../../api/services";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useThemeContext } from "../../context/GlobalContext";
import Dropdown from "../../components/common/Dropdown";
import Spinner from "../../components/common/Spinner";
import { useTranslation } from "react-i18next";
import { mediaUrl } from "../../utilities/config";
import Input from "../../components/common/Input";
import ChooseFile from "../../components/common/ChooseFile";
import moment from "moment";

const AddTrendingModal = ({ 
  isOpen, 
  setIsOpen, 
  selectedTrendingItems, 
  setSelectedTrendingItems, // Add this prop to make trending items editable
  refreshData 
}) => {
  const { t } = useTranslation("common");

  // Context
  const {
    eventSelect,
    setBtnLoading,
    btnLoading,
    openSuccessModal,
    closeSuccessModel,
  } = useThemeContext();

  // States
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedMenuError, setSelectedMenuError] = useState("");
  const [allMenus, setAllMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [selectedMenuDetails, setSelectedMenuDetails] = useState(null);
  
  // States for manual menu items
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState([]);

  // Get all menus for the dropdown
  const getAllMenus = async () => {
    setMenusLoading(true);
    try {
      const payload = {
        event_id: eventSelect,
        records_no: 1000, // Get all menus
      };

      const res = await ApiServices.menu.getMenus(payload);
      if (res.data.code === 200) {
        const formattedMenus = res.data.data.data.map((menu) => ({
          value: menu.id,
          label: `${menu.session} - ${moment.unix(menu.date).format("D MMM YYYY")} (${moment(menu.start_time, "HH:mm").format("hh:mm A")} - ${moment(menu.end_time, "HH:mm").format("hh:mm A")})`,
          data: menu
        }));
        setAllMenus(formattedMenus);
      }
    } catch (err) {
      console.error("Error fetching menus:", err);
    } finally {
      setMenusLoading(false);
    }
  };

  // Handle trending item changes
  const handleTrendingItemChange = (index, field, value) => {
    const updatedItems = selectedTrendingItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setSelectedTrendingItems(updatedItems);
  };
  const handleInputChange = (e, index, field) => {
    setItems((prevItems) => {
      return prevItems.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: e.target.value };
        }
        return item;
      });
    });

    setErrors((prevErrors) => {
      return prevErrors.map((error, idx) => {
        if (idx === index) {
          return { ...error, [field]: "" };
        }
        return error;
      });
    });
  };

  // Add new menu item
  const addNewFieldSet = (e) => {
    e.preventDefault();
    setItems([...items, { item: "", type: "", quantity: "", description: "", img: null, id: "" }]);
    setErrors([...errors, { item: "", type: "", quantity: "", description: "" }]);
  };

  // Delete menu item
  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    const updatedErrors = errors.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    setErrors(updatedErrors);
  };

  // Handle file change for menu item images
  const handleFileChange = (e, index) => {
    const newFile = e.target.files[0];
    const updatedItems = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, img: newFile };
      }
      return item;
    });
    setItems(updatedItems);
  };

  // Remove file from menu item
  const handleRemoveFile = (index) => {
    const updatedItems = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, img: null };
      }
      return item;
    });
    setItems(updatedItems);
  };
  const handleMenuChange = (selectedOption) => {
    setSelectedMenu(selectedOption);
    setSelectedMenuError("");
    if (selectedOption) {
      // Use the data that's already available from the dropdown option
      setSelectedMenuDetails(selectedOption.data);
    } else {
      setSelectedMenuDetails(null);
    }
  };

  // Validation
  const isValidForm = () => {
    let isValid = true;

    if (!selectedMenu) {
      setSelectedMenuError("Required");
      isValid = false;
    } else {
      setSelectedMenuError("");
    }

    return isValid;
  };

  // Handle submit - Add trending items to selected menu
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidForm()) return;

    try {
      setBtnLoading(true);

      // Get existing menu items
      const existingItems = selectedMenuDetails?.menu_items || [];
      
      // Combine existing items with selected trending items
      const combinedMenuItems = [
        ...existingItems.map((item) => ({
          name: item.name,
          type: item.type,
          qty: item.qty,
          notes: item.notes,
          image: item.image,
          menu_item_id: item.menu_item_id || "",
        })),
        ...selectedTrendingItems.map((item) => ({
          name: item.item,
          type: item.type,
          qty: item.quantity,
          notes: item.description,
          image: item.img,
          menu_item_id: item.id,
          recommended_trending_type: "trending"
        }))
      ];

      // Create FormData with existing menu data + new trending items
      let formData = new FormData();
      formData.append("date", selectedMenuDetails.date);
      formData.append("session", selectedMenuDetails.session);
      formData.append("start_time", selectedMenuDetails.start_time);
      formData.append("end_time", selectedMenuDetails.end_time);
      formData.append("notes", selectedMenuDetails.notes || "");
      formData.append("event_id", eventSelect);

      // Add all menu items (existing + new trending items)
      combinedMenuItems.forEach((item, index) => {
        formData.append(`menu_items[${index}][name]`, item.name);
        formData.append(`menu_items[${index}][type]`, item.type);
        formData.append(`menu_items[${index}][qty]`, item.qty);
        formData.append(`menu_items[${index}][notes]`, item.notes);
        
        if (item.image && typeof item.image === 'string') {
          // Existing image (URL string)
          formData.append(`menu_items[${index}][image]`, item.image);
        } else if (item.image && typeof item.image === 'object') {
          // New image file
          formData.append(`menu_items[${index}][image]`, item.image);
        }
        
        if (item.menu_item_id) {
          formData.append(`menu_items[${index}][menu_item_id]`, item.menu_item_id);
        }
        
        if (item.recommended_trending_type) {
          formData.append(`menu_items[${index}][recommended_trending_type]`, item.recommended_trending_type);
        }
      });

      // Update the menu
      const response = await ApiServices.menu.updateMenu(selectedMenu.value, formData);

      if (response.data.code === 200) {
        setBtnLoading(false);
        setIsOpen(false);
        clearAllData();
        refreshData();
        openSuccessModal({
          title: t("message.success"),
          message: t("menu.trendingItemsAddedSuccess") || "Trending items added to menu successfully!",
          onClickDone: closeSuccessModel,
        });
      } else {
        setBtnLoading(false);
      }
    } catch (err) {
      console.error("Error:", err);
      setBtnLoading(false);
    }
  };

  // Clear all data
  const clearAllData = () => {
    setSelectedMenu(null);
    setSelectedMenuDetails(null);
    setSelectedMenuError("");
    setItems([]);
    setErrors([]);
  };

  // Close modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setBtnLoading(false);
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      getAllMenus();
      // Initialize with one empty item for manual entry
      if (items.length === 0) {
        setItems([{ item: "", type: "", quantity: "", description: "", img: null, id: "" }]);
        setErrors([{ item: "", type: "", quantity: "", description: "" }]);
      }
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
              <Dialog.Panel className="w-full overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all md:max-w-4xl xl:max-w-6xl">
                <div className="mb-5 flex items-center justify-between">
                  <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                    {"Add Trending Items to Menu"}
                  </Dialog.Title>
                  <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                </div>

                <form>
                  <div className="h-[750px] overflow-y-auto p-2 md:h-[550px] lg:h-[550px] xl:h-[650px] 2xl:h-[650px]">
                    
                    {/* Menu Selection */}
                    <div className="mb-7">
                      <div className="label mb-2 text-secondary text-left">{ "Select Menu"}</div>
                      <div className="w-full">
                        {menusLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Spinner />
                          </div>
                        ) : (
                          <Dropdown
                            isRequired
                            title={ "Select Menu"}
                            placeholder={"Choose a menu to add items to"}
                            options={allMenus}
                            withError={selectedMenuError}
                            value={selectedMenu}
                            onChange={handleMenuChange}
                          />
                        )}
                      </div>
                    </div>

                    {/* Selected Trending Items Preview - Now Editable */}
                    {selectedTrendingItems.length > 0 && (
                      <div className="mb-7">
                        <div className="label mb-4 text-secondary text-left">
                          {"Selected Trending Items"} ({selectedTrendingItems.length})
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto border rounded-lg">
                          {selectedTrendingItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 border-b p-4 last:border-b-0">
                              <div className="flex-1">
                                <Input 
                                  placeholder="Item" 
                                  labelOnTop 
                                  value={item.item} 
                                  disabled 
                                />
                              </div>
                              <div className="flex-1">
                                <Input 
                                  placeholder="Type" 
                                  labelOnTop 
                                  value={item.type} 
                                  disabled 
                                />
                              </div>
                              <div className="flex-1">
                                <Input 
                                  placeholder="Quantity" 
                                  labelOnTop 
                                  value={item.quantity} 
                                  onChange={(e) => handleTrendingItemChange(index, 'quantity', e.target.value)}
                                />
                              </div>
                              <div className="flex-1">
                                <Input 
                                  placeholder="Description" 
                                  labelOnTop 
                                  value={item.description} 
                                  onChange={(e) => handleTrendingItemChange(index, 'description', e.target.value)}
                                />
                              </div>
                              <div className="w-24">
                                {item.img ? (
                                  <img 
                                    src={typeof item.img === 'string' ? `${mediaUrl}${item.img}` : URL.createObjectURL(item.img)} 
                                    alt="item" 
                                    className="h-16 w-16 rounded-lg object-cover" 
                                  />
                                ) : (
                                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-400">No Image</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manual Menu Items Section */}
                    <div className="mb-7">
                      <div className="label mb-4 text-secondary text-left">
                        {"Additional Menu Items"}
                      </div>
                      
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <div key={index} className="flex w-full items-center space-x-3">
                            <Input
                              placeholder="Item"
                              labelOnTop
                              value={item?.item}
                              onChange={(e) => handleInputChange(e, index, "item")}
                              error={errors[index]?.item}
                            />
                            <Input
                              placeholder="Type"
                              labelOnTop
                              value={item?.type}
                              onChange={(e) => handleInputChange(e, index, "type")}
                              error={errors[index]?.type}
                            />
                            <Input
                              placeholder="Quantity"
                              labelOnTop
                              type="text"
                              value={item?.quantity}
                              onChange={(e) => handleInputChange(e, index, "quantity")}
                              error={errors[index]?.quantity}
                            />
                            <Input
                              placeholder="Description"
                              labelOnTop
                              value={item?.description}
                              onChange={(e) => handleInputChange(e, index, "description")}
                              error={errors[index]?.description}
                            />
                            
                            <ChooseFile
                              placeholderText="Choose Image"
                              selectedFile={item?.img}
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => handleFileChange(e, index)}
                              onClickCross={() => handleRemoveFile(index)}
                              uni={`fileInput-${index}`}
                              noText
                              style
                            />

                            {index > 0 && (
                              <MinusCircleIcon
                                className="ml-1.5 inline-block h-10 w-10 cursor-pointer text-red-500"
                                onClick={() => handleDeleteItem(index)}
                              />
                            )}
                          </div>
                        ))}

                        <button 
                          className="mt-4 rounded-lg bg-secondary px-4 py-2 text-white flex items-center gap-2" 
                          onClick={addNewFieldSet}
                          type="button"
                        >
                          <PlusCircleIcon className="h-4 w-4" />
                          {t("menu.addNewFieldSet") || "Add New Item"}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mx-auto mt-28 grid w-8/12 grid-cols-2 gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={"Add to Menu"}
                        type="submit"
                        onClick={handleSubmit}
                        loading={btnLoading}
                        disabled={!selectedMenu || (selectedTrendingItems.length === 0 && items.every(item => !item.item))}
                      />
                      <Button 
                        icon={<XMarkIcon />} 
                        title={t("buttons.cancel")} 
                        type="button" 
                        buttonColor="bg-red-500" 
                        onClick={closeModal} 
                      />
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddTrendingModal;