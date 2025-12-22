import React, { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import countriesCodeData from "../../utilities/countryCode.json";
import ApiServices from "../../api/services";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useThemeContext } from "../../context/GlobalContext";
import { registerSubscriber, assignBulkQrCodes } from "../../api/services/qr_codes";

const QuickImportDisplayText = ({ isOpen, setOpenQuickImportDisplayText, refreshData, contacts, setContacts, setIsOpen}) => {
    const [submittedContacts, setSubmittedContacts] = useState([]);
  const { t } = useTranslation("common");
  console.log("contacts---------------", contacts);
  const {
    eventSelect,
    btnLoading,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    getGroupNames,
    getFamilyNames,
  } = useThemeContext();
const [spouse, setSpouse] = useState({
    countryCode: ""
});

  const [errorMessage, setErrorMessage] = useState("");

  /* ================= HANDLERS ================= */
//  const handleChange = (index, field, value) => {
//   setContacts(prev => {
//     const updated = [...prev];           // new array
//     updated[index] = {
//       ...updated[index],                 // new object
//       [field]: value
//     };
//     return updated;
//   });
// };

const handleChange = (index, field, value) => {
  setContacts(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    return updated;
  });
};

useEffect(() => {
  if (contacts?.length) {
    setContacts(prev =>
      prev.map(c => ({
        ...c,
        country: c.country || "+91"
      }))
    );
  }
}, []);

  const handleClose = () => {
    setErrorMessage("");
    setOpenQuickImportDisplayText(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setBtnLoading(true);
      // API call placeholder

      // Save a COPY (do NOT mutate contacts)
        setSubmittedContacts([...contacts]);

        const payload = contacts.map(c => ({
            group: c.groups,
            family: c.family,
            country: c.country,
            first_name: c.name,
            number: c.number
        }));

        // console.log("Submitting:", payload);
        const data = ApiServices.contact.AddBulkContact(payload);
        console.log("data====", data);
        return false;
      openSuccessModal({
        title: "Success!",
        message: "Contact verified successfully",
        onClickDone: closeSuccessModel,
      });
    } catch (err) {
      setErrorMessage("Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getGroupNames();
      getFamilyNames();
    }
  }, [isOpen]);
//   console.log(contacts[0].groups);
  /* ================= UI ================= */
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-xl">

            {/* HEADER */}
            <div className="p-5 border-b flex justify-between items-center">
              <Dialog.Title className="text-lg font-semibold">
                {t("contacts.addContacts")}
              </Dialog.Title>
              <XMarkIcon className="w-6 h-6 cursor-pointer" onClick={handleClose} />
            </div>

            {/* CONTENT */}
            <div className="p-5 max-h-[75vh] overflow-y-auto">

              {/* Back */}
              <div className="flex items-center gap-2 text-sm font-semibold mb-4 cursor-pointer">
                <ArrowLeftIcon className="w-4 h-4" onClick={()=> {setIsOpen(true); setOpenQuickImportDisplayText(false);}}/>
                {t("contacts.backArrorw")}
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto mb-4">
                <div className="min-w-[650px] flex gap-6">
                    
                    <div className="flex-1">
                    <Input
                        type="text"
                        label={t("contacts.groups")}
                        placeholder="Enter group name"
                        className="border rounded px-2 py-1 w-full"
                        value={contacts?.[0]?.groups || ""}
                        onChange={(e) =>
                        handleChange(0, "groups", e.target.value)
                        }
                    />
                    </div>

                    <div className="flex-1">
                    <Input
                        type="text"
                        label={t("contacts.family")}
                        placeholder="Enter family name"
                        className="border rounded px-2 py-1 w-full"
                        value={contacts?.[0]?.family || ""}
                        onChange={(e) =>
                        handleChange(0, "family", e.target.value)
                        }
                    />
                    </div>

                </div>
                </div>


              <div className="overflow-x-auto mb-4">

                <div className="min-w-[650px]">
                  <div className="grid grid-cols-[40px_100px_1fr_1fr] gap-2 text-sm font-semibold mb-2">
                    <div>#</div>
                    <div>Country Code</div>
                    <div style={{width:"10px"}}>Name</div>
                    <div>Number</div>
                  </div>

                  {contacts.map((c, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[40px_150px_1fr_1fr] gap-3 mb-2 items-center"
                    >
                      <div>{i + 1}</div>

                      <select
                        value={c.country}
                        onChange={(e) => handleChange(i, "country", e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {countriesCodeData?.countries?.map((country, index) => (
                            <option
                            key={index}
                            value={`+${country.callingCodes[0]}`}
                            >
                            +{country.callingCodes[0]} {country.name}
                            </option>
                        ))}
                      </select>
                      <input
                        value={c.number}
                        onChange={(e) => handleChange(i, "number", e.target.value)}
                        className="border rounded px-2 py-1"
                        //style={{ width: "210px" }}
                      />
                      <input
                        value={c.name}
                        onChange={(e) => handleChange(i, "name", e.target.value)}
                        className="border rounded px-2 py-1"
                        //style={{ width: "140px" }}
                      />

                      
                    </div>
                  ))}
                </div>
              </div>

             

              {/* ERROR */}
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}

              {/* ACTIONS */}
              <div className="grid grid-cols-1 gap-2 mt-5 float-right">
                {/* <Button
                  icon={<XMarkIcon />}
                  title={t("buttons.cancel")}
                  buttonColor="bg-red-500"
                  onClick={handleClose}
                /> */}
                <Button
                  icon={<CheckIcon />}
                  title={t("buttons.startImporting")}
                  buttonColor="bg-green-500 float-right"
                  loading={btnLoading}
                  onClick={handleSubmit}
                />
              </div>

            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default QuickImportDisplayText;
