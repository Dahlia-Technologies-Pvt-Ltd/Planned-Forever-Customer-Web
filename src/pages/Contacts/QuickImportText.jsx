import React, { Fragment, useState, useEffect, useCallback } from "react";
import ApiServices from "../../api/services";
import { mediaUrl } from "../../utilities/config";
import Button from "../../components/common/Button";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import Input from "../../components/common/Input";
import QuickImportDisplayText from "./QuickImportDisplayText";
import countriesCodeData from "../../utilities/countryCode.json";
import AddGroupModal from "../../components/common/AddGroupModal";
import AddFamilyModal from "../../components/common/AddFamilyModal";
const QuickImportText = ({ isOpen, setIsOpen, refreshData }) => {
  const { t } = useTranslation("common");

  const {
    eventSelect,
    allGroups,
    btnLoading,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    //getGroupNames,
    //getFamilyNames,
    allFamily,
  } = useThemeContext();

  const [family, setFamily] = useState("");
  const [groupUnder, setGroupUnder] = useState("");
  const [familyError, setFamilyError] = useState(null);
  const [groupUnderError, setGroupUnderError] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [selectedFilePathError, setSelectedFilePathError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [openQuickImportDisplayText, setOpenQuickImportDisplayText] = useState(false);
  const [address, setAddress] = useState("");
  const [contacts, setContacts] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [groups, setGroups] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [options, setOptions] = useState([]);
  const [errorMessageServer, setErrorMessageServer] = useState("");
  const [openDeleteModalFamily, setOpenDeleteModalFamily] = useState({ open: false, data: null });
  const [openFamilyModal, setOpenFamilyModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [spouse, setSpouse] = useState({
      
      countryCode: ""
    });
  /* ================= DROPZONE ================= */
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFilePath(acceptedFiles[0]);
      setSelectedFilePathError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
  });
  /* ============================================ */
  // Add Family Functionality & API
    const handleFamilyChange = (selectedOption) => {
      if (selectedOption.value === "add_family") {
        setOpenFamilyModal(true);
      } else {
        setFamily(selectedOption);
      }
    };
  
    const addNewFamily = () => {
      const requestData = {
        name: newFamilyName,
        event_id: eventSelect,
      };
  
      ApiServices.contact
        .AddFamily(requestData)
        .then((res) => {
          const { data, message } = res;
          if (res?.code === 200) {
            const newOption = { value: newFamilyName.toLowerCase(), label: newFamilyName };
            setOptions([...options, newOption]);
            setFamily(newFamilyName);
            setOpenFamilyModal(false);
            getFamilyNames();
            setNewFamilyName("");
          }
        })
        .catch((err) => {
          setErrorMessageServer(err.response?.data?.message);
        });
    };
  const getFamilyNames = () => {
      const requestData = {
        event_id: eventSelect,
      };
      ApiServices.contact
        .getFamily(requestData)
        .then((res) => {
          const { data, message } = res;
          if (data.code === 200) {
            const familyNames = data?.data?.data?.map((name) => ({ value: name?.id, label: name?.name }));
            setOptions(familyNames);
          }
        })
        .catch((err) => {});
    };
  
  // Add Group Functionality & API
    const handleGroupChange = (selectedOption) => {
      if (selectedOption.value === "add_group") {
        setOpenGroupModal(true);
      } else {
        setGroups(selectedOption);
      }
    };
  
    const addNewGroup = () => {
      const requestData = {
        name: newGroupName,
        event_id: eventSelect,
      };
  
      ApiServices.contact
        .AddGroup(requestData)
        .then((res) => {
          const { data, message } = res;
          if (res?.code === 200) {
            const newOption = { value: newGroupName.toLowerCase(), label: newGroupName };
            setGroupOptions([...options, newOption]);
            getGroupNames();
            setGroups(newGroupName);
            setOpenGroupModal(false);
            setNewGroupName("");
          }
        })
        .catch((err) => {
          setErrorMessageServer(err.response?.data?.message);
        });
    };
  const getGroupNames = () => {
      const requestData = {
        event_id: eventSelect,
      };
      ApiServices.contact
        .getGroup(requestData)
        .then((res) => {
          const { data, message } = res;
          if (data.code === 200) {
            const groupNames = data?.data?.data?.map((name) => ({ value: name.id, label: name.name }));
            setGroupOptions(groupNames);
          }
        })
        .catch((err) => {});
    };
    
    
  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;

    if (!selectedFilePath) {
      setSelectedFilePathError("Required");
      isValid = false;
    }

    if (!groupUnder) {
      setGroupUnderError("Required");
      isValid = false;
    }

    if (!family) {
      setFamilyError("Required");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setBtnLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFilePath);
      formData.append("event_id", eventSelect);
      formData.append("group_id", groupUnder?.value);
      formData.append("family_id", family?.value);
      formData.append("no_of_members", 1);

      const response = await ApiServices.contact.ImportExcel(formData);

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
      setBtnLoading(false);
      setErrorMessage(err.response?.data?.message);
    }
  };

  const handleClose = () => {
    setSelectedFilePath(null);
    setFamily("");
    setGroupUnder("");
    setErrorMessage("");
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

  const parseContacts = (text, country = "IN", groups, family) => {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
        let parts = line.split(/\s+/);

        // --- Email (optional) ---
        let email = "";
        if (parts.length && parts[parts.length - 1].includes("@")) {
            email = parts.pop();
        }

        // --- Phone number (required) ---
        const number = parts.pop() || "";

        // --- Salutation (optional) ---
        let salutation = "";
        const salutations = ["Mr.", "Mr", "Mrs.", "Mrs", "Ms.", "Ms", "Dr.", "Dr"];
        if (parts.length && salutations.includes(parts[0])) {
            salutation = parts.shift();
        }

        // --- Names ---
        const first_name = parts.shift() || "";
        const last_name = parts.length ? parts.pop() : "";
        const middle_name = parts.join(" "); // can be blank

        return {
            country,
            salutation,   // "" if missing
            first_name,   // required
            middle_name,  // "" if missing
            last_name,    // "" if missing
            number,
            email,        // "" if missing
            groups,
            family
        };
        });
    };





  return (
    <>
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />

        <div className="overflow-y-auto fixed inset-0">
          <div className="flex justify-center items-center p-4 min-h-full text-center">
            <Dialog.Panel className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold text-black">
                  {t("contacts.addContacts")}
                </Dialog.Title>
                <XMarkIcon onClick={handleClose} className="h-7 w-7 cursor-pointer text-info-color" />
              </div>

              <hr />
                
              <form onSubmit={handleSubmit} className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:h-9 [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:h-9 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:h-9 [&_.css-hlgwow]:min-h-[36px] [&_.css-hlgwow]:py-0 [&_.css-hlgwow]:px- [&_.css-1jqq78o-placeholder]:text-xs [&_.css-1jqq78o-placeholder]:leading-none [&_.css-1dimb5e-singleValue]:text-xs [&_.css-1dimb5e-singleValue]:leading-none [&_.css-1wy0on6]:h-9 [&_.css-19bb58m]:my-0 [&_textarea]:text-xs [&_textarea]:leading-4 [&_textarea::placeholder]:text-gray-300 [&_textarea::placeholder]:leading-6 [&_textarea::placeholder]:text-xs">
                <div className="p-1 pt-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Dropdown
                            isSearchable
                            title={t("contacts.countryCode")}
                            options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]}`,
                            }))}
                      placeholder={t("contacts.countryCode")}
                            value={spouse.countryCode}
                            onChange={(e) => setSpouse({ ...spouse, countryCode: e })}
                            
                        />
                        <Dropdown
                            options={groupOptions}
                            title={t("contacts.groups")}
                    placeholder={t("contacts.selectGroup")}
                            value={groups}
                            onChange={handleGroupChange}
                            Delete
                            setOpenDeleteModal={setOpenDeleteModal}
                            />
                            
                        <Dropdown
                            options={options}
                            title={t("contacts.family")}
                    placeholder={t("contacts.selectFamily")}
                            value={family}
                            onChange={handleFamilyChange}
                            Delete
                            setOpenDeleteModal={setOpenDeleteModal}
                            setOpenDeleteModalFamily={setOpenDeleteModalFamily}
                            />
                            
                    </div>
                    <div className="mt-5">
                      <Input
                        label=""
                        placeholder={`Example:
  Mr. John Michael Doe 9876000431 johndoe@gmail.com
  Mr. Alex Robert Brown 7540005938 alexbrown@gmail.com`}
                        textarea
                        rows={7}
                        value={address}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAddress(value);
                          const parsed = parseContacts(
                            value,
                            spouse.countryCode?.value?.trim(),
                            groups?.label,
                            family?.label
                          );
                          setContacts(parsed);
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 placeholder:text-slate-400 focus:border-primary focus:bg-white"
                      />
                    </div>
                  <div className="mt-5 flex justify-end gap-3">
                    <Button
                      icon={<XMarkIcon />}
                      title={t("buttons.cancel")}
                      type="button"
                      buttonColor="bg-red-500"
                      className="!h-9 !px-5"
                      onClick={handleClose}
                    />
                    <Button
                      icon={<CheckIcon />}
                      title={t("buttons.verify")}
                      type="submit"
                      buttonColor="bg-secondary"
                      className="!h-9 !px-5"
                      loading={btnLoading}
                      onClick={() => {
                        setOpenQuickImportDisplayText(true);
                        setIsOpen(false);
                      }}
                    />
                  </div>

                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
    <QuickImportDisplayText isOpen={openQuickImportDisplayText} setOpenQuickImportDisplayText={setOpenQuickImportDisplayText} refreshData={refreshData} contacts={contacts} setContacts={setContacts} setIsOpen={setIsOpen}/>
    </>
  );
};

export default QuickImportText;
