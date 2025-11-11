import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import Input from "../../components/common/Input";
import DateAndTime from "../../components/common/DateAndTime";
import Button from "../../components/common/Button";
import ApiServices from "../../api/services";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const AddChecklistModal = ({ label, isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { eventSelect,openSuccessModal, closeSuccessModel , getEventList , allEvents } = useThemeContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [event ,setEvent] = useState(null)
  const [eventError, setEventError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const [btnLoading, setBtnLoading] = useState(false);

  const { t: commonT } = useTranslation("common");

  const isValidForm = () => {
    let isValidData = true;
    if (title === "") {
      setTitleError(" Required");
      isValidData = false;
    }

    // if (event === null) {
    //   setEventError("Required");
    //   isValidData = false;
    // } 

    if (description === "") {
      setDescriptionError(" Required");
      isValidData = false;
    }

    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      if (data === null) {
        try {
          setBtnLoading(true);

          let payload = {
            title: title,
            event_id: eventSelect,
            description: description,
          };

          const response = await ApiServices.checklist.addChecklist(payload);
           

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: "Success!",
              message: "CheckList has been added successfully",
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          // setError(err?.response?.data?.message);
          setBtnLoading(false);
        }
      } else {
        try {
          setBtnLoading(true);

          let payload = {
            title: title,
            description: description,
            event_id: eventSelect,
          };

          const response = await ApiServices.checklist.updateChecklist(data?.id, payload);
           

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: "Success!",
              message: "Checklist has been updated successfully",
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          // setError(err?.response?.data?.message);
          setBtnLoading(false);
        }
      }
    } else {
       
    }
  };

  // Clear States
  const clearAllData = () => {
    setDescription("");
    setTitle("");
    setTitleError("");
    setDescriptionError("");
    setEventError("")
    setEvent(null)
  };

  // Use Effects

  useEffect(() => {
    if (data !== null) {
      setTitle(data?.title);
      setEvent({ label: data?.event?.name, value: data?.event?.id });
      setDescription(data?.description);
    }
  }, [isOpen]);

  useEffect(()=>{
    if(isOpen){
      getEventList()
    }
  },[isOpen])

  console.log({event})

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
                      {data === null ? "Add New Checklist" : "Update Checklist"}
                    </Dialog.Title>
                    <XMarkIcon
                      onClick={() => {
                        setIsOpen(false);
                        setModalData(null);
                        clearAllData();
                        setError("");
                      }}
                      className="h-8 w-8 cursor-pointer text-info-color"
                    />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="h-[600px] overflow-y-auto p-2 md:h-[300px] lg:h-[300px] xl:h-[400px] 2xl:h-[500px]">
                      <div className="mb-5 text-left ">
                        <div>
                          <div className="label mb-2 text-secondary">Basic Information</div>
                          {/* <div className="rounded-full border-[1.5px] border-solid border-secondary"></div> */}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-7">
                      {/* <Dropdown
                          isRequired
                          title="Events"
                          placeholder="Events"
                          withError={eventError}
                          options={allEvents}
                          value={event}
                          onChange={(e) => {
                            setEvent(e);
                            setEventError("");
                          }}
                        /> */}

                        <Input
                          isRequired
                          label="Title"
                          placeholder="Title"
                          error={titleError}
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            setTitleError("");
                          }}
                        />

                        <Input
                          isRequired
                          label="Short Description"
                          placeholder="Short Description"
                          textarea
                          error={descriptionError}
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            setDescriptionError("");
                          }}
                        />
                      </div>

                      <div className="mx-auto mt-20 grid w-9/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? "Add Checklist" : "Update Checklist"}
                          type="submit"
                          loading={btnLoading}
                        />
                        <Button
                          icon={<XMarkIcon />}
                          title="Cancel"
                          type="button"
                          buttonColor="bg-red-500"
                          onClick={() => {
                            setIsOpen(false);
                            setModalData(null);
                            clearAllData();
                            setError("");
                          }}
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
    </>
  );
};

export default AddChecklistModal;
