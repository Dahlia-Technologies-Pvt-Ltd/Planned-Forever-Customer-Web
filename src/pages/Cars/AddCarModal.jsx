import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import RadioInput from "../../components/common/RadioInput";
import DateAndTime from "../../components/common/DateAndTime";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { useThemeContext } from "../../context/GlobalContext";
import ChooseFile from "../../components/common/ChooseFile";
import { mediaUrl } from "../../utilities/config";
import countriesCodeData from "../../utilities/countryCode.json";
import Dropdown from "../../components/common/Dropdown";
import moment from "moment";
import { useTranslation } from "react-i18next";

const AddCarModal = ({ label, isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");

  const { eventSelect, openSuccessModal, closeSuccessModel } = useThemeContext();

  const [paid, setPaid] = useState("");
  const [carNote, setCarNote] = useState("");
  const [carModal, setCarModal] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverNumber, setDriverNumber] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTill, setAvailableTill] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [driverPicture, setDriverPicture] = useState(null);
  const [carPicture, setCarPicture] = useState([]);
  const [contactNumber, setContactNumber] = useState({ countryCode: "", number: "" });
  const [seats, setSeats] = useState("");
  const [seatsError, setSeatsError] = useState("");

  const [contactNumberError, setContactNumberError] = useState("");
  const [paidError, setPaidError] = useState("");
  const [carNoteError, setCarNoteError] = useState("");
  const [carModalError, setCarModalError] = useState("");
  const [carNumberError, setCarNumberError] = useState("");
  const [ownerNameError, setOwnerNameError] = useState("");
  const [driverNameError, setDriverNameError] = useState("");
  const [driverNumberError, setDriverNumberError] = useState("");
  const [availableFromError, setAvailableFromError] = useState("");
  const [availableTillError, setAvailableTillError] = useState("");

  const { t: commonT } = useTranslation("common");

  const isValidForm = () => {
    let isValidData = true;
    if (paid === "") {
      setPaidError("Required");
      isValidData = false;
    }
    // if (carNote === "") {
    //   setCarNoteError(" Required");
    //   isValidData = false;
    // }
    if (carModal === "") {
      setCarModalError(" Required");
      isValidData = false;
    }
    if (carNumber === "") {
      setCarNumberError("Required");
      isValidData = false;
    }
    if (ownerName === "") {
      setOwnerNameError(" Name is Required");
      isValidData = false;
    }
    if (driverName === "") {
      setDriverNameError(" Required");
      isValidData = false;
    }
    // if (driverNumber === "") {
    //   setDriverNumberError(" Required");
    //   isValidData = false;
    // }
    if (availableFrom === "") {
      setAvailableFromError(" Required");
      isValidData = false;
    }
    if (seats === "") {
      setSeatsError(" Required");
      isValidData = false;
    }
    if (availableTill === "") {
      setAvailableTillError("Required");
      isValidData = false;
    }
    if (contactNumber.number === "" && contactNumber.countryCode === "") {
      setContactNumberError(" Required");
      isValidData = false;
    }
    return isValidData;
  };

  console.log({ contactNumber });

  // // Handle Submit
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (isValidForm()) {
  //     if (data === null) {
  //       try {
  //         setBtnLoading(true);

  //         let payload = {
  //           make_and_model: carModal,
  //           number: carNumber,
  //           driver_name: driverName,
  //           driver_contact: driverNumber,
  //           price_status: paid === "Yes" ? 1 : 0,
  //           owner_name: ownerName,
  //           available_from: toUTCUnixTimestamp(availableFrom),
  //           available_till: toUTCUnixTimestamp(availableTill),
  //           notes: carNote,
  //           driver_image: driverPicture,
  //           car_images: carPicture,
  //         };

  //         const response = await ApiServices.car.addCar(payload);

  //         if (response.data.code === 200) {
  //           setBtnLoading(false);
  //           setIsOpen(false);
  //           setModalData(null);
  //           clearAllData();
  //           refreshData();
  //           openSuccessModal({
  //             title: "Success!",
  //             message: "Car added successfully",
  //             onClickDone: (close) => {
  //               closeSuccessModel();
  //             },
  //           });
  //         } else {
  //           setBtnLoading(false);
  //         }
  //       } catch (err) {
  //         // setError(err?.response?.data?.message);
  //         setBtnLoading(false);
  //       }
  //     } else {
  //       try {
  //         setBtnLoading(true);

  //         let payload = {
  //           make_and_model: carModal,
  //           number: carNumber,
  //           driver_name: driverName,
  //           driver_contact: driverNumber,
  //           price_status: paid === "Yes" ? 1 : 0,
  //           owner_name: ownerName,
  //           available_from: toUTCUnixTimestamp(availableFrom),
  //           available_till: toUTCUnixTimestamp(availableTill),
  //           notes: carNote,
  //         };

  //         const response = await ApiServices.car.updateCar(data?.id, payload);

  //         if (response.data.code === 200) {
  //           setBtnLoading(false);
  //           setIsOpen(false);
  //           setModalData(null);
  //           clearAllData();
  //           refreshData();
  //           openSuccessModal({
  //             title: "Success!",
  //             message: "Car has been updated successfully",
  //             onClickDone: (close) => {
  //               closeSuccessModel();
  //             },
  //           });
  //         } else {
  //           setBtnLoading(false);
  //         }
  //       } catch (err) {
  //         // setError(err?.response?.data?.message);
  //         setBtnLoading(false);
  //       }
  //     }
  //   } else {
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isValidForm()) {
      if (data === null) {
        try {
          setBtnLoading(true);
          const transformedData = {
            country_code: contactNumber?.countryCode?.value,
            phone: contactNumber?.number,
          };
          let formData = new FormData();
          formData.append("make_and_model", carModal);
          formData.append("number", carNumber);
          formData.append("driver_name", driverName);
          formData.append("driver_contact", JSON.stringify(transformedData));
          formData.append("price_status", paid === "Yes" ? 1 : 0);
          formData.append("owner_name", ownerName);
          formData.append("available_from", toUTCUnixTimestamp(availableFrom));
          formData.append("available_till", toUTCUnixTimestamp(availableTill));
          formData.append("notes", carNote);
          formData.append("event_id", eventSelect);
          formData.append("seats", seats);

          if (driverPicture) {
            formData.append("driver_image", driverPicture);
          }

          if (carPicture && Array.isArray(carPicture)) {
            carPicture.forEach((image, index) => {
              formData.append(`car_images[${index}]`, image);
            });
          }

          const response = await ApiServices.car.addCar(formData);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("cars.carAddedSuccess"),
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
          let formData = new FormData();
          const transformedData = {
            country_code: contactNumber?.countryCode?.value,
            phone: contactNumber?.number,
          };
          formData.append("make_and_model", carModal);
          formData.append("number", carNumber);
          formData.append("driver_name", driverName);
          formData.append("driver_contact", JSON.stringify(transformedData));
          formData.append("price_status", paid === "Yes" ? 1 : 0);
          formData.append("owner_name", ownerName);
          formData.append("available_from", toUTCUnixTimestamp(availableFrom));
          formData.append("available_till", toUTCUnixTimestamp(availableTill));
          formData.append("notes", carNote);
          formData.append("event_id", eventSelect);
          formData.append("seats", seats);

          if (driverPicture) {
            formData.append("driver_image", driverPicture);
          }

          if (carPicture && Array.isArray(carPicture) && carPicture.length > 0) {
            carPicture.forEach((image, index) => {
              formData.append(`car_images[${index}]`, image);
            });
          } else {
            formData.append("car_images", []);
          }

          const response = await ApiServices.car.updateCar(data?.id, formData);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("cars.carUpdatedSucess"),
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
      // handle invalid form state
    }
  };

  // Clear States
  const clearAllData = () => {
    setPaid("");
    setSeats("");
    setSeatsError("");
    setCarNote("");
    setCarModal("");
    setCarNumber("");
    setOwnerName("");
    setDriverName("");
    setDriverNumber("");
    setAvailableFrom("");
    setAvailableTill("");
    setCarPicture([]);
    setDriverPicture(null);
    setContactNumberError("");
    setContactNumber({ countryCode: "", number: "" });
    setPaidError("");
    setCarNoteError("");
    setCarModalError("");
    setCarNumberError("");
    setOwnerNameError("");
    setDriverNameError("");
    setDriverNumberError("");
    setAvailableFromError("");
    setAvailableTillError("");
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
      setCarModal(data?.make_and_model);
      setCarNote(data?.notes);
      setCarNumber(data?.number);
      setContactNumber({
        countryCode: { value: data?.driver_contact?.country_code, label: data?.driver_contact?.country_code },
        number: data?.driver_contact?.phone,
      });
      setDriverName(data?.driver_name);
      setDriverNumber(data?.driver_contact);
      setAvailableFrom(moment.unix(data?.available_from).format("YYYY-MM-DD HH:mm"));
      setAvailableTill(moment.unix(data?.available_till).format("YYYY-MM-DD HH:mm"));
      setOwnerName(data?.owner_name);
      setPaid(data?.price_status === 1 ? "Yes" : "No");
      setDriverPicture(data?.driver_image);
      setCarPicture(data?.car_images);
      setSeats(data?.seats);
    }
  }, [isOpen]);

  const handleReplyImageChange = (e) => {
    // Get the new files from the input
    const newFiles = Array.from(e.target.files);

    // Use the setCarPicture function to update the state
    setCarPicture((prevFiles) => [...(prevFiles || []), ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setCarPicture(carPicture.filter((_, i) => i !== index));
  };

  const handleRemoveDriverImage = () => {
    setDriverPicture(null);
  };

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
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("cars.addCar") : t("cars.updateCar")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
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
                          label={t("cars.carMakeModel")}
                          placeholder={t("cars.carMakeModel")}
                          value={carModal}
                          error={carModalError}
                          onChange={(e) => {
                            setCarModal(e.target.value);
                            setCarModalError("");
                          }}
                        />
                        <Input
                          isRequired
                          label={t("cars.carNumber")}
                          placeholder={t("cars.carNumber")}
                          value={carNumber}
                          error={carNumberError}
                          onChange={(e) => {
                            setCarNumber(e.target.value);
                            setCarNumberError("");
                          }}
                        />
                      </div>

                      <div className="my-5 ltr:text-left rtl:text-right">
                        <div className="label mb-2">{t("cars.uploadCarImage")}</div>
                        <div className="w-3/12">
                          <ChooseFile
                            onClickCross={handleRemoveFile}
                            placeholder
                            selectedFile={carPicture}
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleReplyImageChange}
                            multi
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          label={t("cars.driverName")}
                          placeholder={t("cars.driverName")}
                          value={driverName}
                          error={driverNameError}
                          onChange={(e) => {
                            setDriverName(e.target.value);
                            setDriverNameError("");
                          }}
                        />
                        <Input
                          isRequired
                          label="Seats"
                          placeholder="Seats"
                          value={seats}
                          error={seatsError}
                          onChange={(e) => {
                            setSeats(e.target.value);
                            setSeatsError("");
                          }}
                        />
                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder="Country Code"
                          value={contactNumber.countryCode}
                          onChange={(e) => {
                            setContactNumber({ ...contactNumber, countryCode: e });
                            setContactNumberError("");
                          }}
                          withError={contactNumberError}
                          title={t("cars.driverName")}
                          isRequired
                        />

                        <div className="mt-6">
                          <Input
                            placeholder="Contact Number"
                            value={contactNumber.number}
                            onChange={(e) => {
                              setContactNumber({ ...contactNumber, number: e.target.value });
                              setContactNumberError("");
                            }}
                            type="tel"
                            error={contactNumberError}
                            invisible
                            label="Contact Number"
                          />
                        </div>

                        {/* <Input
                          isRequired
                          label="Driver Number "
                          placeholder="Driver Number"
                          value={driverNumber}
                          error={driverNumberError}
                          onChange={(e) => {
                            setDriverNumber(e.target.value);
                            setDriverNumberError("");
                          }}
                        /> */}
                      </div>

                      <div className="my-5 ltr:text-left rtl:text-right">
                        <div className="label mb-2">{t("cars.uploadDriverPicture")} </div>
                        <div className="w-3/12">
                          <ChooseFile
                            onClickCross={handleRemoveDriverImage}
                            placeholder
                            selectedFile={driverPicture}
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => setDriverPicture(e.target.files[0])}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          label={t("carsOwnerName")}
                          placeholder={t("carsOwnerName")}
                          value={ownerName}
                          error={ownerNameError}
                          onChange={(e) => {
                            setOwnerName(e.target.value);
                            setOwnerNameError("");
                          }}
                        />

                        {/* <DateAndTime
                          isRequired
                          dateAndTime={availableFrom}
                          error={availableFromError}
                          setDateAndTime={setAvailableFrom}
                          label="Available From"
                        /> */}
                        <div className="w-full">
                          <div className="label mb-5 ltr:text-left rtl:text-right">
                            {t("cars.paid")} <span className="text-red-500">*</span>
                            {paidError && <span className="text-xs text-red-500">{paidError}</span>}
                          </div>
                          <RadioInput
                            name="Paid"
                            options={[
                              { id: "Yes", value: "Yes", label: t("cars.yes") },
                              { id: "No", value: "No", label: t("cars.no") },
                            ]}
                            Classes="flex items-center gap-x-10"
                            value={paid}
                            onChange={(value) => {
                              setPaid(value);
                              setPaidError("");
                            }}
                            checked={paid}
                          />
                        </div>
                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("cars.availableFrom")}
                          placeholder="Select Start Date & Time"
                          value={availableFrom ? availableFrom : ""}
                          error={availableFromError}
                          onChange={(e) => {
                            setAvailableFrom(e.target.value);
                            setAvailableFromError("");
                          }}
                        />

                        {/* <DateAndTime
                          isRequired
                          dateAndTime={availableTill}
                          error={availableTillError}
                          setDateAndTime={setAvailableTill}
                          label="Available Till"
                          minDate={availableFrom}
                        /> */}

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("cars.availableTill")}
                          placeholder="Select Start Date & Time"
                          value={availableTill ? availableTill : ""}
                          error={availableTillError}
                          onChange={(e) => {
                            setAvailableTill(e.target.value);
                            setAvailableTillError("");
                          }}
                          min={availableTill}
                        />
                      </div>

                      <div className="mt-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-2 text-secondary">{t("headings.otherInfo")}</div>
                          {/* <div className="rounded-full border-[1.5px] border-solid border-secondary"></div> */}
                        </div>
                      </div>

                      <div className="mt-5">
                        <Input
                          // isRequired
                          label={t("headings.notes")}
                          placeholder={t("headings.notes")}
                          textarea
                          error={carNoteError}
                          value={carNote}
                          onChange={(e) => {
                            setCarNote(e.target.value);
                            setCarNoteError("");
                          }}
                        />
                      </div>

                      <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("cars.addCar") : t("cars.updateCar")}
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

export default AddCarModal;
