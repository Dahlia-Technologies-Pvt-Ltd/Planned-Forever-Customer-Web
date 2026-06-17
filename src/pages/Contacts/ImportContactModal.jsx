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

const headerIncludeOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];
const ImportContactModal = ({ isOpen, setIsOpen, refreshData }) => {
  const { t } = useTranslation("common");

  // context
  const { eventSelect, allGroups, btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel, getGroupNames, getFamilyNames, allFamily } =
    useThemeContext();

  const [family, setFamily] = useState("");
  const [groupUnder, setGroupUnder] = useState("");
  const [familyError, setFamilyError] = useState(null);
  const [headerInclude, setHeaderInclude] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState(null);

  // Validation error states
  const [errorMessage, setErrorMessage] = useState("");
  const [groupUnderError, setGroupUnderError] = useState(null);
  const [headerIncludeError, setHeaderIncludeError] = useState(null);
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

    // if (!headerInclude) {
    //   setHeaderIncludeError("Required");
    //   isValid = false;
    // } else {
    //   setHeaderIncludeError(null);
    // }

    if (!groupUnder) {
      setGroupUnderError("Required");
      isValid = false;
    } else {
      setGroupUnderError(null);
    }

    if (!family) {
      setFamilyError("Required");
      isValid = false;
    } else {
      setFamilyError(null);
    }

    if (!isValid) {
      return;
    } else {
      try {
        setBtnLoading(true);

        let formData = new FormData();

        formData.append("file", selectedFilePath);
        formData.append("event_id", eventSelect);
        formData.append("group_id", groupUnder?.value);
        formData.append("family_id", family?.value);
        formData.append("no_of_members", 1);
        // formData.append("header", headerInclude?.value === "yes" ? 1 : 0);

        const response = await ApiServices.contact.ImportExcel(formData);
        const { data } = response;
        
        if (response?.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          refreshData();
          handleClose();
          openSuccessModal({
            title: "Success!",
            message: "Contact imported successfully",
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
    setHeaderInclude("");
    setGroupUnder("");
    setSelectedFilePath(null);
    setFamily("");
    setFamilyError("");
    setErrorMessage("");
    setGroupUnderError("");
    setHeaderIncludeError("");
    setSelectedFilePathError("");
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      getGroupNames();
      getFamilyNames();
    }
  }, [isOpen]);

  const downloadFile = () => {
    const fileId = "1759750584.sample_contact_import.xls";
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
                      {t("contacts.contactExcel")}
                    </Dialog.Title>
                    <XMarkIcon onClick={handleClose} className="w-8 h-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit} className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:h-9 [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:h-9 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:h-9 [&_.css-hlgwow]:min-h-[36px] [&_.css-hlgwow]:py-0 [&_.css-hlgwow]:px- [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-none [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-none [&_.css-1wy0on6]:h-9 [&_.css-19bb58m]:my-0">
                    <div className="p-2">
                      <div className="mb-2 text-left label">
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

                      <div className="flex justify-end mt-3">
                        <Button type="button" onClick={downloadFile} title={t("contacts.downloadSampleFile")}></Button>
                      </div>

                      <div className="grid grid-cols-2 gap-7 my-7">
                        {/* <Dropdown
                          options={headerIncludeOptions}
                          title={t("contacts.columnHeadersIncluded")}
                    placeholder={t("contacts.selectColumnHeaders")}
                          value={headerInclude}
                          onChange={(e) => {
                            setHeaderInclude(e);
                            setHeaderIncludeError("");
                          }}
                          isRequired
                          withError={headerIncludeError}
                        /> */}

                        <Dropdown
                          isRequired
                          title={t("contacts.groupUnder")}
                    placeholder={t("contacts.selectGroup")}
                          withError={groupUnderError}
                          options={allGroups}
                          value={groupUnder}
                          onChange={(e) => {
                            setGroupUnder(e);
                            setGroupUnderError("");
                          }}
                        />

                        <Dropdown
                          isRequired
                          title={t("contacts.family")}
                    placeholder={t("contacts.selectFamily")}
                          withError={familyError}
                          options={allFamily}
                          value={family}
                          onChange={(e) => {
                            setFamily(e);
                            setFamilyError("");
                          }}
                        />
                      </div>

                      {errorMessage && <span className="text-sm font-medium text-red-500">{errorMessage}</span>}
                      <div className="grid grid-cols-3 gap-1 mx-auto mt-8 w-10/12">
                        <Button icon={<CheckIcon />} title={t("buttons.save")} type="submit" loading={btnLoading} />
                        <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={handleClose} />
                        {/* <Button title={t("buttons.quickImport")} type="button" buttonColor="bg-blue-500" /> */}
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

export default ImportContactModal;
