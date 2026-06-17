import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import RadioInput from "../../components/common/RadioInput";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { useThemeContext } from "../../context/GlobalContext";
import ChooseFile from "../../components/common/ChooseFile";
import countriesCodeData from "../../utilities/countryCode.json";
import Dropdown from "../../components/common/Dropdown";
import moment from "moment";
import { useTranslation } from "react-i18next";

const AddCarModal = ({ label, isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");

  const { eventSelect, eventDetail, openSuccessModal, closeSuccessModel } = useThemeContext();

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
  const eventWindowStart = eventDetail?.start_date ? moment.unix(eventDetail.start_date).subtract(120, "hours") : null;
  const eventWindowEnd = eventDetail?.end_date ? moment.unix(eventDetail.end_date).add(120, "hours") : null;
  const eventWindowStartValue = eventWindowStart ? eventWindowStart.format("YYYY-MM-DDTHH:mm") : "";
  const eventWindowEndValue = eventWindowEnd ? eventWindowEnd.format("YYYY-MM-DDTHH:mm") : "";

  const isWithinEventWindow = (value) => {
    if (!value || !eventWindowStart || !eventWindowEnd) return true;
    const current = moment(value);
    return current.isBetween(eventWindowStart, eventWindowEnd, undefined, "[]");
  };

  const isPaidStatus = (value) => value === 1 || value === "1" || value === true;

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

    if (availableFrom && !isWithinEventWindow(availableFrom)) {
      setAvailableFromError(" Must be within 120 hours before event start and 120 hours after event end");
      isValidData = false;
    }

    if (availableTill && !isWithinEventWindow(availableTill)) {
      setAvailableTillError(" Must be within 120 hours before event start and 120 hours after event end");
      isValidData = false;
    }

    if (availableFrom && availableTill && moment(availableFrom).isAfter(moment(availableTill))) {
      setAvailableFromError(" From date must be before Till date");
      setAvailableTillError(" Till date must be after From date");
      isValidData = false;
    }

    return isValidData;
  };

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
      setPaid(isPaidStatus(data?.price_status) ? "Yes" : "No");
      setDriverPicture(data?.driver_image);
      setCarPicture(data?.car_images);
      setSeats(data?.seats);
    } else if (isOpen) {
      clearAllData();
    }
  }, [isOpen, data]);

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
                <Dialog.Panel className="w-full max-w-[760px] overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  <div className="flex items-center justify-between border-b px-5 py-4">
                    <Dialog.Title as="h3" className="font-poppins text-sm font-semibold leading-6 text-secondary-color">
                      {data === null ? t("cars.addCar") : t("cars.updateCar")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-5 w-5 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit} className="[&_.label]:text-xs [&_.label]:font-medium [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:text-sm [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:text-sm [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:min-h-[34px] [&_.css-hlgwow]:py-0 [&_.css-19bb58m]:my-0 [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-5 [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-5 [&_input]:h-9 [&_input]:text-sm [&_textarea]:text-sm">
                    <div className="max-h-[70vh] overflow-y-auto px-4 py-3.5">
                      <div className="mb-4 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-1.5 text-[10px] font-medium text-secondary">{t("headings.basicInfo")}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
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

                      <div className="my-3 ltr:text-left rtl:text-right">
                        <div className="label mb-2">{t("cars.uploadCarImage")}</div>
                        <div className="w-4/12">
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

                      <div className="grid grid-cols-2 gap-4">
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
                          title={t("Country Code")}
                          isRequired
                          controlMinHeight="32px"
                          compact
                        />

                          <Input
                            label="Contact Number"
                            placeholder="Contact Number"
                            value={contactNumber.number}
                            onChange={(e) => {
                              setContactNumber({ ...contactNumber, number: e.target.value });
                              setContactNumberError("");
                            }}
                            type="tel"
                            error={contactNumberError}
                          />

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

                      <div className="my-3 ltr:text-left rtl:text-right">
                        <div className="label mb-2">{t("cars.uploadDriverPicture")} </div>
                        <div className="w-4/12">
                          <ChooseFile
                            onClickCross={handleRemoveDriverImage}
                            placeholder
                            selectedFile={driverPicture}
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => setDriverPicture(e.target.files[0])}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          isRequired
                          label={t("Cars Ownername")}
                          placeholder={t("Cars Ownername")}
                          value={ownerName}
                          error={ownerNameError}
                          onChange={(e) => {
                            setOwnerName(e.target.value);
                            setOwnerNameError("");
                          }}
                        />

                        <div className="w-full">
                          <div className="label mb-6 text-[10px] font-medium ltr:text-left rtl:text-right">
                            {t("cars.paid")} <span className="text-red-500">*</span>
                            {paidError && <span className="text-xs text-red-500">{paidError}</span>}
                          </div>
                          <RadioInput
                            name="Paid"
                            options={[
                              { id: "Yes", value: "Yes", label: t("cars.yes") },
                              { id: "No", value: "No", label: t("cars.no") },
                            ]}
                            Classes="flex items-center gap-x-6 text-xs"
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
                          min={eventWindowStartValue}
                          max={eventWindowEndValue}
                          onChange={(e) => {
                            setAvailableFrom(e.target.value);
                            setAvailableFromError("");
                            if (availableTillError === " Till date must be after From date") {
                              setAvailableTillError("");
                            }
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("cars.availableTill")}
                          placeholder="Select Start Date & Time"
                          value={availableTill ? availableTill : ""}
                          error={availableTillError}
                          min={availableFrom || eventWindowStartValue}
                          max={eventWindowEndValue}
                          onChange={(e) => {
                            setAvailableTill(e.target.value);
                            setAvailableTillError("");
                            if (availableFromError === " From date must be before Till date") {
                              setAvailableFromError("");
                            }
                          }}
                        />
                      </div>

                      <div className="mt-3 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-1.5 text-[10px] font-medium text-secondary">{t("headings.otherInfo")}</div>
                        </div>
                      </div>

                      <div className="mt-3">
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

                      <div className="mx-auto mt-6 grid w-full max-w-[360px] grid-cols-2 gap-3">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("cars.addCar") : t("cars.updateCar")}
                          type="submit"
                          loading={btnLoading}
                          className="h-8 text-xs"
                        />
                        <Button
                          icon={<XMarkIcon />}
                          title={t("buttons.cancel")}
                          type="button"
                          buttonColor="bg-red-500"
                          onClick={closeModal}
                          className="h-8 text-xs"
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

export default AddCarModal;
