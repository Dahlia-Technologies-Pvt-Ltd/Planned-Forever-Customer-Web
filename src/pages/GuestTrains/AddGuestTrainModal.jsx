import React from "react";
import moment from "moment";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { useTranslation } from "react-i18next";

const AddGuestTrainModal = ({ isOpen, setIsOpen, data, refreshData, setModalData }) => {
  const { t } = useTranslation("common");

  // Context
  const { 
    eventSelect, 
    setBtnLoading, 
    btnLoading, 
    openSuccessModal, 
    allEvents, 
    closeSuccessModel, 
    allContact, 
    getEventList, 
    getContacts,
    withOutformattedContact 
  } = useThemeContext();

  // useState
  const [guest, setGuest] = useState(null);
  const [selectedGuestDetails, setSelectedGuestDetails] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [event, setEvent] = useState(null);
  const [serverError, setServerError] = useState("");
  const [departureFrom, setDepartureFrom] = useState("");
  const [arrivingAt, setArrivingAt] = useState("");
  const [departureDateTime, setDepartureDateTime] = useState("");
  const [arrivalDateTime, setArrivalDateTime] = useState("");
  const [trainNo, setTrainNo] = useState("");
  const [boogieNo, setBoogieNo] = useState("");

  // Family member booking details
  const [memberBookingDetails, setMemberBookingDetails] = useState({});

  // validation states
  const [guestError, setGuestError] = useState("");
  const [eventError, setEventError] = useState("");
  const [departureFromError, setDepartureFromError] = useState("");
  const [arrivingAtError, setArrivingAtError] = useState("");
  const [departureDateTimeError, setDepartureDateTimeError] = useState("");
  const [arrivalDateTimeError, setArrivalDateTimeError] = useState("");
  const [trainNoError, setTrainNoError] = useState("");
  const [boogieNoError, setBoogieNoError] = useState("");
  const [memberBookingError, setMemberBookingError] = useState("");

  // Get selected guest details and family members
  const handleGuestSelection = (selectedGuest, isUpdate = false, updateData = null) => {
    setGuest(selectedGuest);
    setGuestError("");
    
    if (selectedGuest && withOutformattedContact) {
      // Find the selected guest details from withOutformattedContact array
      const guestDetails = withOutformattedContact.find(contact => contact.uuid === selectedGuest.value);
      
      if (guestDetails) {
        setSelectedGuestDetails(guestDetails);
        
        // Create family members array including the main guest
        const allFamilyMembers = [
          {
            id: guestDetails.uuid,
            name: `${guestDetails.first_name} ${guestDetails.last_name}`,
            type: 'primary',
            isAdult: 1,
            gender: guestDetails.gender
          },
          ...(guestDetails.children || []).map(child => ({
            id: child.id,
            name: child.name,
            type: child.type,
            isAdult: child.isAdult,
            gender: child.gender
          }))
        ];
        
        setFamilyMembers(allFamilyMembers);
        
        // Initialize booking details for each family member
        const initialBookingDetails = {};
        
        if (isUpdate && updateData) {
          // For update mode, populate with existing data
          allFamilyMembers.forEach(member => {
            if (member.type === 'primary') {
              // Main guest booking details come from the main train record
              initialBookingDetails[member.id] = {
                seatNo: updateData.seat_no || '',
                bookingPnr: updateData.booking_pnr || ''
              };
            } else {
              // Find matching child in update data children array
              const existingChild = updateData.children?.find(child => child.id === member.id);
              initialBookingDetails[member.id] = {
                seatNo: existingChild?.seat_no || '',
                bookingPnr: existingChild?.booking_pnr || ''
              };
            }
          });
        } else {
          // For add mode, initialize with empty values
          allFamilyMembers.forEach(member => {
            initialBookingDetails[member.id] = {
              seatNo: '',
              bookingPnr: ''
            };
          });
        }
        
        setMemberBookingDetails(initialBookingDetails);
      }
    } else {
      setSelectedGuestDetails(null);
      setFamilyMembers([]);
      setMemberBookingDetails({});
    }
  };

  // Update member booking details
  const updateMemberBookingDetail = (memberId, field, value) => {
    setMemberBookingDetails(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
    setMemberBookingError("");
  };

  // Validations
  const isValidForm = () => {
    let isValidData = true;

    if (!guest) {
      setGuestError("Required");
      isValidData = false;
    } else {
      setGuestError("");
    }

    if (!departureFrom) {
      setDepartureFromError("Required");
      isValidData = false;
    } else {
      setDepartureFromError("");
    }

    if (!arrivingAt) {
      setArrivingAtError("Required");
      isValidData = false;
    } else {
      setArrivingAtError("");
    }

    if (!departureDateTime) {
      setDepartureDateTimeError("Required");
      isValidData = false;
    } else {
      setDepartureDateTimeError("");
    }

    if (!arrivalDateTime) {
      setArrivalDateTimeError("Required");
      isValidData = false;
    } else {
      setArrivalDateTimeError("");
    }

    if (!trainNo) {
      setTrainNoError("Required");
      isValidData = false;
    } else {
      setTrainNoError("");
    }

    if (!boogieNo) {
      setBoogieNoError("Required");
      isValidData = false;
    } else {
      setBoogieNoError("");
    }

    // Validate that all family members have booking PNR (seat number is optional)
    const hasInvalidMember = familyMembers.some(member => 
      !memberBookingDetails[member.id]?.bookingPnr
    );
    
    if (hasInvalidMember) {
      setMemberBookingError("Booking PNR is required for all family members");
      isValidData = false;
    } else {
      setMemberBookingError("");
    }

    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        // Find main guest details for main booking
        const mainGuest = familyMembers.find(member => member.type === 'primary');

        // Create children array with booking details (exclude main guest)
        const children = familyMembers
          .filter(member => member.type !== 'primary')
          .map(member => ({
            id: member.id,
            name: member.name,
            booking_pnr: memberBookingDetails[member.id]?.bookingPnr || '',
            seat_no: memberBookingDetails[member.id]?.seatNo || ''
          }));

        // Create single payload with main guest details and children array
        let payload = {
          event_id: eventSelect,
          user_id: guest?.value,
          departure_datetime: toUTCUnixTimestamp(departureDateTime),
          arrival_datetime: toUTCUnixTimestamp(arrivalDateTime),
          departure_from: departureFrom,
          arrival_at: arrivingAt,
          flight_train_no: trainNo,
          booking_pnr: memberBookingDetails[mainGuest?.id]?.bookingPnr || '',
          seat_no: memberBookingDetails[mainGuest?.id]?.seatNo || '',
          boogie_no: boogieNo,
          type: "Train",
          children: children
        };

        console.log("Train Payload for API:", payload);

        const response = data === null 
          ? await ApiServices.guestTrain.addGuestTrain(payload)
          : await ApiServices.guestTrain.updateGuestTrain(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          setModalData(null);
          setServerError("");
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: data === null ? t("guestTrain.trainAddedSuccess") : t("guestTrain.trainUpdatedSuccess"),
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
          setServerError(response.data.message || "Failed to save train data.");
        }
      } catch (err) {
        console.error("Error submitting guest train data:", err);
        setServerError(err.response?.data?.message || "An error occurred while saving guest train data.");
        setBtnLoading(false);
      } finally {
        setBtnLoading(false);
      }
    }
  };

  // Clear States
  const clearAllData = () => {
    setGuest(null);
    setSelectedGuestDetails(null);
    setFamilyMembers([]);
    setMemberBookingDetails({});
    setEvent(null);
    setDepartureFrom("");
    setArrivingAt("");
    setDepartureDateTime("");
    setArrivalDateTime("");
    setTrainNo("");
    setBoogieNo("");
    setGuestError("");
    setEventError("");
    setDepartureFromError("");
    setArrivingAtError("");
    setDepartureDateTimeError("");
    setArrivalDateTimeError("");
    setTrainNoError("");
    setBoogieNoError("");
    setMemberBookingError("");
    setServerError("");
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
      setEvent({ label: data?.event?.name, value: data?.event?.id });
      setGuest({ label: data?.user?.first_name + " " + data?.user?.last_name, value: data?.user?.uuid });
      setDepartureFrom(data?.departure_from);
      setArrivingAt(data?.arrival_at);
      setDepartureDateTime(moment.unix(data?.departure_datetime).format("YYYY-MM-DD HH:mm"));
      setArrivalDateTime(moment.unix(data?.arrival_datetime).format("YYYY-MM-DD HH:mm"));
      setTrainNo(data?.flight_train_no);
      setBoogieNo(data?.boogie_no || "");
      
      // Handle existing data for family members if available
      if (data?.user?.uuid) {
        // Wait for withOutformattedContact to be available, then handle guest selection
        const timer = setTimeout(() => {
          handleGuestSelection(
            { label: data?.user?.first_name + " " + data?.user?.last_name, value: data?.user?.uuid },
            true, // isUpdate flag
            data // updateData
          );
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, data, withOutformattedContact]);

  useEffect(() => {
    if (isOpen) {
      getContacts();
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
                      {data === null ? t("guestTrain.addGuestTrain") : t("guestTrain.updateGuestTrain")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="max-h-[700px] overflow-y-auto p-2 md:max-h-[500px] lg:max-h-[500px] xl:max-h-[600px] 2xl:max-h-[700px]">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <div className="label mb-2 text-secondary">{t("headings.basicInfo")}</div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-7">
                        <Dropdown
                          isRequired
                          title={t("guestTrain.guestName")}
                          placeholder="Guest Name"
                          options={allContact}
                          withError={guestError}
                          value={guest}
                          onChange={(selectedGuest) => handleGuestSelection(selectedGuest, false, null)}
                        />
                        <Input
                          isRequired
                          label={t("guestTrain.departureFrom")}
                          placeholder="Departure From"
                          value={departureFrom}
                          error={departureFromError}
                          onChange={(e) => {
                            setDepartureFrom(e.target.value);
                            setDepartureFromError("");
                          }}
                        />
                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("guestTrain.departureDateTime")}
                          placeholder="Select Departure Date & Time"
                          value={departureDateTime}
                          error={departureDateTimeError}
                          onChange={(e) => {
                            setDepartureDateTime(e.target.value);
                            setDepartureDateTimeError("");
                          }}
                        />
                        <Input
                          isRequired
                          label={t("guestTrain.arrivingAt")}
                          placeholder="Arriving At"
                          value={arrivingAt}
                          error={arrivingAtError}
                          onChange={(e) => {
                            setArrivingAt(e.target.value);
                            setArrivingAtError("");
                          }}
                        />
                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("guestTrain.arrivalDateTime")}
                          placeholder="Select Arrival Date & Time"
                          value={arrivalDateTime}
                          error={arrivalDateTimeError}
                          onChange={(e) => {
                            setArrivalDateTime(e.target.value);
                            setArrivalDateTimeError("");
                          }}
                        />
                        <Input
                          isRequired
                          label={t("guestTrain.trainNo")}
                          placeholder="Train No"
                          value={trainNo}
                          error={trainNoError}
                          onChange={(e) => {
                            setTrainNo(e.target.value);
                            setTrainNoError("");
                          }}
                        />
                        <Input
                          isRequired
                          label="Boogie No"
                          placeholder="Boogie No"
                          value={boogieNo}
                          error={boogieNoError}
                          onChange={(e) => {
                            setBoogieNo(e.target.value);
                            setBoogieNoError("");
                          }}
                        />
                      </div>

                      {/* Family Members Section */}
                      {familyMembers.length > 0 && (
                        <div className="mt-8">
                          <div className="mb-5 ltr:text-left rtl:text-right">
                            <div className="label mb-2 text-secondary">Family Members Booking Details</div>
                          </div>
                          
                          <div className="space-y-6">
                            {familyMembers.map((member, index) => (
                              <div key={member.id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="mb-3">
                                  <h4 className="font-medium text-gray-800">
                                    {member.name} 
                                    <span className="ml-2 text-sm text-gray-600">
                                      ({member.type === 'primary' ? 'Main Guest' : member.type})
                                      {member.isAdult === 1 ? ' - Adult' : ' - Child'}
                                    </span>
                                  </h4>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <Input
                                    label="Seat No"
                                    placeholder="Enter seat number"
                                    value={memberBookingDetails[member.id]?.seatNo || ''}
                                    onChange={(e) => updateMemberBookingDetail(member.id, 'seatNo', e.target.value)}
                                  />
                                  <Input
                                    isRequired
                                    label="Booking PNR"
                                    placeholder="Enter booking PNR"
                                    value={memberBookingDetails[member.id]?.bookingPnr || ''}
                                    onChange={(e) => updateMemberBookingDetail(member.id, 'bookingPnr', e.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {memberBookingError && (
                            <div className="mt-2">
                              <span className="text-xs text-red-500">{memberBookingError}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {serverError && (
                        <div className="mt-4">
                          <span className="text-xs text-red-500">{serverError}</span>
                        </div>
                      )}

                      <div className="mx-auto mt-10 flex justify-center gap-7">
                        <Button
                          loading={btnLoading}
                          icon={<CheckIcon />}
                          title={data === null ? t("guestTrain.addGuestTrain") : t("guestTrain.updateGuestTrain")}
                          type="submit"
                        />
                        <Button
                          icon={<XMarkIcon />}
                          title={t("buttons.cancel")}
                          type="button"
                          buttonColor="bg-red-500"
                          onClick={closeModal}
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

export default AddGuestTrainModal;