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
  //console.log('groups :',groups);
  //console.log('family :',family);
  return text
    .split("\n")                 // split lines
    .map(line => line.trim())    // remove extra spaces
    .filter(line => line)        // remove empty lines
    .map(line => {
      const parts = line.split(/\s+/); // split by space(s)
      const number = parts.pop();      // last value = number
      const name = parts.join(" ");    // remaining = name

      return {
        country,
        name,
        number,
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
            <Dialog.Panel className="p-8 w-full max-w-xl bg-white rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-5">
                <Dialog.Title className="text-lg font-semibold">
                  {t("contacts.addContacts")}
                </Dialog.Title>
                <XMarkIcon onClick={handleClose} className="w-8 h-8 cursor-pointer" />
              </div>

              <hr />
                
              <form onSubmit={handleSubmit}>
                <div className="p-2">
                    <div className="grid grid-cols-2 gap-7 my-7">
                        <Dropdown
                            isSearchable
                            title={t("contacts.countryCode")}
                            options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]}`,
                            }))}
                            placeholder="Country Code"
                            value={spouse.countryCode}
                            onChange={(e) => setSpouse({ ...spouse, countryCode: e })}
                            invisible
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-7 my-7">
                        <Dropdown
                            options={groupOptions}
                            //title={t("contacts.groups")}
                            placeholder="Select groups"
                            value={groups}
                            onChange={handleGroupChange}
                            Delete
                            setOpenDeleteModal={setOpenDeleteModal}
                            />
                            
                        <Dropdown
                            options={options}
                            //title={t("contacts.family")}
                            placeholder="Select family"
                            value={family}
                            onChange={handleFamilyChange}
                            Delete
                            setOpenDeleteModal={setOpenDeleteModal}
                            setOpenDeleteModalFamily={setOpenDeleteModalFamily}
                            />
                            
                    </div>
                    <Input label={t("contacts.enterNameandNumbers")} placeholder={`Example:\nJohn 9876000431\nAlex 7540005938`} textarea rows={4}
                    onChange={(e) => {
                            const value = e.target.value;
                            setAddress(value);
                            const parsed = parseContacts(value, spouse.countryCode.value.trim(), groups.label, family.label);
                            setContacts(parsed);
                        }}
                    />

                  

                  <div className="grid grid-cols-2 gap-1 mx-auto mt-5 w-12/12">
                    <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={handleClose} />
                    <Button icon={<CheckIcon />} title={t("buttons.verify")} type="submit" buttonColor="bg-blue-500" loading={btnLoading} onClick={() => {setOpenQuickImportDisplayText(true); setIsOpen(false);}} />
                  </div>

                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
    <QuickImportDisplayText isOpen={openQuickImportDisplayText} setOpenQuickImportDisplayText={setOpenQuickImportDisplayText} contacts={contacts} setContacts={setContacts} setIsOpen={setIsOpen}/>
    </>
  );
};

export default QuickImportText;
