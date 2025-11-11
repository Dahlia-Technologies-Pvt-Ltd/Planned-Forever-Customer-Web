import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DateAndTime from "../../components/common/DateAndTime";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { PlusCircleIcon, MinusCircleIcon, PencilIcon } from "@heroicons/react/24/solid";
import MapPicker from "../../components/MapPicker";
import { useTranslation } from "react-i18next";

const AddHotelModal = ({ isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");

  // Context
  const { eventSelect, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel } = useThemeContext();

  const [hotelName, setHotelName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [hotelNote, setHotelNote] = useState("");
  const [roomsNumber, setRoomsNumber] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [venueAddressError, setVenueAddressError] = useState("");
  const [items, setItems] = useState([{ roomType: "", numberOfRoom: "" }]);

  const [errors, setErrors] = useState([{ roomType: "", numberOfRoom: "" }]);

  const [hotelNameError, setHotelNameError] = useState("");
  const [roomTypeError, setRoomTypeError] = useState("");
  const [roomNumberError, setRoomNumberError] = useState("");
  const [checkInDateError, setCheckInDateError] = useState("");
  const [checkOutDateError, setCheckOutDateError] = useState("");
  const [hotelNoteError, setHotelNoteError] = useState("");
  const [location, setLocation] = useState({ address: "", lat: "", lng: "" });

  const isValidForm = () => {
    let isValidData = true;
    if (hotelName === "") {
      setHotelNameError(" Required");
      isValidData = false;
    }
    // if (roomType === "") {
    //   setRoomTypeError(" Required");
    //   isValidData = false;
    // }
    // if (roomsNumber === "") {
    //   setRoomNumberError("Required");
    //   isValidData = false;
    // }
    if (checkInDate === "") {
      setCheckInDateError(" Required");
      isValidData = false;
    }
    if (checkOutDate === "") {
      setCheckOutDateError("Required");
      isValidData = false;
    }

    // const newErrors = errors.map((error, index) => {
    //   const currentItem = items[index];
    //   let itemError = { roomType: "", numberOfRoom: "" };

    //   if (!currentItem.roomType) {
    //     itemError.roomType = "Required";
    //     isValidData = false;
    //   }

    //   if (!location?.address) {
    //     setVenueAddressError(" Required");
    //     isValidData = false;
    //   }

    //   if (!currentItem.numberOfRoom) {
    //     itemError.numberOfRoom = "Required";
    //     isValidData = false;
    //   }

    //   return itemError;
    // });
    // setErrors(newErrors);

    // if (hotelNote === "") {
    //   setHotelNoteError(" Required");
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
          name: hotelName,
          // room_type: roomType,
          // room_no: roomsNumber,
          room: items.map((item) => ({
            type: item.roomType,
            no_of_rooms: item.numberOfRoom,
          })),
          longitude: location?.lng,
          latitude: location?.lat,
          address: location.address,
          check_in: toUTCUnixTimestamp(checkInDate),
          check_out: toUTCUnixTimestamp(checkOutDate),
          notes: hotelNote,
          event_id: eventSelect,
        };

        const response = data === null ? await ApiServices.hotels.addHotel(payload) : await ApiServices.hotels.updateHotel(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          setModalData(null);
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: data === null ? t("hotels.hotelAddedSuccess") : t("hotels.hotelUpdatedSuccess"),
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

  // Clear States
  const clearAllData = () => {
    setHotelName("");
    setHotelNote("");
    setCheckInDate("");
    setCheckOutDate("");
    setRoomType("");
    setRoomsNumber("");
    setHotelNameError("");
    setRoomNumberError("");
    setCheckInDateError("");
    setCheckOutDateError("");
    setHotelNoteError("");
    setRoomTypeError("");
    setLocation({ address: "", lat: "", lng: "" });
    setVenueAddressError("");
    setItems([{ roomType: "", numberOfRoom: "" }]);
    setErrors([{ roomType: "", numberOfRoom: "" }]);
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

  console.log({ data });

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setHotelName(data?.name);
      setHotelNote(data?.notes);
      // setRoomType(data?.room_type);
      // setRoomsNumber(data?.room_no);
      // setCheckInDate(new Date(data?.check_in * 1000));
      // setCheckOutDate(new Date(data?.check_out * 1000));
      setLocation({ address: data?.address, lat: data?.latitude, lng: data?.longitude });
      const items = data?.room || [];
      const currentItem = items.map((item) => ({
        roomType: item.type,
        numberOfRoom: item.no_of_rooms,
      }));
      setItems(currentItem);
      setCheckInDate(moment.unix(data?.check_in).format("YYYY-MM-DD HH:mm"));
      setCheckOutDate(moment.unix(data?.check_out).format("YYYY-MM-DD HH:mm"));
    }
  }, [isOpen]);

  console.log({ location });

  const addNewFieldSet = (e) => {
    e.preventDefault();
    let isValid = true;

    const newErrors = items.map((currentItem) => {
      let itemError = { roomType: "", numberOfRoom: "" };

      if (!currentItem.roomType) {
        itemError.roomType = "Required";
        isValid = false;
      }

      if (!currentItem.numberOfRoom) {
        itemError.numberOfRoom = "Required";
        isValid = false;
      }

      return itemError;
    });

    setErrors(newErrors);

    if (isValid) {
      setItems([...items, { roomType: "", numberOfRoom: "" }]);
      setErrors([...errors, { roomType: "", numberOfRoom: "" }]);
    }
  };

  const handleInputChange = (e, index, field) => {
    const value = e.target.value;
    console.log({ value });
    const updatedItems = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);

    const updatedErrors = errors.map((error, idx) => {
      if (idx === index) {
        return { ...error, [field]: "" };
      }
      return error;
    });
    setErrors(updatedErrors);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    const updatedErrors = errors.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    setErrors(updatedErrors);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    if (selectedLocation) {
      setVenueAddressError("");
    }
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
                <Dialog.Panel className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("hotels.addHotel") : t("hotels.updateHotel")}
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
                          label={t("hotels.hotelName")}
                          placeholder={t("hotels.hotelName")}
                          value={hotelName}
                          error={hotelNameError}
                          onChange={(e) => {
                            setHotelName(e.target.value);
                            setHotelNameError("");
                          }}
                        />

                        {/* <Input
                          label="Room Type"
                          placeholder="Room Type"
                          value={roomType}
                          // error={roomTypeError}
                          onChange={(e) => {
                            setRoomType(e.target.value);
                            setRoomTypeError("");
                          }}
                        /> */}
                        {/* <Input
                          label="Number of Rooms"
                          placeholder="Number of Rooms"
                          value={roomsNumber}
                          // error={roomNumberError}
                          onChange={(e) => {
                            setRoomsNumber(e.target.value);
                            setRoomNumberError("");
                          }}
                          type="number"
                        /> */}

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("hotels.checkInDate")}
                          placeholder={t("hotels.checkInDate")}
                          value={checkInDate}
                          error={checkInDateError}
                          onChange={(e) => {
                            setCheckInDate(e.target.value);
                            setCheckInDateError("");
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("hotels.checkOutDate")}
                          placeholder={t("hotels.checkOutDate")}
                          value={checkOutDate}
                          error={checkOutDateError}
                          onChange={(e) => {
                            setCheckOutDate(e.target.value);
                            setCheckOutDateError("");
                          }}
                        />

                        {/* <DateAndTime
                          isRequired
                          dateAndTime={checkInDate}
                          setDateAndTime={setCheckInDate}
                          error={checkInDateError}
                          setError={setCheckInDateError}
                          label="Check-in-Date"
                        />
                        <DateAndTime
                          minDate={checkInDate}
                          isRequired
                          setError={setCheckOutDateError}
                          dateAndTime={checkOutDate}
                          setDateAndTime={setCheckOutDate}
                          error={checkOutDateError}
                          label="Checkout Date"
                        /> */}
                      </div>

                      {/* <div className="mt-5 text-left">
                        {items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 items-center gap-x-5">
                            <div className="col-span-5">
                              <Input
                                placeholder={t("hotels.roomType")}
                                label={`${index === 0 ? t("hotels.roomType") : ""}`}
                                error={errors[index]?.roomType}
                                labelOnTop
                                value={item?.roomType}
                                onChange={(e) => handleInputChange(e, index, "roomType")}
                              />
                            </div>
                            <div className="col-span-5">
                              <Input
                                placeholder={t("hotels.numberOfRooms")}
                                label={`${index === 0 ? t("hotels.numberOfRooms") : ""}`}
                                labelOnTop
                                type="number"
                                error={errors[index]?.numberOfRoom}
                                value={item?.numberOfRoom}
                                onChange={(e) => handleInputChange(e, index, "numberOfRoom")}
                              />
                            </div>
                            <div className="col-span-2">
                              {index > 0 && (
                                <MinusCircleIcon
                                  className="ml-1.5 mt-3 inline-block h-10 w-10 cursor-pointer text-red-500"
                                  onClick={() => handleDeleteItem(index)}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                        <button className="mt-4 rounded-lg bg-secondary px-4 py-2 text-white" onClick={addNewFieldSet}>
                          {t("hotels.addAnother")}
                        </button>
                      </div> */}

                      <div className="mt-5 grid grid-cols-12">
                        <div className="col-span-8 md:col-span-12 lg:col-span-12 xl:col-span-8">
                          <div className="mt-3">
                            <MapPicker
                              label={t("hotels.hotelAddress")}
                              setLocation={setLocation}
                              placeholder={t("hotels.hotelAddress")}
                              onLocationSelect={handleLocationSelect}
                              location={location}
                              venueAddressError={venueAddressError}
                            />
                          </div>
                        </div>
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
                          value={hotelNote}
                          error={hotelNoteError}
                          onChange={(e) => {
                            setHotelNote(e.target.value);
                            setHotelNoteError("");
                          }}
                        />
                      </div>

                      <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("buttons.save") : t("buttons.save")}
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

export default AddHotelModal;
