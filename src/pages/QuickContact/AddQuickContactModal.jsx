import React, { useState } from "react";
import { Fragment, useEffect } from "react";
import ApiServices from "../../api/services";
import Button from "../../components/common/Button";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const AddQuickContactModal = ({ isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");

  // useContext
  const { eventSelect, openSuccessModal, btnLoading, setBtnLoading, closeSuccessModel } = useThemeContext();

  // useState
  const [checkedContacts, setCheckedContacts] = useState([]);
  const [allContactList, setAllContactList] = useState([]);
  const [checkedContactsError, setCheckedContactsError] = useState("");

  // Handle checkbox change
  const handleCheckboxChange = (contactName) => {
    if (checkedContacts.includes(contactName)) {
      setCheckedContacts(checkedContacts.filter((name) => name !== contactName));
      setCheckedContactsError("");
    } else {
      setCheckedContacts([...checkedContacts, contactName]);
      setCheckedContactsError("");
    }
  };

  // Handle form validation
  const isValidForm = () => {
    let isValidData = true;
    if (checkedContacts.length === 0) {
      setCheckedContactsError("Please select at least one Contact");
      isValidData = false;
    } else {
      setCheckedContactsError("");
    }
    return isValidData;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Form validation
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          mode: "add",
          user_ids: checkedContacts,
          event_id: eventSelect,
        };
        const response = await ApiServices.quickContact.addQuickContact(payload);
        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: t("quickContact.quickContactAddSuccess"),
            onClickDone: (close) => {
              closeSuccessModel();
            },
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        setBtnLoading(false);
      }
    }
  };

  const getContacts = () => {
    let payload = {
      quick_contact: 0,
      event_id: eventSelect,
    };
    ApiServices.contact
      .GetAllContact(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          const formattedContacts = data?.data?.map((contact) => ({
            value: contact?.uuid,
            label: contact?.first_name + " " + contact?.last_name,
          }));
          setAllContactList(formattedContacts);
        }
      })
      .catch((err) => {});
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    setCheckedContacts([]);
    setModalData(null);
    setBtnLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      getContacts();
    }
  }, [isOpen]);

  console.log(allContactList);

  return (
    <>
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
                <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {t("quickContact.addQuickContact")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>
                  <div className="flex h-[600px] flex-col justify-between overflow-y-auto p-2 md:h-[300px] lg:h-[300px] xl:h-[400px] 2xl:h-[500px]">
                    <div className="space-y-8">
                      <h2 className="label mb-2 text-secondary ltr:text-left rtl:text-right">
                        {t("quickContact.quickContactInfo")}
                        {checkedContactsError && <span className="text-xs text-red-500">{checkedContactsError}</span>}
                      </h2>

                      <div className="grid grid-cols-3 gap-7">
                        {allContactList?.length === 0 ? (
                          <div className="col-span-3 flex h-full items-center justify-center text-gray-500">No contacts available</div>
                        ) : (
                          allContactList?.map((contact, index) => (
                            <div className="text-left" key={index}>
                              <input
                                type="checkbox"
                                id={contact?.value}
                                name={contact?.value}
                                checked={checkedContacts?.includes(contact?.value)}
                                onChange={() => handleCheckboxChange(contact?.value)}
                              />
                              <label htmlFor={contact.value} className="label ps-2">
                                {contact?.label}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="mx-auto mt-20 grid w-10/12 grid-cols-2 gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={t("quickContact.addQuickContact")}
                        type="button"
                        onClick={handleSubmit}
                        loading={btnLoading}
                      />
                      <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AddQuickContactModal;
