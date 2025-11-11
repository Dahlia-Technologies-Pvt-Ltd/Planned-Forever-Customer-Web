import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import DateAndTime from "../../components/common/DateAndTime";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useThemeContext } from "../../context/GlobalContext";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { useTranslation } from "react-i18next";

const AllocateHotelRoomModal = ({ label, isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");

  // Context
  const {
    eventSelect,
    setBtnLoading,
    btnLoading,
    openSuccessModal,
    allHotels,
    closeSuccessModel,
    allContact,
    getHotels,
    getEventList,
    allEvents,
    withOutformattedContact,
    getContacts,
  } = useThemeContext();

  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState("");
  const [allRoom, setAllRoom] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [hotelRoomNote, setHotelRoomNote] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomsNumber, setRoomsNumber] = useState("");
  const [roomType, setRoomType] = useState("");
  const [allRoomType, setAllRoomType] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  const [occupantAdult, setOccupantsAdult] = useState("");
  const [occupantChildren, setOccupantChildren] = useState("");
  const [hasArrived, setHasArrived] = useState(false);
  const [eventError, setEventError] = useState("");
  const [guestNameError, setGuestNameError] = useState("");
  const [checkInDateError, setCheckInDateError] = useState("");
  const [checkOutDateError, setCheckOutDateError] = useState("");
  const [hotelError, setHotelError] = useState("");
  const [roomNumberError, setRoomNumberError] = useState("");
  const [occupantsError, setOccupantsError] = useState("");
  const [hasArrivedError, setHasArrivedError] = useState("");
  const [hotelRoomNoteError, setHotelRoomNoteError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [roomTypeError, setRoomTypeError] = useState("");
  const [event, setEvent] = useState(null);
  const [userIdData, setUserIdData] = useState("");
  const { t: commonT } = useTranslation("common");

  // Add state for selected contact
  const [selectedContact, setSelectedContact] = useState(null);

  // States for room occupant selection
  const [showOccupantModal, setShowOccupantModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBedIndex, setSelectedBedIndex] = useState(null);
  const [roomAllocations, setRoomAllocations] = useState({});
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);

  // New state for tracking family allocation status
  const [familyAllocationStatus, setFamilyAllocationStatus] = useState({
    allAllocated: false,
    unallocatedMembers: [],
    allocatedMembers: [],
  });

  const isValidForm = () => {
    let isValidData = true;
    if (guestName === "") {
      setGuestNameError(" Required");
      isValidData = false;
    }
    if (checkInDate === "") {
      setCheckInDateError(" Required");
      isValidData = false;
    }
    if (checkOutDate === "") {
      setCheckOutDateError("Required");
      isValidData = false;
    }
    if (hotel === null) {
      setHotelError(" Required");
      isValidData = false;
    }
    if (roomType === "") {
      setRoomTypeError(" Required");
      isValidData = false;
    }

    return isValidData;
  };

  // Function to check family room allocation status
  const checkFamilyRoomAllocation = (contact) => {
    if (!contact) return { allAllocated: false, unallocatedMembers: [], allocatedMembers: [] };

    const allocatedMembers = [];
    const unallocatedMembers = [];

    // Check main contact (parent)
    if (contact.allocated_rooms && contact.allocated_rooms.length > 0) {
      allocatedMembers.push({
        id: contact.uuid,
        name: `${contact.first_name} ${contact.last_name}`,
        type: "main_guest",
        label: "Main Guest",
        allocated_rooms: contact.allocated_rooms,
      });
    } else {
      unallocatedMembers.push({
        id: contact.uuid,
        name: `${contact.first_name} ${contact.last_name}`,
        type: "main_guest",
        label: "Main Guest",
      });
    }

    // Check children (spouse and minor children)
    if (contact.children) {
      contact.children.forEach((child) => {
        // Only include spouses and minor children (exclude adult children)
        if (child.type === "spouse" || (child.type === "children" && child.isAdult === 0)) {
          if (child.allocated_rooms && child.allocated_rooms.length > 0) {
            allocatedMembers.push({
              id: child.id,
              name: child.name,
              type: child.type === "spouse" ? "spouse" : "child",
              label: child.type === "spouse" ? "Spouse" : "Minor Child",
              allocated_rooms: child.allocated_rooms,
            });
          } else {
            unallocatedMembers.push({
              id: child.id,
              name: child.name,
              type: child.type === "spouse" ? "spouse" : "child",
              label: child.type === "spouse" ? "Spouse" : "Minor Child",
            });
          }
        }
      });
    }

    const allAllocated = unallocatedMembers.length === 0;

    return {
      allAllocated,
      unallocatedMembers,
      allocatedMembers,
    };
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        if (data === null) {
          // Creating new allocation - use bulk format
          const formattedRooms = [];

          Object.entries(roomAllocations).forEach(([roomId, beds]) => {
            const sortedBeds = Object.entries(beds).sort(([a], [b]) => Number(a) - Number(b));

            // Check if main guest is in this room
            const hasMainGuest = sortedBeds.some(([bedIndex, bed]) => bed.occupant_type === "main_guest");

            // Get all children/spouse IDs in this room
            const childIds = sortedBeds.filter(([bedIndex, bed]) => bed.occupant_type !== "main_guest").map(([bedIndex, bed]) => bed.occupant_id);

            // Create room object
            const roomObj = {
              room_id: roomId,
            };

            // If main guest is sharing room with children/spouse
            if (hasMainGuest && childIds.length > 0) {
              // Create array with null for main guest and actual IDs for children
              const childIdsArray = [];

              sortedBeds.forEach(([bedIndex, bed]) => {
                if (bed.occupant_type === "main_guest") {
                  childIdsArray.push(null); // Add null for main guest
                } else {
                  childIdsArray.push(bed.occupant_id); // Add actual child ID
                }
              });

              roomObj.child_ids = childIdsArray;
            }
            // If only children/spouse in room (no main guest)
            else if (!hasMainGuest && childIds.length > 0) {
              roomObj.child_ids = childIds;
            }
            // If only main guest in room, no child_ids property is added

            formattedRooms.push(roomObj);
          });

          const payload = {
            hotel_id: hotel?.value,
            event_id: event?.value || eventSelect,
            user_id: guestName?.value,
            check_in: toUTCUnixTimestamp(checkInDate),
            check_out: toUTCUnixTimestamp(checkOutDate),
            rooms: formattedRooms,
            hasArrived: hasArrived,
            notes: hotelRoomNote,
          };

          console.log("Payload being sent:", payload); // For debugging

          const response = await ApiServices.hotelRoom.addBulkHotelRoom(payload);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("hotelRoom.hotelRoomAddedSuccess"),
              onClickDone: closeSuccessModel,
            });
          } else {
            setBtnLoading(false);
          }
        } else {
          // Updating existing allocation (rest of the code remains the same)
          const updatedRoomId = Object.keys(roomAllocations)[0];

          let payload = {
            hotel_id: hotel?.value,
            room_id: updatedRoomId || data.room_id,
            check_in: toUTCUnixTimestamp(checkInDate),
            check_out: toUTCUnixTimestamp(checkOutDate),
            hasArrived: hasArrived,
            notes: hotelRoomNote,
          };

          const currentRoomAllocation = roomAllocations[updatedRoomId || data.room_id];
          if (currentRoomAllocation) {
            const childAllocation = Object.values(currentRoomAllocation).find((bed) => bed.occupant_type !== "main_guest");

            if (childAllocation) {
              payload.child_id = childAllocation.occupant_id;
            }
          }

          const response = await ApiServices.hotelRoom.updateHotelRoom(data?.id, payload);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("hotelRoom.hotelRoomUpdatedSucess"),
              onClickDone: closeSuccessModel,
            });
          } else {
            setBtnLoading(false);
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
        setErrorMessage(err.response?.data?.message || "An error occurred");
      }
    }
  };

  // Clear States
  const clearAllData = () => {
    setHotelRoomNote("");
    setCheckInDate("");
    setCheckOutDate("");
    setHotel(null);
    setGuestName(null);
    setRoomsNumber("");
    setOccupantsAdult("");
    setOccupantChildren("");
    setGuestNameError("");
    setCheckInDateError("");
    setCheckOutDateError("");
    setHotelError("");
    setEventError("");
    setRoomNumberError("");
    setOccupantsError("");
    setHotelRoomNoteError("");
    setRoomType("");
    setRoomTypeError("");
    setEvent(null);
    setSelectedContact(null);
    setSelectedRoom(null);
    setSelectedBedIndex(null);
    setShowOccupantModal(false);
    setRoomAllocations({});
    setSelectedFamilyMember(null);
    setFamilyAllocationStatus({
      allAllocated: false,
      unallocatedMembers: [],
      allocatedMembers: [],
    });
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

      // Set basic fields
      setGuestName({
        label: data?.user?.first_name + " " + data?.user?.last_name,
        value: data?.user?.uuid,
      });
      setHotel({
        label: data?.hotel?.name,
        value: data?.hotel?.id,
      });
      setEvent({
        label: data?.event?.name,
        value: data?.event?.id,
      });
      setHotelRoomNote(data?.notes);
      setCheckInDate(moment.unix(data?.check_in).format("YYYY-MM-DD HH:mm"));
      setCheckOutDate(moment.unix(data?.check_out).format("YYYY-MM-DD HH:mm"));
      setHasArrived(data?.hasArrived);

      // Set room type from the room data
      if (data?.room?.room_type) {
        setRoomType({
          label: data?.room?.room_type,
          value: data?.room?.room_type,
        });
      }

      // Set room allocation based on whether child exists or not
      if (data?.room_id) {
        const roomAllocation = {};

        // Check if child is empty/null - means parent is allocated
        if (!data?.child_id || data?.child_id === null) {
          // If child is empty, the user (parent) is allocated to this room
          roomAllocation[data.room_id] = {
            0: {
              occupant_id: data.user.uuid,
              occupant_type: "main_guest",
              occupant_name: `${data.user.first_name} ${data.user.last_name} (Main Guest)`,
            },
          };
        } else {
          // If child exists, the child is allocated to this room
          roomAllocation[data.room_id] = {
            0: {
              occupant_id: data.child_id,
              occupant_type: data.child.type === "spouse" ? "spouse" : "child",
              occupant_name: `${data.child.name} (${data.child.type === "spouse" ? "Spouse" : data.child.isAdult ? "Adult Child" : "Minor Child"})`,
            },
          };
        }

        setRoomAllocations(roomAllocation);
      }
    }
  }, [isOpen, data]);

  // Update selected contact when guest name changes
  useEffect(() => {
    if (guestName?.value && withOutformattedContact) {
      const filterContact = withOutformattedContact.find((contact) => contact.uuid === guestName.value);
      console.log("contact", filterContact);

      setSelectedContact(filterContact);

      // Check family allocation status
      if (filterContact) {
        const allocationStatus = checkFamilyRoomAllocation(filterContact);
        setFamilyAllocationStatus(allocationStatus);
        console.log("Family Allocation Status:", allocationStatus);
      }
    } else {
      setSelectedContact(null);
      setFamilyAllocationStatus({
        allAllocated: false,
        unallocatedMembers: [],
        allocatedMembers: [],
      });
    }
  }, [guestName, withOutformattedContact]);

  // Automatically populate occupant fields based on selected contact
  useEffect(() => {
    if (selectedContact) {
      // Count adults: main contact (1) + spouse (if any) only
      let adultCount = 1; // The main contact is always adult

      if (selectedContact.children) {
        // Add spouses (count as adults)
        const spouseCount = selectedContact.children.filter((child) => child.type === "spouse").length;
        adultCount += spouseCount;
      }

      // Count minor children
      let childrenCount = 0;
      if (selectedContact.children) {
        childrenCount = selectedContact.children.filter((child) => child.type === "children" && child.isAdult === 0).length;
      }

      // Set the occupant fields
      setOccupantsAdult(adultCount.toString());
      setOccupantChildren(childrenCount.toString());
    } else {
      // Clear fields when no contact is selected
      setOccupantsAdult("");
      setOccupantChildren("");
    }
  }, [selectedContact]);

  const getHotelId = () => {
    if (hotel) {
      ApiServices.hotelRoom
        .getRoomTypeByHotel(hotel.value)
        .then((res) => {
          const { data, message } = res;

          console.log({ gdgdgdgd: data });

          if (data?.code === 200) {
            const formattedContacts = data?.data?.map((item) => ({
              value: item,
              label: item,
            }));

            setAllRoomType(formattedContacts);
          }
        })
        .catch((err) => {});
    }
  };

  const getRoomsByHotelAndType = () => {
    if (roomType && hotel) {
      let payload = {
        room_type: roomType.value,
        hotel_id: hotel.value,
      };
      ApiServices.hotelRoom
        .getRoomsByHotelAndRoomType(payload)
        .then((res) => {
          const { data, message } = res;

          console.log({ gdgdgdgd: data });

          if (data?.code === 200) {
            setAllRooms(data?.data || []);
          }
        })
        .catch((err) => {
          console.error("Error fetching rooms:", err);
          setAllRooms([]);
        });
    }
  };

  useEffect(() => {
    if (hotel) {
      getHotelId();
    }
  }, [hotel]);

  useEffect(() => {
    if (roomType) {
      getRoomsByHotelAndType();
    }
  }, [roomType]);

  useEffect(() => {
    if (isOpen) {
      getContacts();
      getHotels();
    }
  }, [isOpen]);

  // Function to get the name for pre-existing allocations
  const getPreExistingAllocationName = (room, bedIndex) => {
    // Check if there are pre-existing allocations from the database
    if (room.allocations && room.allocations[bedIndex]) {
      const allocation = room.allocations[bedIndex];

      // If it's the main guest (user_id exists and child_id is null)
      if (allocation.user_id && !allocation.child_id && allocation.user) {
        return `${allocation.user.first_name} ${allocation.user.last_name} (Main Guest)`;
      }

      // If it's a child/family member (child_id exists and child object exists)
      if (allocation.child_id && allocation.child) {
        const childType = allocation.child.type === "spouse" ? "Spouse" : allocation.child.isAdult === 0 ? "Minor Child" : "Adult Child";
        return `${allocation.child.name} (${childType})`;
      }

      // Fallback if we only have user info
      if (allocation.user) {
        return `${allocation.user.first_name} ${allocation.user.last_name}`;
      }
    }

    return null;
  };

  // Function to check if a bed has allocation
  const isBedAllocated = (room, bedIndex) => {
    return roomAllocations[room.id]?.[bedIndex]?.occupant_id;
  };

  // Function to get allocated member name for a bed (combines current and pre-existing)
  const getAllocatedMemberName = (room, bedIndex) => {
    // First check current session allocations
    const allocation = roomAllocations[room.id]?.[bedIndex];
    if (allocation?.occupant_id) {
      // Check if selectedContact exists before accessing its properties
      if (!selectedContact) return null;

      if (allocation.occupant_type === "main_guest") {
        return `${selectedContact.first_name} ${selectedContact.last_name}`;
      }

      const child = selectedContact.children?.find((c) => c.id === allocation.occupant_id);
      if (child) {
        if (child.type === "spouse") return `${child.name}`;
        // Only show minor children, skip adult children
        if (child.type === "children" && child.isAdult === 0) {
          return `${child.name}`;
        }
      }

      return null;
    }

    // If no current allocation, check for pre-existing allocation
    return getPreExistingAllocationName(room, bedIndex);
  };

  // Updated function to get available family members (only unallocated ones)
  const getAvailableFamilyMembers = () => {
    // If we're editing and have data
    if (data) {
      const availableMembers = [];

      // Check if child is empty/null - means parent is allocated
      if (!data?.child_id || data?.child_id === null) {
        // Only show the parent for reallocation
        availableMembers.push({
          id: data.user.uuid,
          name: `${data.user.first_name} ${data.user.last_name}`,
          type: "main_guest",
          label: "Main Guest",
        });
      } else {
        // Only show the specific child for reallocation (exclude adult children)
        if (data.child.type !== "children" || data.child.isAdult === 0) {
          availableMembers.push({
            id: data.child_id,
            name: data.child.name,
            type: data.child.type === "spouse" ? "spouse" : "child",
            label: data.child.type === "spouse" ? "Spouse" : "Minor Child",
          });
        }
      }

      return availableMembers;
    }

    // For new allocations, only show unallocated family members
    return familyAllocationStatus.unallocatedMembers.filter((member) => {
      // Also check current session allocations
      const allocatedInSession = new Set();
      Object.values(roomAllocations).forEach((room) => {
        Object.values(room).forEach((bed) => {
          if (bed.occupant_id) {
            allocatedInSession.add(bed.occupant_id);
          }
        });
      });

      return !allocatedInSession.has(member.id);
    });
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
                <Dialog.Panel className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("hotelRoom.allocateHotelRoom") : t("hotelRoom.updateAllocateHotelRoom")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  {/* Family Allocation Status Warning */}
                  {familyAllocationStatus.allAllocated && data === null && (
                    <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className=" text-sm text-yellow-700">
                            <p>This guest family already has room allocations for all members</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-5">
                    <div className="col-span-7 h-[600px] overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-2 text-secondary"> {t("headings.basicInfo")}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-7 pb-7">
                        <Dropdown
                          isRequired
                          title={t("hotelRoom.guestName")}
                          placeholder={t("hotelRoom.guestName")}
                          options={allContact}
                          withError={guestNameError}
                          value={guestName}
                          onChange={(e) => {
                            setGuestName(e);
                            setGuestNameError("");
                          }}
                        />
                        <Dropdown
                          isRequired
                          title={t("hotelRoom.hotel")}
                          placeholder="Select Hotel"
                          options={allHotels}
                          withError={hotelError}
                          value={hotel}
                          onChange={(e) => {
                            setHotel(e);
                            setHotelError("");
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("hotelRoom.CheckIn")}
                          placeholder="Select Check-in-Date"
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
                          label={t("hotelRoom.CheckOut")}
                          placeholder="Select Check-out Date"
                          value={checkOutDate}
                          error={checkOutDateError}
                          onChange={(e) => {
                            setCheckOutDate(e.target.value);
                            setCheckOutDateError("");
                          }}
                        />

                        <Dropdown
                          isRequired
                          title={t("hotelRoom.roomType")}
                          placeholder={t("hotelRoom.roomType")}
                          options={allRoomType}
                          withError={roomTypeError}
                          value={roomType}
                          onChange={(e) => {
                            setRoomType(e);
                            setRoomTypeError("");
                          }}
                        />
                        <div></div>

                        {/* Only show room selection if there are unallocated members or we're editing */}
                        {((!familyAllocationStatus.allAllocated && familyAllocationStatus.unallocatedMembers.length > 0) || data !== null) &&
                          roomType &&
                          allRooms.length > 0 && (
                            <div className="col-span-2 space-y-2">
                              <h2 className="label ltr:text-left rtl:text-right">Rooms</h2>
                              <div className="grid grid-cols-4 gap-2">
                                {allRooms.map((room) => {
                                  return (
                                    <div key={room.id} className="space-y-3 rounded-md border border-gray-300 p-2">
                                      <h2 className="text-sm font-semibold">Room {room.room_no}</h2>
                                      <div className="grid grid-cols-4 gap-1">
                                        {[...Array(room.capacity)].map((_, index) => {
                                          const isAllocated = isBedAllocated(room, index);
                                          const allocatedName = getAllocatedMemberName(room, index);
                                          const isPreBooked = index < (room.allocations?.length || 0);

                                          return (
                                            <div
                                              key={index}
                                              className={`group relative h-10 w-5 cursor-pointer ${
                                                room.fullyBooked
                                                  ? "bg-red-500"
                                                  : isPreBooked
                                                    ? "bg-red-500"
                                                    : isAllocated
                                                      ? "bg-blue-500 hover:bg-blue-600"
                                                      : "bg-green-500 hover:bg-green-600"
                                              }`}
                                              onClick={() => {
                                                if (!room.fullyBooked && !isPreBooked) {
                                                  if (isAllocated) {
                                                    // Unallocate the bed if it's already allocated
                                                    setRoomAllocations((prev) => {
                                                      const updatedAllocations = { ...prev };
                                                      if (updatedAllocations[room.id] && updatedAllocations[room.id][index]) {
                                                        delete updatedAllocations[room.id][index];
                                                      }
                                                      // If the room becomes empty, remove it entirely
                                                      if (updatedAllocations[room.id] && Object.keys(updatedAllocations[room.id]).length === 0) {
                                                        delete updatedAllocations[room.id];
                                                      }
                                                      return updatedAllocations;
                                                    });
                                                  } else {
                                                    // For update mode, clear all previous allocations before adding new one
                                                    if (data) {
                                                      setRoomAllocations({});
                                                    }
                                                    // Allocate the bed if it's available
                                                    setSelectedRoom(room);
                                                    setSelectedBedIndex(index);
                                                    setShowOccupantModal(true);
                                                  }
                                                }
                                              }}
                                            >
                                              {/* Enhanced tooltip that shows both current and pre-existing allocations */}
                                              {allocatedName && (
                                                <div className="absolute bottom-full left-[65px] mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                                                  {allocatedName}
                                                  {/* Only show "Click to unallocate" for beds you can modify */}
                                                  {!isPreBooked && <div className="text-xs text-gray-300">Click to unallocate</div>}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Show fully allocated room details below all rooms */}
                              {allRooms.filter((room) => room.allocations && room.allocations.length >= room.capacity).length > 0 && (
                                <div className="mt-4 space-y-3">
                                  <h3 className="text-left text-sm font-semibold text-red-700">Fully Allocated Rooms:</h3>
                                  <div className="grid grid-cols-3 gap-2">
                                    {allRooms
                                      .filter((room) => room.allocations && room.allocations.length >= room.capacity)
                                      .map((room) => (
                                        <div key={room.id} className="rounded-md border border-red-200 bg-red-50 p-3">
                                          <div className="mb-2 font-semibold text-red-800">
                                            Room {room.room_no} (Capacity: {room.capacity})
                                          </div>
                                          <div className="space-y-1">
                                            {room.allocations.map((allocation, idx) => (
                                              <div key={idx} className="text-left text-sm text-red-700">
                                                Bed {idx + 1}:{" "}
                                                {allocation.child_id && allocation.child
                                                  ? `${allocation.child.name} (${allocation.child.type === "spouse" ? "Spouse" : allocation.child.isAdult === 0 ? "Minor Child" : "Adult Child"})`
                                                  : allocation.user
                                                    ? `${allocation.user.first_name} ${allocation.user.last_name}`
                                                    : "Unknown Occupant"}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Show message when all family members are allocated */}
                        {familyAllocationStatus.allAllocated && data === null && (
                          <div className="col-span-2 mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="text-center text-sm text-gray-600">
                              All family members already have room allocations. No room selection needed.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="label mb-2 text-secondary">{t("headings.otherInfo")}</div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Input
                          label={t("headings.notes")}
                          placeholder={t("headings.notes")}
                          textarea
                          error={hotelRoomNoteError}
                          value={hotelRoomNote}
                          onChange={(e) => {
                            setHotelRoomNote(e.target.value);
                            setHotelRoomNoteError("");
                          }}
                        />
                      </div>

                      <div className="mt-2 text-left">
                        <input
                          type="checkbox"
                          id="remember"
                          name="remember"
                          checked={hasArrived}
                          onChange={(e) => {
                            setHasArrived(e.target.checked);
                            setHasArrivedError("");
                          }}
                        />
                        <label htmlFor="remember" className="label ps-2">
                          {t("hotelRoom.hasCheckedIn")}
                          {hasArrivedError && <span className="text-xs text-red-500">* {hasArrivedError}</span>}
                        </label>
                      </div>
                      {/* error message */}
                      <div>
                        <p className="text-sm text-red-500">{errorMessage}</p>
                      </div>
                      {/* end error message */}
                      <div className="mt-10 flex justify-center gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("hotelRoom.allocateHotelRoom") : t("hotelRoom.updateAllocateHotelRoom")}
                          type="submit"
                          loading={btnLoading}
                          disabled={familyAllocationStatus.allAllocated && data === null}
                        />
                        <Button icon={<XMarkIcon />} title="Cancel" type="button" buttonColor="bg-red-500" onClick={closeModal} />
                      </div>
                    </div>

                    <div className="col-span-5 mt-5 h-48 w-full rounded-md border border-gray-300 p-4">
                      <h2 className="mb-4 text-base font-semibold">Guest Detail</h2>
                      {selectedContact ? (
                        <div className="space-y-2">
                          <p>
                            <span className="font-semibold">Name:</span> {selectedContact.first_name} {selectedContact.last_name}
                          </p>

                          {/* Display Spouse */}
                          {selectedContact.children &&
                            selectedContact.children
                              .filter((child) => child.type === "spouse")
                              .map((spouse, index) => (
                                <p key={spouse.id || index}>
                                  <span className="font-semibold">Spouse:</span> {spouse.name}
                                </p>
                              ))}
                          {/* Display Minor Children Names */}
                          {selectedContact.children &&
                            selectedContact.children.filter((child) => child.type === "children" && child.isAdult === 0).length > 0 && (
                              <p>
                                <span className="font-semibold"> Children:</span>{" "}
                                {selectedContact.children
                                  .filter((child) => child.type === "children" && child.isAdult === 0)
                                  .map((child) => child.name)
                                  .join(", ")}
                              </p>
                            )}

                          <div className="grid grid-cols-2">
                            {/* Display Adult Count (Main contact + Spouse only) */}
                            <p>
                              <span className="font-semibold">Adults:</span>{" "}
                              {
                                1 + // Main contact
                                  (selectedContact.children ? selectedContact.children.filter((child) => child.type === "spouse").length : 0) // Spouses only
                              }
                            </p>

                            {/* Display Minor Children Count */}
                            <p>
                              <span className="font-semibold">Children:</span>{" "}
                              {selectedContact.children
                                ? selectedContact.children.filter((child) => child.type === "children" && child.isAdult === 0).length
                                : 0}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No guest selected</p>
                      )}
                    </div>
                  </form>

                  {/* Occupant Selection Modal - Now inside Dialog.Panel */}
                  {showOccupantModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center">
                      {/* Backdrop within the modal */}
                      <div
                        className="absolute inset-0"
                        onClick={() => {
                          setShowOccupantModal(false);
                          setSelectedFamilyMember(null);
                        }}
                      />

                      {/* Modal content */}
                      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">
                          Select Occupant for Room {selectedRoom?.room_no} - Bed {selectedBedIndex + 1}
                        </h3>

                        {selectedContact && (
                          <div className="space-y-2">
                            {(() => {
                              const availableMembers = getAvailableFamilyMembers();

                              if (availableMembers.length === 0) {
                                return <div className="py-4 text-center text-gray-500">All family members have been allocated beds</div>;
                              }

                              return (
                                <>
                                  <div className="space-y-3">
                                    {availableMembers.map((member) => (
                                      <label key={member.id} className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                                        <input
                                          type="radio"
                                          name="occupant"
                                          value={member.id}
                                          checked={selectedFamilyMember?.id === member.id}
                                          onChange={() => setSelectedFamilyMember(member)}
                                          className="mr-3"
                                        />
                                        <span className="">
                                          {member.name} ({member.label})
                                        </span>
                                      </label>
                                    ))}
                                  </div>

                                  <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                      type="button"
                                      className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                      onClick={() => {
                                        setShowOccupantModal(false);
                                        setSelectedRoom(null);
                                        setSelectedBedIndex(null);
                                        setSelectedFamilyMember(null);
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                      onClick={() => {
                                        if (selectedFamilyMember) {
                                          // For update mode, ensure only one room is allocated
                                          if (data) {
                                            setRoomAllocations({
                                              [selectedRoom.id]: {
                                                [selectedBedIndex]: {
                                                  occupant_id: selectedFamilyMember.id,
                                                  occupant_type: selectedFamilyMember.type,
                                                  occupant_name: `${selectedFamilyMember.name} (${selectedFamilyMember.label})`,
                                                },
                                              },
                                            });
                                          } else {
                                            // For create mode, allow multiple room allocations
                                            setRoomAllocations((prev) => ({
                                              ...prev,
                                              [selectedRoom.id]: {
                                                ...(prev[selectedRoom.id] || {}),
                                                [selectedBedIndex]: {
                                                  occupant_id: selectedFamilyMember.id,
                                                  occupant_type: selectedFamilyMember.type,
                                                  occupant_name: `${selectedFamilyMember.name} (${selectedFamilyMember.label})`,
                                                },
                                              },
                                            }));
                                          }
                                          setShowOccupantModal(false);
                                          setSelectedFamilyMember(null);
                                        }
                                      }}
                                      disabled={!selectedFamilyMember}
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AllocateHotelRoomModal;
