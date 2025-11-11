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


const ImportDepartureModal = ({ isOpen, setIsOpen, refreshData }) => {
  const { t } = useTranslation("common");

  // context
  const { eventSelect, btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel,} =
    useThemeContext();


  const [selectedFilePath, setSelectedFilePath] = useState(null);

  // Validation error states
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFilePathError, setSelectedFilePathError] = useState(null);

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


    if (!isValid) {
      return;
    } else {
      try {
        setBtnLoading(true);

        let formData = new FormData();

        formData.append("file", selectedFilePath);
        formData.append("event_id", eventSelect);
        formData.append("type", "departure")

        const response = await ApiServices.arrivalDeparture.ImportExcel(formData);
        const { data } = response;

        if (response?.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          refreshData();
          handleClose();
          openSuccessModal({
            title: "Success!",
            message: "Departure imported successfully",
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
        setErrorMessage(err.response?.data?.message);
      }
    }
  };

  const handleClose = () => {
    setSelectedFilePath(null);
    setErrorMessage("");
    setSelectedFilePathError("");
    setIsOpen(false);
  };


  const downloadFile = () => {
    const fileId = "1756238697.arrival_departure_sample_file.csv";
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
                      Import Departure Excel File
                    </Dialog.Title>
                    <XMarkIcon onClick={handleClose} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="p-2">
                      <div className="label mb-2 text-left">
                        {t("contacts.selectFile")}
                        <span className="text-red-500">*</span>{" "}
                        {selectedFilePathError && <span className="text-xs text-red-500"> {selectedFilePathError}</span>}
                      </div>
                      <div className="w-4/12">
                        <ChooseFile
                          placeholder
                          onChange={handleFileChange}
                          selectedFile={selectedFilePath}
                          accept=".xls, .xlsx"
                          required={selectedFilePathError}
                          onClickCross={() => setSelectedFilePath(null)}
                        />
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button type="button" onClick={downloadFile} title={t("contacts.downloadSampleFile")}></Button>
                      </div>

                      {errorMessage && <span className="text-sm font-medium text-red-500">{errorMessage}</span>}
                      <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
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

export default ImportDepartureModal;
