import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import RadioInput from "../../components/common/RadioInput";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { set } from "lodash";
import ChooseFile from "../../components/common/ChooseFile";
import { useTranslation } from "react-i18next";

const AddUserModal = ({ label, isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");

  // useContext
  const { eventSelect, openSuccessModal, closeSuccessModel, userTypeOption, getUserType } = useThemeContext();

  // useState for data
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [salutation, setSalutation] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [emailAddress, setEmailAddress] = useState("");

  // useState for error
  const [lastNameError, setLastNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [userTypeError, setUserTypeError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [salutationError, setSalutationError] = useState("");
  const [userStatusError, setUserStatusError] = useState("");
  const [emailAddressError, setEmailAddressError] = useState("");
  const [serverErr, setServerErr] = useState("");

  const isValidForm = () => {
    let isValidData = true;

    if (!lastName) {
      setLastNameError("Required");
      isValidData = false;
    } else {
      setLastNameError("");
    }
    if (!userType) {
      setUserTypeError("Required");
      isValidData = false;
    } else {
      setUserTypeError("");
    }
    if (!firstName) {
      setFirstNameError("Required");
      isValidData = false;
    } else {
      setFirstNameError("");
    }
    if (!salutation) {
      setSalutationError("Required");
      isValidData = false;
    } else {
      setSalutationError("");
    }
    if (!userStatus) {
      setUserStatusError("Required");
      isValidData = false;
    } else {
      setUserStatusError("");
    }
    if (!emailAddress) {
      setEmailAddressError("Required");
      isValidData = false;
    } else {
      setEmailAddressError("");
    }
    {
      data === null && (!password ? (setPasswordError("Required"), (isValidData = false)) : setPasswordError(""));
    }

    return isValidData;
  };

  const [fileLoading, setFileLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [identityFile, setIndentityFile] = useState(null);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      if (data === null) {
        try {
          setBtnLoading(true);
          let payload = {
            salutation: salutation,
            first_name: firstName,
            last_name: lastName,
            role: userType?.value,
            email: emailAddress,
            password: password,
            status: userStatus === "Active" ? 1 : 0,
            // role_id: userType?.value,
            profile_image: file,
            event_id: eventSelect,
          };
          const response = await ApiServices.users.addUser(payload);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("users.userAddedSuccess"),
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setBtnLoading(false);
          setServerErr(err?.response?.data?.message);
        }
      } else {
        try {
          setBtnLoading(true);

          let payload = {
            salutation: salutation,
            first_name: firstName,
            last_name: lastName,
            role: userType?.label,
            email: emailAddress,
            status: userStatus === "Active" ? 1 : 0,
            // role_id: userType?.value,
            profile_image: file,
            event_id: eventSelect,
          };

          const response = await ApiServices.users.updateUser(data?.uuid, payload);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("users.userUpdatedSucess"),
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setServerErr(err?.response?.data?.message);
          setBtnLoading(false);
        }
      }
    }
  };

  const [fileError, setFileError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    const uploadFile = (file) => {
      const formData = new FormData();
      formData.append("file", file);

      setFileLoading(true);

      ApiServices.contact
        .contactProfileUpload(formData)
        .then((res) => {
          const { data, message } = res;

          if (res.code === 200) {
            setIndentityFile(file);
            setFile(data);
            setFileLoading(false);
            setFileError("");
            event.target.value = null;
          }
        })
        .catch((err) => {
          setFileLoading(false);
          setFileError(err.response.data.message);
        });
    };

    // Call the uploadFile function passing the 'file' parameter
    uploadFile(file);
  };

  const handleCrossClick = () => {
    setIndentityFile(null);
    setFile(null);
  };

  // Clear States
  const clearAllData = () => {
    setLastName("");
    setPassword("");
    setFirstName("");
    setSalutation("");
    setUserType(null);
    setUserStatus(null);
    setEmailAddress("");
    setPasswordError("");
    setLastNameError("");
    setUserTypeError("");
    setFirstNameError("");
    setSalutationError("");
    setUserStatusError("");
    setEmailAddressError("");
    setServerErr("");
    setIndentityFile(null);
    setFile("");
    setFileError("");
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setFirstName(data?.first_name);
      setSalutation(data?.salutation);
      setLastName(data?.last_name);
      setUserStatus(data?.status === 1 ? "Active" : "Inactive");
      setUserType({ label: data?.role?.name, value: data?.role?.id });
      setEmailAddress(data?.email);
      setIndentityFile(data?.profile_image);
      setFile(data?.profile_image);
      // setPassword(data?.)
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getUserType();
    }
  }, [isOpen]);

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
                      {data === null ? t("users.addUser") : t("users.updateUser")}
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
                    <div className="h-[600px] overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-2 text-secondary">{t("headings.basicInfo")}</div>
                          {/* <div className="rounded-full border-[1.5px] border-solid border-secondary"></div> */}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          label={t("users.salutation")}
                          placeholder={t("users.salutation")}
                          value={salutation}
                          error={salutationError}
                          onChange={(e) => {
                            setSalutation(e.target.value);
                            setSalutationError("");
                          }}
                        />
                        <Input
                          isRequired
                          label={t("users.firstName")}
                          placeholder={t("users.firstName")}
                          value={firstName}
                          error={firstNameError}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setFirstNameError("");
                          }}
                        />
                        <Input
                          isRequired
                          label={t("users.lastName")}
                          placeholder={t("users.lastName")}
                          value={lastName}
                          error={lastNameError}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setLastNameError("");
                          }}
                        />
                        <Input
                          isRequired
                          label={t("users.emailAddress")}
                          placeholder={t("users.emailAddress")}
                          value={emailAddress}
                          error={emailAddressError}
                          onChange={(e) => {
                            setEmailAddress(e.target.value);
                            setEmailAddressError("");
                          }}
                        />
                        <Dropdown
                          isRequired
                          title={t("users.userType")}
                          placeholder="Select User type"
                          value={userType}
                          withError={userTypeError}
                          options={userTypeOption}
                          onChange={(e) => {
                            setUserType(e);
                            setUserTypeError("");
                          }}
                        />

                        {data === null && (
                          <Input
                            isRequired
                            label={t("users.password")}
                            placeholder={t("users.password")}
                            value={password}
                            error={passwordError}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setPasswordError("");
                            }}
                          />
                        )}

                        <div className="flex flex-col items-start">
                          <div className="label mb-4">
                            {t("users.userStatus")}
                            <span className="text-red-500">*</span>{" "}
                            {userStatusError && <span className="text-xs text-red-500">{userStatusError}</span>}
                          </div>

                          <RadioInput
                            name="Gender"
                            options={[
                              {
                                id: "Active",
                                value: "Active",
                                label: t("users.active"),
                              },
                              { id: "Inactive", value: "InActive", label: t("users.inactive") },
                            ]}
                            Classes="flex"
                            labelClasses="ml-3"
                            onChange={(value) => setUserStatus(value)}
                            checked={userStatus}
                          />
                        </div>
                      </div>

                      <div className="my-5 ltr:text-left rtl:text-right">
                        <div className="label mb-2">{t("users.profileImage")}</div>
                        <div className="w-3/12">
                          <ChooseFile
                            onClickCross={handleCrossClick}
                            placeholder
                            selectedFile={identityFile}
                            loading={fileLoading}
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                      {fileError && <span className="mt-5 block text-xs text-red-500"> {fileError}</span>}

                      {serverErr && <p className="mt-4 text-red-500">{serverErr}</p>}

                      <div className="mx-auto mt-20 grid w-9/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("users.addUser") : t("users.updateUser")}
                          type="submit"
                          loading={btnLoading}
                        />
                        <Button
                          icon={<XMarkIcon />}
                          title={t("buttons.cancel")}
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

export default AddUserModal;
