import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { useThemeContext } from "../../context/GlobalContext";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";

const AddHotelRoomSetupModal = ({ isOpen, setIsOpen, data, setModalData, refreshData }) => {
  const { t } = useTranslation("common");

  // Context
  const { eventSelect, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel, allHotels, getHotels } = useThemeContext();

  // State for hotels and rooms
  const [hotel, setHotel] = useState(null);
  const [hotelError, setHotelError] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomTypeError, setRoomTypeError] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [roomNoError, setRoomNoError] = useState("");
  const [capacity, setCapacity] = useState("");
  const [capacityError, setCapacityError] = useState("");
  const [fullyBooked, setFullyBooked] = useState(false);

  // Validate Form
  const isValidForm = () => {
    let isValidData = true;

    if (hotel === null) {
      setHotelError(t("validation.required"));
      isValidData = false;
    }

    if (!roomType) {
      setRoomTypeError(t("validation.required"));
      isValidData = false;
    }

    if (!roomNo) {
      setRoomNoError(t("validation.required"));
      isValidData = false;
    }

    if (!capacity) {
      setCapacityError(t("validation.required"));
      isValidData = false;
    }

    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isValidForm()) {
      try {
        setBtnLoading(true);

        const payload = {
          hotel_id: hotel.value,
          room_type: roomType,
          room_no: roomNo,
          capacity: parseInt(capacity),
          fullyBooked: fullyBooked,
          event_id: eventSelect,
        };

        // Determine if it's an edit or create
        const res = data ? await ApiServices.hotelRooms.updateHotelRoom(data.id, payload) : await ApiServices.hotelRooms.createHotelRoom(payload);

        if (res.data.code === 200) {
          closeModal();

          // Success modal
          openSuccessModal({
            title: t("message.success"),
            message: data ? t("hotels.hotelRoomUpdateSuccess") : t("hotels.hotelRoomCreateSuccess"),
            onClickDone: () => {
              closeSuccessModel();
              refreshData();
            },
          });
        }
      } catch (err) {
        console.error("Error submitting hotel room:", err);
      } finally {
        setBtnLoading(false);
      }
    }
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

  // Clear All Data
  const clearAllData = () => {
    setHotel(null);
    setHotelError("");
    setRoomType("");
    setRoomTypeError("");
    setRoomNo("");
    setRoomNoError("");
    setCapacity("");
    setCapacityError("");
    setFullyBooked(false);
  };

  // Populate form when editing
  useEffect(() => {
    if (data && isOpen) {
      setHotel({
        label: data.hotel?.name,
        value: data.hotel_id,
      });
      setRoomType(data.room_type || "");
      setRoomNo(data.room_no || "");
      setCapacity(data.capacity?.toString() || "");
      setFullyBooked(data.fullyBooked || false);
    }
  }, [data, isOpen]);

  useEffect(() => {
    if (isOpen) {
      getHotels();
    }
  }, [isOpen]);

  return (
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
                    {data ? t("hotels.editHotelRoom") : t("hotels.addHotelRoom")}
                  </Dialog.Title>
                  <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="h-[410px] overflow-y-auto p-2">
                    <div className="mb-5 ltr:text-left rtl:text-right">
                      <div className="label mb-2 text-secondary">{t("headings.basicInfo")}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-7">
                      {/* Hotel Dropdown */}
                      <Dropdown
                        isRequired
                        title={t("hotels.hotelName")}
                        placeholder={t("hotels.hotelName")}
                        options={allHotels}
                        withError={hotelError}
                        value={hotel}
                        onChange={(e) => {
                          setHotel(e);
                          setHotelError("");
                        }}
                      />

                      {/* Room Type */}
                      <Input
                        isRequired
                        label={t("hotels.roomType")}
                        placeholder={t("hotels.roomType")}
                        value={roomType}
                        error={roomTypeError}
                        onChange={(e) => {
                          setRoomType(e.target.value);
                          setRoomTypeError("");
                        }}
                      />

                      {/* Room Number */}
                      <Input
                        isRequired
                        label={t("hotels.room")}
                        placeholder={t("hotels.room")}
                        value={roomNo}
                        error={roomNoError}
                        onChange={(e) => {
                          setRoomNo(e.target.value);
                          setRoomNoError("");
                        }}
                      />

                      {/* Capacity */}
                      <Input
                        isRequired
                        label={t("hotels.capacity")}
                        placeholder={t("hotels.capacity")}
                        type="number"
                        value={capacity}
                        error={capacityError}
                        onChange={(e) => {
                          setCapacity(e.target.value);
                          setCapacityError("");
                        }}
                      />
                    </div>

                    {/* Fully Booked Checkbox */}
                    <div className="mt-5">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="fullyBooked"
                          checked={fullyBooked}
                          onChange={(e) => setFullyBooked(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-secondary focus:ring-secondary"
                        />
                        <label htmlFor="fullyBooked" className="ml-2 text-sm font-medium text-primary-color">
                          {t("hotels.fullyBooked")}
                        </label>
                      </div>
                    </div>
                    <div className="mt-20 flex justify-center gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={data ? t("hotels.editHotelRoom") : t("hotels.addHotelRoom")}
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
  );
};

export default AddHotelRoomSetupModal;
