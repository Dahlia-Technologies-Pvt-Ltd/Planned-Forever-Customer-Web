import React from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DateAndTime from "../../components/common/DateAndTime";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useThemeContext } from "../../context/GlobalContext";
import ApiServices from "../../api/services";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { useTranslation } from "react-i18next";

const AllocateCarModal = ({ label, isOpen, setIsOpen, refreshData, data }) => {
  const { t } = useTranslation("common");

  const { eventSelect, allCars, allContact, openSuccessModal, closeSuccessModel, getContacts, getCarListing } = useThemeContext();

  const [btnLoading, setBtnLoading] = useState(false);

  const [car, setCar] = useState("");
  const [guestName, setGuestName] = useState("");
  const [allocateToDate, setAllocateToDate] = useState("");
  const [allocateCarNote, setAllocateCarNote] = useState("");
  const [allocateFromDate, setAllocateFromDate] = useState("");

  const [carError, setCarError] = useState("");
  const [guestNameError, setGuestNameError] = useState("");
  const [allocateToDateError, setAllocateToDateError] = useState("");
  const [allocateCarNoteError, setAllocateCarNoteError] = useState("");
  const [allocateFromDateError, setAllocateFromDateError] = useState("");
  const [carAllocationType, setCarAllocationType] = useState(null);
  const [carAllocationTypeError, setCarAllocationTypeError] = useState("");

  const isValidForm = () => {
    let isValidData = true;
    if (car === "") {
      setCarError(" Required");
      isValidData = false;
    }
    if (guestName === "") {
      setGuestNameError(" Required");
      isValidData = false;
    }

    if (allocateToDate === "") {
      setAllocateToDateError(" Required");
      isValidData = false;
    }
    if (allocateFromDate === "") {
      setAllocateFromDateError("Required");
      isValidData = false;
    }
    if (carAllocationType === null || carAllocationType === "") {
      setCarAllocationTypeError(" Required");
      isValidData = false;
    }
    // if (allocateCarNote === "") {
    //   setAllocateCarNoteError(" Required");
    //   isValidData = false;
    // }
    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          car_id: car?.value,
          user_id: guestName?.value,
          from: toUTCUnixTimestamp(allocateFromDate),
          till: toUTCUnixTimestamp(allocateToDate),
          notes: allocateCarNote,
          event_id: eventSelect,
          type: carAllocationType?.value,
        };

        const response =
          data === null ? await ApiServices.allocateCar.addAllocateCar(payload) : await ApiServices.allocateCar.updateAllocateCar(data?.id, payload);
        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: data === null ? t("carAllocation.carAllocationAddedSuccess") : t("carAllocation.carAllocationUpdatedSucess"),
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
      }
    } else {
    }
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setAllocateFromDate(moment.unix(data?.from).format("YYYY-MM-DD HH:mm:ss"));
      setAllocateToDate(moment.unix(data?.till).format("YYYY-MM-DD HH:mm:ss"));
      setAllocateCarNote(data?.notes || "");
      setCar({ label: data?.car?.make_and_model, value: data?.car?.id });
      setGuestName({ label: data?.contact?.first_name + " " + data?.contact?.last_name, value: data?.contact?.uuid });

      // Set car allocation type if it exists in the data
      if (data?.type) {
        const typeOptions = [
          { label: "General", value: "general" },
          { label: "Pick Up", value: "pick_up" },
          { label: "Drop Off", value: "drop_off" },
        ];
        const selectedType = typeOptions.find((option) => option.value === data.type);

        if (selectedType) {
          setCarAllocationType(selectedType);
        }
      }
    }
  }, [isOpen, data]);

  useEffect(() => {
    if (isOpen) {
      getCarListing();
      getContacts();
      getAvaiableCarTime();
    }
  }, [isOpen]);

  // Clear States
  const clearAllData = () => {
    setCar("");
    setGuestName("");
    setAllocateToDate("");
    setAllocateCarNote("");
    setAllocateFromDate("");
    setAvaiableCar([]);
    setCarAllocationType(null);

    setCarError("");
    setGuestNameError("");
    setAllocateToDateError("");
    setAllocateCarNoteError("");
    setAllocateFromDateError("");
    setCarAllocationTypeError("");
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setBtnLoading(false);
  };

  const [avaiableCar, setAvaiableCar] = useState([]);

  const getAvaiableCarTime = () => {
    let payload = {
      from: toUTCUnixTimestamp(allocateFromDate),
      to: toUTCUnixTimestamp(allocateToDate),
      event_id: eventSelect,
    };
    // if (allocateFromDate && allocateToDate) {
    ApiServices.allocateCar
      .getAvaiableCar(payload)
      .then((res) => {
        const { data, message } = res;

        console.log({ gdgdgdgd: data });

        if (data?.code === 200) {
          const formattedContacts = data?.data?.map((item) => ({
            value: item?.id,
            label: item?.make_and_model,
          }));

          setAvaiableCar(formattedContacts);
        }
      })
      .catch((err) => {});
    // }
  };

  useEffect(() => {
    if (allocateFromDate && allocateToDate) {
      getAvaiableCarTime();
    }
  }, [allocateFromDate, allocateToDate]);

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
                      {data === null ? t("carAllocation.allcoateCar") : t("carAllocation.updateAllocateCar")}
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
                        <Dropdown
                          isRequired
                          title={t("carAllocation.guestName")}
                          placeholder={t("carAllocation.guestName")}
                          options={allContact}
                          value={guestName}
                          withError={guestNameError}
                          onChange={(e) => {
                            setGuestName(e);
                            setGuestNameError("");
                          }}
                        />
                        {/* <DateAndTime
                          isRequired
                          error={allocateFromDateError}
                          dateAndTime={allocateFromDate}
                          setDateAndTime={setAllocateFromDate}
                          label="From Date"
                        /> */}

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("carAllocation.fromDate")}
                          placeholder="Select Date & Time"
                          value={allocateFromDate}
                          error={allocateFromDateError}
                          onChange={(e) => {
                            setAllocateFromDate(e.target.value);
                            setAllocateFromDateError("");
                            setAvaiableCar([]);
                            setCar(null);
                          }}
                        />

                        {/* <DateAndTime
                          isRequired
                          error={allocateToDateError}
                          dateAndTime={allocateToDate}
                          setDateAndTime={setAllocateToDate}
                          label="To Date"
                          minDate={allocateFromDate}
                        /> */}

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("carAllocation.toDate")}
                          placeholder="Select Date & Time"
                          value={allocateToDate}
                          onChange={(e) => {
                            setAllocateToDate(e.target.value);
                            setAllocateToDateError("");
                            setAvaiableCar([]);
                            setCar(null);
                          }}
                          min={allocateFromDate}
                          disabled={!allocateFromDate}
                          error={allocateToDateError}
                        />

                        <Dropdown
                          isRequired
                          title={t("carAllocation.car")}
                          placeholder="Car Name"
                          options={avaiableCar}
                          value={car}
                          withError={carError}
                          onChange={(e) => {
                            setCar(e);
                            setCarError("");
                          }}
                        />
                        <Dropdown
                          isRequired
                          title={"Car Allocation Type"}
                          placeholder="Select"
                          options={[
                            { label: "General", value: "general" },
                            { label: "Pick Up", value: "pick_up" },
                            { label: "Drop Off", value: "drop_off" },
                          ]}
                          value={carAllocationType}
                          withError={carAllocationTypeError}
                          onChange={(e) => {
                            setCarAllocationType(e);
                            setCarAllocationTypeError("");
                          }}
                        />
                        {/* <Input
                          isRequired
                          label="Driver"
                          placeholder="Driver Name"
                          error={driverNameError}
                          value={driverName}
                          onChange={(e) => {
                            setDriverName(e.target.value);
                            setDriverNameError("");
                          }}
                        /> */}
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
                          error={allocateCarNoteError}
                          value={allocateCarNote}
                          onChange={(e) => {
                            setAllocateCarNote(e.target.value);
                            setAllocateCarNoteError("");
                          }}
                        />
                      </div>

                      <div className="mx-auto mt-10 grid w-10/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("carAllocation.allcoateCar") : t("carAllocation.updateAllocateCar")}
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

export default AllocateCarModal;
