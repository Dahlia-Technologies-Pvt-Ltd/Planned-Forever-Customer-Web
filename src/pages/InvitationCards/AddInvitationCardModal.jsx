import React from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import ChooseFile from "../../components/common/ChooseFile";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import ApiServices from "../../api/services";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const AddInvitationCardModal = ({ isOpen, setIsOpen, data, setModalData, refreshData }) => {
  const { t } = useTranslation("common");

  const { eventSelect, openSuccessModal, closeSuccessModel } = useThemeContext();

  // useStates
  const [other, setOther] = useState(false);
  const [noteSentTo, setNoteSentTo] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [invitationCardName, setInvitationCardName] = useState("");
  const [file, setFile] = useState(null);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  // Validation States
  const [otherError, setOtherError] = useState("");
  const [noteSentToError, setNoteSentToError] = useState("");
  const [selectedFilePathError, setSelectedFilePathError] = useState("");
  const [invitationCardNameError, setInvitationCardNameError] = useState("");

  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState("");

  const [fileError, setFileError] = useState("");

  // handle Image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setFileUploadLoading(true);
    const uploadFile = (file) => {
      const formData = new FormData();
      formData.append("file", file);

      ApiServices.contact
        .contactProfileUpload(formData)
        .then((res) => {
          const { data, message } = res;

          if (res.code === 200) {
            setFileUploadLoading(false);
            setSelectedFilePath(file);
            setFileError("");
            setFile(data);
            event.target.value = null;
          }
        })
        .catch((err) => {
          setFileUploadLoading(false);
          setFileError(err.response.data.message);
        });
    };

    uploadFile(file);
    setSelectedFilePathError("");
  };

  // handle cancel selected image
  const handleCrossClick = () => {
    setSelectedFilePath(null);
  };

  // function to validate states
  const isValidForm = () => {
    let isValidData = true;
    if (!invitationCardName) {
      setInvitationCardNameError("Required");
      isValidData = false;
    } else {
      setInvitationCardNameError("");
    }
    // if (!noteSentTo) {
    //   setNoteSentToError("Required");
    //   isValidData = false;
    // } else {
    //   setNoteSentToError("");
    // }
    if (!selectedFilePath) {
      setSelectedFilePathError("Required");
      isValidData = false;
    } else {
      setSelectedFilePathError("");
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

          let formData = new FormData();
          formData.append("name", invitationCardName);
          formData.append("description", noteSentTo);
          formData.append("invitation_card", file);
          formData.append("event_id", eventSelect);

          const response = await ApiServices.invitation_card.addInvitationCard(formData);

          if (response?.data?.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("invitationCard.invitationCardAddedSuccess"),
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setError(err?.response?.data?.message);
          setBtnLoading(false);
        }
      } else {
        try {
          setBtnLoading(true);

          let formData = new FormData();
          formData.append("name", invitationCardName);
          formData.append("description", noteSentTo);
          formData.append("invitation_card", file);
          formData.append("event_id", eventSelect);

          const response = await ApiServices.invitation_card.updateInvitationCard(data?.id, formData);

          if (response?.data?.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("invitationCard.invitationCardUpdatedSucess"),
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setError(err?.response?.data?.message);
          setBtnLoading(false);
        }
      }
    }
  };

  // Clear States
  const clearAllData = () => {
    setOther(false);
    setNoteSentTo("");
    setOtherError("");
    setNoteSentToError("");
    setInvitationCardName("");
    setSelectedFilePath(null);
    setSelectedFilePathError("");
    setInvitationCardNameError("");
    setError("");
    setFileError("");
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      console.log("data", data);
      setInvitationCardName(data?.name);
      setNoteSentTo(data?.description);
      if (data?.invitation_card === "null") {
        setSelectedFilePath(null);
      } else {
        setSelectedFilePath(data?.invitation_card);
      }
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
                <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-10 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("invitationCard.addInvitationCard") : t("invitationCard.updateInvitationCard")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className=" h-[300px] overflow-y-auto p-2 md:h-[500px]">
                      <div className="mb-5 grid grid-cols-12">
                        <div className="col-span-12">
                          <Input
                            isRequired
                            label={t("invitationCard.invitationCardName")}
                            placeholder="Name"
                            value={invitationCardName}
                            error={invitationCardNameError}
                            onChange={(e) => {
                              setInvitationCardName(e.target.value);
                              setInvitationCardNameError("");
                            }}
                          />
                        </div>
                        {/* <div className="col-span-2">
                          <div className="mt-10 ml-4 text-left">
                            <input
                              type="checkbox"
                              id="remember"
                              name="remember"
                              checked={other}
                              onChange={(e) => {
                                setOther(e.target.checked);
                                setOtherError("");
                              }}
                            />
                            <label for="remember" className="label ps-2">
                              Other
                              {otherError && <span className="text-xs text-red-500"> {otherError}</span>}
                            </label>
                          </div>
                        </div> */}
                      </div>

                      <div className="w-full text-left">
                        <label className={`label ${selectedFilePath ? "self-start" : "self-center"} `}>
                          {t("invitationCard.invitationCardFile")}{" "}
                          {selectedFilePathError && <span className="text-xs text-red-500">{selectedFilePathError}</span>}{" "}
                        </label>
                        <div className="mt-2">
                          {/* <ChooseFile
                            label="Invitation Card file"
                            onChange={handleImageChange}
                            selectedFile={selectedFilePath}
                            onClickCross={handleCrossClick}
                          /> */}
                          <div className="w-3/12">
                            <ChooseFile
                              onClickCross={handleCrossClick}
                              selectedFile={selectedFilePath}
                              loading={fileUploadLoading}
                              accept="image/png, image/jpeg, image/jpg, video/mp4, video/avi, video/mkv"
                              onChange={handleImageChange}

                              // required={!selectedFilePath ? "Required" : ""}
                            />
                          </div>
                          {fileError && <span className="mt-5 block text-xs text-red-500"> {fileError}</span>}
                        </div>

                        <div className="mt-5">
                          <Input
                            label="Notes"
                            placeholder="Note"
                            value={noteSentTo === "null" ? "" : noteSentTo}
                            error={noteSentToError}
                            onChange={(e) => {
                              setNoteSentTo(e.target.value);
                              setNoteSentToError("");
                            }}
                            textarea
                          />
                        </div>
                      </div>

                      {error && <p className="mt-4 text-red-500">{error}</p>}

                      <div className="mx-auto mt-10 grid w-11/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("invitationCard.addInvitationCard") : t("invitationCard.updateInvitationCard")}
                          type="submit"
                          loading={btnLoading}
                        />
                        <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
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

export default AddInvitationCardModal;
