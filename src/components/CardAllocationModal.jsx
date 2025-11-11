import Input from "./common/Input";
import Button from "./common/Button";
import Dropdown from "./common/Dropdown";
import ApiServices from "../api/services";
import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "../context/GlobalContext";
import { CheckIcon, EnvelopeIcon, TrashIcon, XMarkIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

export default function CardAllocationModal({ label, isOpen, setIsOpen, allocateData, eventId, onSuccess, isBulkAllocation = false }) {
  // useContext
  const { eventSelect, loading, setLoading, btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel } = useThemeContext();

  const { t } = useTranslation("common");

  // useState
  const [allInvitationCards, setAllInvitationCards] = useState([]);
  const [items, setItems] = useState([{ card: "", name: "" }]);
  const [errors, setErrors] = useState([{ card: "", name: "" }]);

  // For bulk allocation - store selected contacts
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAllContacts, setSelectAllContacts] = useState(false);

  const handleInputChange = (value, field, index) => {
    const updatedItems = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
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
      let itemError = { card: "", name: "" };

      if (!currentItem.card) {
        itemError.card = "Required";
        isValid = false;
      }

      if (!currentItem.name) {
        itemError.name = "Required";
        isValid = false;
      }

      return itemError;
    });

    setErrors(newErrors);

    if (isValid) {
      setItems([...items, { card: "", name: "" }]);
      setErrors([...errors, { card: "", name: "" }]);
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    const updatedErrors = errors.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    setErrors(updatedErrors);
  };

  // Handle form validation
  const isValidForm = () => {
    let isValidData = true;

    // For bulk allocation, check if at least one contact is selected
    if (isBulkAllocation && selectedContacts.length === 0) {
      alert("Please select at least one contact for card allocation");
      return false;
    }

    const newErrors = errors.map((error, index) => {
      const currentItem = items[index];
      let itemError = { card: "", name: "" };

      if (!currentItem.card) {
        itemError.card = "Required";
        isValidData = false;
      }

      if (!currentItem.name) {
        itemError.name = "Required";
        isValidData = false;
      }
      return itemError;
    });
    setErrors(newErrors);
    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isValidForm()) {
      setBtnLoading(true);

      try {
        if (isBulkAllocation) {
          // Bulk allocation - send all contact IDs in user_id key
          const payload = {
            event_id: eventSelect,
            user_id: selectedContacts,
            cards: items.map((item) => ({
              card_id: item?.card?.value,
              name_on_card: item?.name,
            })),
          };

          const res = await ApiServices.allocateCard.allocateCard(payload);
          const { data } = res;

          if (data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            openSuccessModal({
              title: "Success!",
              message: `Cards have been allocated to ${selectedContacts.length} contacts!`,
              onClickDone: (close) => {
                closeSuccessModel();
                onSuccess();
              },
            });
          }
        } else {
          // Single contact allocation
          const userId = allocateData?.uuid;
          if (userId && eventSelect) {
            const payload = {
              event_id: eventSelect,
              user_id: userId,
              cards: items.map((item) => ({
                card_id: item?.card?.value,
                name_on_card: item?.name,
              })),
            };

            const res = await ApiServices.allocateCard.allocateCard(payload);
            const { data } = res;

            if (data.code === 200) {
              setBtnLoading(false);
              setIsOpen(false);
              openSuccessModal({
                title: "Success!",
                message: "Card has been Allocated!",
                onClickDone: (close) => {
                  closeSuccessModel();
                  onSuccess();
                },
              });
            }
          } else {
            setBtnLoading(false);
            console.error("User ID and Event ID not found");
          }
        }
      } catch (err) {
        setBtnLoading(false);
        console.error("Error allocating cards:", err);
      }
    }
  };

  // Close Modal
  function closeModal() {
    setIsOpen(false);
    setBtnLoading(false);
    setItems([{ card: "", name: "" }]);
    setErrors([{ card: "", name: "" }]);
    setSelectedContacts([]);
    setSelectAllContacts(false);
  }

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

  // Helper function to get unique card allocations across all contacts
  const getUniqueCardAllocations = (contacts) => {
    const uniqueAllocations = new Map();

    contacts.forEach((contact) => {
      if (contact.card_allocation && contact.card_allocation.length > 0) {
        contact.card_allocation.forEach((cardItem) => {
          const key = `${cardItem.card_id}`;
          if (!uniqueAllocations.has(key)) {
            uniqueAllocations.set(key, {
              card_id: cardItem.card_id,
              card_name: cardItem.card?.name || '',
              name_on_card: cardItem.name_on_card || '',
            });
          }
        });
      }
    });

    return Array.from(uniqueAllocations.values());
  };

  // Initialize form data based on allocation type
  useEffect(() => {
    if (isOpen) {
      if (!isBulkAllocation) {
        // Single contact allocation - existing logic
        const data = allocateData?.card_allocation;

        if (data && data.length > 0) {
          const updatedItems = data.map((item) => {
            const cardObj = allInvitationCards.find((card) => card.value === item.card_id);

            return {
              card: {
                value: cardObj?.value,
                label: cardObj?.label,
              },
              name: item?.name_on_card,
            };
          });

          setItems(updatedItems);
        } else {
          setItems([{ card: "", name: "" }]);
        }
      } 
    }
  }, [isOpen, allInvitationCards, isBulkAllocation, allocateData]);

  // Get Invitation Cards
  const getInvitationCards = async () => {
    try {
      setLoading(true);

      let payload = {
        records_no: 10000000000,
        event_id: eventSelect
      };

      const res = await ApiServices.invitation_card.getInvitationCards(payload);
      const { data } = res;

      if (data?.code === 200) {
        setLoading(false);
        const formattedCards = data?.data?.data?.map((card) => ({
          value: card.id,
          label: card.name,
        }));

        setAllInvitationCards(formattedCards);
      }
    } catch (err) {
      console.error("Error fetching invitation cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    getInvitationCards();
  }, [isOpen]);

  // Get display name for modal header
  const getDisplayName = () => {
    if (isBulkAllocation) {
      if (Array.isArray(allocateData) && allocateData.length > 0) {
        return `${allocateData.length} contacts from ${allocateData[0]?.group?.name || "group"}`;
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
                <Dialog.Panel className="min-h-[600px] w-full max-w-4xl overflow-hidden rounded-2xl bg-white p-4 text-center align-middle shadow-xl transition-all xl:max-w-5xl xl:p-6 3xl:max-w-6xl 3xl:p-8">
                  <div className="flex items-center gap-x-4 rounded-10 border bg-blue-400 p-4 font-poppins text-20 font-semibold leading-7 text-white">
                    {isBulkAllocation ? <UserGroupIcon className="h-10 w-10 text-white" /> : <EnvelopeIcon className="h-10 w-10 text-white" />}
                    <h3>
                      {t("cardAllocation.allocateCardTo")} {getDisplayName()}
                    </h3>
                  </div>

                  {/* Contact Selection for Bulk Allocation */}
                  {isBulkAllocation && Array.isArray(allocateData) && (
                    <div className="mt-6 rounded-lg border border-gray-300 p-4">
                      <h4 className="mb-4 text-left text-lg font-semibold">Select Contacts for Card Allocation</h4>

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

                      <div className="max-h-48 flex flex-wrap gap-3 overflow-y-auto">
                        {allocateData.map((contact) => (
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
                        ))}
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        {selectedContacts.length} of {allocateData.length} contacts selected
                      </div>
                    </div>
                  )}

                  <div>
                    <table className="mt-8 w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-400 px-2 py-2 text-start">{t("cardAllocation.card")}</th>
                          <th className="border border-gray-400 px-2 py-2 text-start">{t("cardAllocation.nameOnCard")}</th>
                          <th className="border border-gray-400 px-2 text-start">{t("headings.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-400 px-2 py-2">
                              <Dropdown
                                options={allInvitationCards}
                                withoutTitle
                                value={item.card}
                                withError={errors[index]?.card}
                                onChange={(label) => handleInputChange(label, "card", index)}
                              />
                            </td>
                            <td className="border border-gray-400 px-2 pb-3 pt-2">
                              <Input
                                type="text"
                                labelOnTop
                                value={item.name}
                                withError={errors[index]?.name}
                                onChange={(e) => handleInputChange(e.target.value, "name", index)}
                              />
                            </td>
                            <td className="flex items-center justify-center gap-x-2 border border-gray-400 px-3 py-4">
                              {items.length > 1 ? (
                                <Button
                                  icon={<TrashIcon className="w-5" />}
                                  className="w-1"
                                  onClick={() => handleDeleteItem(index)}
                                  buttonColor="bg-red-500"
                                />
                              ) : (
                                <div className="py-5"></div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button className="float-left mt-4 rounded-lg bg-secondary px-4 py-2 text-white" onClick={addNewFieldSet}>
                      {t("cardAllocation.addAnotherSet")}
                    </button>
                  </div>

                  <div className="mt-64 flex justify-end gap-x-6 px-8">
                    <Button loading={btnLoading} title={t("buttons.save")} icon={<CheckIcon />} onClick={handleSubmit} />
                    <Button title={t("buttons.cancel")} icon={<XMarkIcon />} buttonColor="bg-red-500" className="border-primary bg-primary" onClick={closeModal} />
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