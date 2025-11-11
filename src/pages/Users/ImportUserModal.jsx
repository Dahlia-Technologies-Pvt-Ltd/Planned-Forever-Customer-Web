import React from "react";
import ApiServices from "../../api/services";
import { mediaUrl } from "../../utilities/config";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import ChooseFile from "../../components/common/ChooseFile";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const ImportUserModal = ({ isOpen, setIsOpen, refreshData }) => {
  const { t } = useTranslation("common");

  // context
  const { userData, btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel } =
    useThemeContext();

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState(null);

  // Validation error states
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEventError, setSelectedEventError] = useState(null);
  const [selectedFilePathError, setSelectedFilePathError] = useState(null);

  // Format events for dropdown
  const formattedEvents = userData?.user_event?.map((event) => ({
    value: event?.id,
    label: event?.name,
  }));

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFilePath(file);
    setSelectedFilePathError("");

    // Reset input value to allow selecting the same file again
    event.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    let isValid = true;

    if (!selectedFilePath) {
      setSelectedFilePathError("Required");
      isValid = false;
    } else {
      setSelectedFilePathError(null);
    }

    if (!selectedEvent) {
      setSelectedEventError("Required");
      isValid = false;
    } else {
      setSelectedEventError(null);
    }

    if (!isValid) {
      return;
    } else {
      try {
        setBtnLoading(true);

        let formData = new FormData();

        formData.append("file", selectedFilePath);
        formData.append("event_id", selectedEvent?.value);

        const response = await ApiServices.users.ImportUserExcel(formData);
        const { data } = response;

        if (response?.code === 200 || response?.status === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          refreshData();
          handleClose();
          openSuccessModal({
            title: "Success!",
            message: response?.message || "Users imported successfully",
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
        setErrorMessage(err.response?.data?.message || "Import failed. Please try again.");
      }
    }
  };

  const handleClose = () => {
    setSelectedEvent("");
    setSelectedFilePath(null);
    setErrorMessage("");
    setSelectedEventError("");
    setSelectedFilePathError("");
    setIsOpen(false);
  };

  const downloadFile = () => {
    const fileId = "1759745207.sample_bulk_user_import.csv";
    window.location.href = `${mediaUrl + fileId}`;
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
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

          <div className="overflow-y-auto fixed inset-0">
            <div className="flex justify-center items-center p-4 min-h-full text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="p-8 w-full max-w-3xl bg-white rounded-2xl shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-5">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-7 font-poppins text-secondary-color">
                      {t("Import Users from Excel")}
                    </Dialog.Title>
                    <XMarkIcon onClick={handleClose} className="w-8 h-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="p-2">
                      <div className="mb-2 text-left label">
                        {t("Select File")}
                        <span className="text-red-500">*</span>{" "}
                        {selectedFilePathError && <span className="text-xs text-red-500"> {selectedFilePathError}</span>}
                      </div>
                      <div className="w-5/12">
                        <ChooseFile
                          placeholder
                          onChange={handleFileChange}
                          selectedFile={selectedFilePath}
                          accept=".csv, .xls, .xlsx"
                          required={selectedFilePathError}
                          onClickCross={() => setSelectedFilePath(null)}
                        />
                      </div>

                      <div className="flex justify-end mt-3">
                        <Button type="button" onClick={downloadFile} title={t("Download Sample File")}></Button>
                      </div>

                      <div className="grid grid-cols-1 gap-7 my-7">
                        <Dropdown
                          isRequired
                          title={t("Select Event")}
                          placeholder="Select event"
                          withError={selectedEventError}
                          options={formattedEvents}
                          value={selectedEvent}
                          onChange={(e) => {
                            setSelectedEvent(e);
                            setSelectedEventError("");
                          }}
                        />
                      </div>

                      {errorMessage && <span className="text-sm font-medium text-red-500">{errorMessage}</span>}
                      <div className="grid grid-cols-2 gap-7 mx-auto mt-10 w-8/12">
                        <Button icon={<CheckIcon />} title={t("buttons.save")} type="submit" loading={btnLoading} />
                        <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={handleClose} />
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

export default ImportUserModal;