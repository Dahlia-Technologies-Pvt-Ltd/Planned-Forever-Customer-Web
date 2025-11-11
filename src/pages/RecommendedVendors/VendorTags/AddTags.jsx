import React from "react";
import ApiServices from "@api";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "@context";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const AddTags = ({ isOpen, setIsOpen, refreshData, data }) => {
  const { t: commonT } = useTranslation("common");

  // Context
  const { eventSelect , btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel } = useThemeContext();

  // useStates
  const [tag, setTag] = useState("");
  const [tagError, setTagError] = useState("");

  // Form Validationhttp://localhost:5000/dashboard
  const isValidForm = () => {
    let isValidData = true;

    if (tag === "") {
      setTagError(" Required");
      isValidData = false;
    }

    return isValidData;
  };

  // Handle Submit
  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          name: tag,
          event_id : eventSelect
        };

        const response =
          data === null ? await ApiServices.Vendor_Tags.addVendorTag(payload) : await ApiServices.Vendor_Tags.updateVendorTag(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          closeModal();
          refreshData();
          openSuccessModal({
            title: "Success!",
            message: data === null ? "Tag has been added successfully" : "Tag has been updated successfully",
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
      }
    } else {
    }
  };

  // close modal
  const closeModal = () => {
    setIsOpen(false);
    setTag("");
    setTagError("");
    setBtnLoading(false);
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setTag(data?.name);
    } else {
      setTag("");
    }
  }, [isOpen]);

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
                <Dialog.Panel className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? "Add New Tag" : "Update Tag"}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div>
                      <Input
                        isRequired
                        label="Tag"
                        placeholder="Tag"
                        value={tag}
                        error={tagError}
                        onChange={(e) => {
                          setTag(e.target.value);
                          setTagError("");
                        }}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-7">
                      <Button icon={<CheckIcon />} title={data === null ? "Add Tag" : "Update Tag"} type="submit" loading={btnLoading} />
                      <Button icon={<XMarkIcon />} title="Cancel" type="button" buttonColor="bg-red-500" onClick={closeModal} />
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

export default AddTags;
