import Input from "./common/Input";
import Button from "./common/Button";
import Dropdown from "./common/Dropdown";
import ApiServices from "../api/services";
import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "../context/GlobalContext";
import { CheckIcon, EnvelopeIcon, TrashIcon, XMarkIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

export default function GiftAllocationModal({ label, isOpen, setIsOpen, allocateData, eventId, onSuccess, isBulkAllocation = false }) {
  console.log("isBulkAllocation", isBulkAllocation);
  console.log("allocateData", allocateData);
  const { eventSelect, allCeremonies, getCeremonies, allGifts, btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel, getGifts } =
    useThemeContext();
  const { t } = useTranslation("common");

  const [items, setItems] = useState([{ ceremony: "", gift: "", quantity: "", note: "" }]);
  const [errors, setErrors] = useState([{ ceremony: "", gift: "", quantity: "", note: "" }]);

  // For bulk allocation - store selected contacts
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAllContacts, setSelectAllContacts] = useState(false);

  const handleInputChange = (value, index, field) => {
    const updatedItems = items.map((item, idx) => {
      if (idx === index) {
        const updatedValue = field === "ceremony" || field === "gift" ? value : value.target.value;
        return { ...item, [field]: updatedValue };
      }
      return item;
    });
    setItems(updatedItems);

    const updatedErrors = errors.map((error, idx) => {
      if (idx === index) {
        return { ...error, [field]: "" };
      }
      return error;
    });
    setErrors(updatedErrors);
  };

  const addNewFieldSet = (e) => {
    e.preventDefault();
    let isValid = true;

    const newErrors = items.map((currentItem) => {
      let itemError = { ceremony: "", gift: "", quantity: "" };

      if (!currentItem.ceremony) {
        itemError.ceremony = "Required";
        isValid = false;
      }

      if (!currentItem.gift) {
        itemError.gift = "Required";
        isValid = false;
      }

      if (!currentItem.quantity) {
        itemError.quantity = "Required";
        isValid = false;
      }

      return itemError;
    });

    setErrors(newErrors);

    if (isValid) {
      setItems([...items, { ceremony: "", gift: "", quantity: "", note: "" }]);
      setErrors([...errors, { ceremony: "", gift: "", quantity: "" }]);
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    const updatedErrors = errors.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    setErrors(updatedErrors);
  };

  const isValidForm = () => {
    let isValidData = true;

    // For bulk allocation, check if at least one contact is selected
    if (isBulkAllocation && selectedContacts.length === 0) {
      alert("Please select at least one contact for gift allocation");
      return false;
    }

    const newErrors = errors.map((error, index) => {
      const currentItem = items[index];
      let itemError = { ceremony: "", gift: "", quantity: "" };

      if (!currentItem.ceremony) {
        itemError.ceremony = "Required";
        isValidData = false;
      }

      if (!currentItem.gift) {
        itemError.gift = "Required";
        isValidData = false;
      }

      if (!currentItem.quantity) {
        itemError.quantity = "Required";
        isValidData = false;
      }
      return itemError;
    });
    setErrors(newErrors);
    return isValidData;
  };

  function convertDataForSingle(initialData, eventId, userId) {
    const allAllocations = [];
    
    // Add existing gifts for the user
    if (allocateData?.gift && allocateData.gift.length > 0) {
      allocateData.gift.forEach((existingGift) => {
        allAllocations.push({
          quantity: existingGift?.pivot?.quantity || 1,
          description: existingGift?.pivot?.description || "",
          status: "Allocated",
          event_id: eventSelect,
          ceremony_id: existingGift.ceremony_id,
          gift_id: existingGift.id,
          user_id: userId,
        });
      });
    }
    
    // Add new gifts
    initialData.forEach((item) => {
      allAllocations.push({
        quantity: parseInt(item?.quantity),
        description: item?.note,
        status: "Allocated",
        event_id: eventSelect,
        ceremony_id: item?.ceremony?.value,
        gift_id: item?.gift?.value,
        user_id: userId,
      });
    });
    
    return allAllocations;
  }

  function convertDataForBulk(initialData, eventId, userIds) {
    const allAllocations = [];
    
    userIds.forEach((userId) => {
      // Find the user's existing gifts
      const user = Array.isArray(allocateData) 
        ? allocateData.find(contact => contact.uuid === userId)
        : (allocateData?.uuid === userId ? allocateData : null);
      
      // Add existing gifts for this user
      if (user && user.gift && user.gift.length > 0) {
        user.gift.forEach((existingGift) => {
          allAllocations.push({
            quantity: existingGift?.pivot?.quantity || 1,
            description: existingGift?.pivot?.description || "",
            status: "Allocated",
            event_id: eventSelect,
            ceremony_id: existingGift.ceremony_id,
            gift_id: existingGift.id,
            user_id: userId,
          });
        });
      }
      
      // Add new gifts for this user
      initialData.forEach((item) => {
        allAllocations.push({
          quantity: parseInt(item?.quantity),
          description: item?.note,
          status: "Allocated",
          event_id: eventSelect,
          ceremony_id: item?.ceremony?.value,
          gift_id: item?.gift?.value,
          user_id: userId,
        });
      });
    });
    
    return allAllocations;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      setBtnLoading(true);

      try {
        let payload;

        if (isBulkAllocation) {
          // Bulk allocation for selected contacts
          payload = convertDataForBulk(items, eventId, selectedContacts);
        } else {
          // Single contact allocation
          const userId = allocateData?.uuid;
          payload = convertDataForSingle(items, eventId, userId);
        }

        const res = await ApiServices.allocateGift.allocateGift(payload);
        const { data, message } = res;

        if (data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          openSuccessModal({
            title: "Success!",
            message: isBulkAllocation ? `Gifts have been allocated to ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}!` : "Gift has been Allocated!",
            onClickDone: (close) => {
              closeSuccessModel();
              onSuccess();
            },
          });
        }
      } catch (err) {
        setBtnLoading(false);
        console.error("Error allocating gifts:", err);
      }
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setBtnLoading(false);
    setItems([{ ceremony: "", gift: "", quantity: "", note: "" }]);
    setErrors([{ ceremony: "", gift: "", quantity: "" }]);
    // Don't reset selectedContacts here as it's handled in the useEffect
  };

  // Handle contact selection for bulk allocation
  const handleContactSelection = (contactId, isSelected) => {
    if (isSelected) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
    }
  };

  const handleSelectAllContacts = (isSelected) => {
    setSelectAllContacts(isSelected);
    if (isSelected && Array.isArray(allocateData)) {
      setSelectedContacts(allocateData.map((contact) => contact.uuid));
    } else {
      setSelectedContacts([]);
    }
  };

  // Update selected contacts when individual contact is toggled
  useEffect(() => {
    if (isBulkAllocation && Array.isArray(allocateData)) {
      const isAllSelected = allocateData.length > 0 && selectedContacts.length === allocateData.length;
      setSelectAllContacts(isAllSelected);
    }
  }, [selectedContacts, allocateData, isBulkAllocation]);

  // Auto-select all contacts by default when modal opens for bulk allocation
  useEffect(() => {
    if (isOpen && isBulkAllocation) {
      if (Array.isArray(allocateData) && allocateData.length > 0) {
        // Select all contacts by default
        const allContactIds = allocateData.map((contact) => contact.uuid);
        setSelectedContacts(allContactIds);
        setSelectAllContacts(true);
      } else if (allocateData?.uuid) {
        // Handle single contact in bulk mode
        setSelectedContacts([allocateData.uuid]);
        setSelectAllContacts(true);
      }
    } else if (!isOpen) {
      // Reset when modal closes
      setSelectedContacts([]);
      setSelectAllContacts(false);
    }
  }, [isOpen, isBulkAllocation, allocateData]);

  // Helper function to get unique gift allocations across all contacts
  const getUniqueGiftAllocations = (contacts) => {
    const uniqueAllocations = new Map();

    contacts.forEach((contact) => {
      if (contact.gift && contact.gift.length > 0) {
        contact.gift.forEach((giftItem) => {
          const key = `${giftItem.ceremony_id}-${giftItem.id}`;
          if (!uniqueAllocations.has(key)) {
            uniqueAllocations.set(key, {
              ceremony_id: giftItem.ceremony_id,
              gift_id: giftItem.id,
              gift_name: giftItem.name,
              quantity: giftItem.pivot?.quantity || 1,
              description: giftItem.pivot?.description || "",
            });
          }
        });
      }
    });

    return Array.from(uniqueAllocations.values());
  };

  useEffect(() => {
    if (isOpen) {
      console.log("allocateData", allocateData);

      if (!isBulkAllocation) {
        // Single contact allocation - existing logic
        const data = allocateData?.gift;
        console.log("data", data);

        if (data && data.length > 0) {
          const updatedItems = data?.map((item) => {
            const ceremonyObj = allCeremonies?.find((ceremony) => ceremony.value === item.ceremony_id);
            const giftObj = allGifts?.find((gift) => gift.value === item.id);

            return {
              ceremony: {
                value: ceremonyObj?.value,
                label: ceremonyObj?.label,
              },
              gift: {
                value: giftObj?.value,
                label: giftObj?.label,
              },
              quantity: item?.pivot?.quantity,
              note: item?.pivot?.description,
            };
          });

          setItems(updatedItems);
        } else {
          setItems([{ ceremony: "", gift: "", quantity: "", note: "" }]);
        }
      }
    }
  }, [isOpen, allCeremonies, allGifts, isBulkAllocation]);

  useLayoutEffect(() => {
    getCeremonies();
    getGifts();
  }, [isOpen]);

  // Get display name for modal header
  const getDisplayName = () => {
    if (isBulkAllocation) {
      if (Array.isArray(allocateData) && allocateData.length > 0) {
        return `${allocateData.length} contact${allocateData.length > 1 ? 's' : ''} from ${allocateData[0]?.group?.name || "group"}`;
      }
      return "bulk contacts";
    }
    return allocateData?.first_name + " " + (allocateData?.last_name || "");
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                <Dialog.Panel className="min-h-[600px] w-full max-w-4xl rounded-2xl bg-white p-4 text-center align-middle shadow-xl transition-all xl:max-w-5xl xl:p-6 3xl:max-w-6xl 3xl:p-8">
                  <div className="flex items-center gap-x-4 rounded-10 border bg-blue-400 p-4 font-poppins text-20 font-semibold leading-7 text-white">
                    {isBulkAllocation ? <UserGroupIcon className="h-10 w-10 text-white" /> : <EnvelopeIcon className="h-10 w-10 text-white" />}
                    <h3>
                      {t("giftAllocation.allocateGiftTo")} {getDisplayName()}
                    </h3>
                  </div>

                  {/* Contact Selection for Bulk Allocation - Show for ANY bulk allocation */}
                  {isBulkAllocation && (
                    <div className="mt-6 rounded-lg border border-gray-300 p-4">
                      <h4 className="mb-4 text-left text-lg font-semibold">Select Contacts for Gift Allocation</h4>

                      {/* Only show "Select All" if there are multiple contacts */}
                      {Array.isArray(allocateData) && allocateData.length > 1 && (
                        <div className="mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectAllContacts}
                              onChange={(e) => handleSelectAllContacts(e.target.checked)}
                              className="mr-2"
                            />
                            <span className="font-medium">Select All ({allocateData.length} contacts)</span>
                          </label>
                        </div>
                      )}

                      <div className="max-h-48 gap-3 overflow-y-auto flex flex-wrap">
                        {Array.isArray(allocateData) ? (
                          allocateData.map((contact) => (
                            <label key={contact.uuid} className="flex items-center rounded border p-2 hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={selectedContacts.includes(contact.uuid)}
                                onChange={(e) => handleContactSelection(contact.uuid, e.target.checked)}
                                className="mr-2"
                              />
                              <span className="text-[12px]">
                                {contact.salutation} {contact.first_name} {contact.last_name}
                              </span>
                            </label>
                          ))
                        ) : (
                          // Handle case where allocateData is not an array but isBulkAllocation is true
                          <label className="flex items-center rounded border p-2 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedContacts.includes(allocateData?.uuid)}
                              onChange={(e) => handleContactSelection(allocateData?.uuid, e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-[12px]">
                              {allocateData?.salutation} {allocateData?.first_name} {allocateData?.last_name}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        {selectedContacts.length} of {Array.isArray(allocateData) ? allocateData.length : 1} contact{Array.isArray(allocateData) && allocateData.length > 1 ? 's' : ''} selected
                      </div>
                    </div>
                  )}

                  <div>
                    <table className="mt-8 w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-400 px-2 py-2 text-start">{t("giftAllocation.ceremony")}</th>
                          <th className="border border-gray-400 px-2 py-2 text-start">{t("giftAllocation.gift")}</th>
                          <th className="border border-gray-400 px-2 py-2 text-start">{t("giftAllocation.quantity")}</th>
                          <th className="border border-gray-400 px-2 py-2 text-start">{t("headings.notes")}</th>
                          <th className="border border-gray-400 px-2 text-start">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-400 px-2 py-2">
                              <Dropdown
                                withoutTitle
                                options={allCeremonies}
                                withError={errors[index]?.ceremony}
                                value={item.ceremony}
                                onChange={(label) => handleInputChange(label, index, "ceremony")}
                              />
                            </td>
                            <td className="border border-gray-400 px-2 py-2">
                              <Dropdown
                                withoutTitle
                                options={allGifts}
                                withError={errors[index]?.gift}
                                value={item.gift}
                                onChange={(label) => handleInputChange(label, index, "gift")}
                              />
                            </td>
                            <td className="w-32 border border-gray-400 px-2 pb-3 pt-2">
                              <Input
                                type="number"
                                labelOnTop
                                withError={errors[index]?.quantity}
                                value={item.quantity}
                                onChange={(e) => handleInputChange(e, index, "quantity")}
                              />
                            </td>
                            <td className="border border-gray-400 px-2 pb-3 pt-2">
                              <Input type="text" labelOnTop value={item.note} onChange={(e) => handleInputChange(e, index, "note")} />
                            </td>
                            <td className="flex items-center justify-center gap-x-2 border-b border-r border-gray-400 px-2 py-4">
                              {items.length > 1 ? (
                                <Button icon={<TrashIcon className="w-5" />} className="w-1" onClick={() => handleDeleteItem(index)} />
                              ) : (
                                <div className="py-5"></div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <button className="float-left mt-4 rounded-lg bg-secondary px-4 py-2 text-white" onClick={addNewFieldSet}>
                      {t("giftAllocation.addAnotherSet")}
                    </button>
                  </div>

                  <div className="mt-64 flex justify-end gap-x-6 px-8">
                    <Button loading={btnLoading} title={t("buttons.save")} icon={<CheckIcon />} onClick={handleSubmit} />
                    <Button title={t("buttons.cancel")} icon={<XMarkIcon />} className="border-primary bg-primary" onClick={closeModal} />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}