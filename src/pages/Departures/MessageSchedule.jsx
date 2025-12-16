import React from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import DateAndTime from "../../components/common/DateAndTime";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import ApiServices from "../../api/services";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { useTranslation } from "react-i18next";

const MessageSchedule = ({ label, isOpen, setIsOpen, refreshData, data, setModalData, type}) => {
  // translation
  const { t } = useTranslation("common");

  // Context
  const { eventSelect, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel, setErrorMessage, allContactGroup, getEventList, allEvents } =
    useThemeContext();

  // useStates
  const [event, setEvent] = useState(null);
  const [smsTitle, setSmsTitle] = useState("");
  const [message, setMessage] = useState("");
  const [smsOption, setSmsOption] = useState("");
  const [sendOption, setSendOption] = useState("");
  const [contactOption, setContactOption] = useState("");
  const [selectDateTime, setSelectDateTime] = useState("");

  const [eventError, setEventError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [smsTitleError, setSmsTitleError] = useState("");
  const [smsOptionError, setSmsOptionError] = useState("");
  const [sendOptionError, setSendOptionError] = useState("");
  const [contactOptionError, setContactOptionError] = useState("");
  const [selectDateTimeError, setSelectDateTimeError] = useState("");

  const [groupOptions, setGroupOptions] = useState([]);
  const [groupContacts, setGroupContacts] = useState({});
  const [selectedGroupID, setSelectedGroupID] = useState(null);
  const [selectedContactsByGroup, setSelectedContactsByGroup] = useState({});
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupId, setGroupID] = useState("");

  const [btnLoading2, setBtnLoading2] = useState(false);
  // const [showError, setShowError] = useState(false);


  const fetchAndSelectAllContacts = async () => {
  let allSelected = {};

  for (const group of groupOptions) {
    const groupId = group.value;

    // Fetch contacts for group if not already loaded
    if (!groupContacts[groupId]) {
      await ApiServices.contact.getGroupContactArrival(groupId, { event_id: eventSelect })
        .then((res) => {
          if (res.data?.code === 200) {
            const contacts = res.data.data;

            // Save contacts in state
            setGroupContacts((prev) => ({
              ...prev,
              [groupId]: contacts
            }));

            // Select all users
            allSelected[groupId] = contacts.map(c => c.uuid);
          }
        });
    } else {
      // Contacts already loaded → just select them
      allSelected[groupId] = groupContacts[groupId].map(c => c.uuid);
    }
  }

  // After all contacts fetched → update selection
  setSelectedContactsByGroup(allSelected);
};


  const getLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for timezone offset
    return now.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (e) => {
    const selectedDateTime = e.target.value;
    const currentDateTime = getLocalDateTime();

    if (selectedDateTime < currentDateTime) {
      setSelectDateTimeError("You cannot select a past date and time.");
      setSelectDateTime(""); // Reset invalid selection
    } else {
      setSelectDateTime(selectedDateTime);
      setSelectDateTimeError("");
    }
  };
  
  // Function to handle changes in Send option
  const handleSendOptionChange = (value) => {
    setSendOption(value);
    setSendOptionError("");
    if (value === "sendNow") {
      setSelectDateTime("");
      setSelectDateTimeError("");
    }
  };

  // Function to handle changes in Contact option
  const handleContactOptionChange = async(value) => {
    setContactOption(value);
    setContactOptionError("");
    if (value === "allContacts") {
    await fetchAndSelectAllContacts();
  }
    //setShowError(false); // Hide error if event is selected
  };

  // Function to handle changes in Sms option
  const handleSmsOptionChange = (value) => {
    setSmsOption(value);
    setSmsOptionError("");
  };

  const isValidForm = () => {
    let isValidData = true;

    if (sendOption.trim() === "") {
      setSendOptionError("Required");
      isValidData = false;
    }

    if (contactOption.trim() === "") {
      setContactOptionError("Required");
      isValidData = false;
    }


    if (contactOption === "selectedContacts") {
      // Validate that at least one contact is selected in any group
      const isAnyCheckboxSelected = Object.values(selectedContactsByGroup).some((groupSelectedContacts) => groupSelectedContacts.length > 0);

      if (!isAnyCheckboxSelected) {
        setContactOptionError("At least one checkbox is required");
        isValidData = false;
      }
    }

    if (sendOption === "sendLater" && !selectDateTime) {
      setSelectDateTimeError("Required");
      isValidData = false;
    }

    return isValidData;
  };

  // console.log({ sendOption, contactOption });

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isValidForm()) {
      
      setBtnLoading(true);
      const requestData = {
        // message: message,
        // group_id: selectedContacts,
        event_id: eventSelect,
        send_at: selectDateTime ? toUTCUnixTimestamp(selectDateTime) : "",
        send_now: selectDateTime ? false : true,
        // title: smsTitle,
        send_to: selectedUsers,
        event_id: eventSelect,
        request_type:'departure'
      };
      // console.log("values---", requestData); return false;
      ApiServices.arrivalDeparture.SendArrivalDepartureMessage(requestData)
        .then((res) => {
          // console.log("result---------", res); return false;
          const { data, message } = res;
          if (data?.code === 200) {
            // refreshData(); 
            clearAllData();
            setSelectedContactsByGroup({});
            setGroupContacts({});
            setSelectedContacts({});
            setSelectedGroupID(null);
            openSuccessModal({
              open:true,
              title: t("message.success"),
              message: "Departure Message Sent",
              onClickDone: closeSuccessModel,
            });
            setIsOpen(false);
            setBtnLoading(false);
          }
        })
        .catch((err) => {
          setBtnLoading(false);
        });
    }
  };


  //

  // Clear States
  const clearAllData = () => {
    setEvent(null);
    setSendOption("");
    setContactOption("");
    setSmsOption("");
    setSelectedContacts({});
    setSmsTitle("");
    setMessage("");
    setSelectDateTime("");

    setEventError("");
    setMessageError("");
    setSendOptionError("");
    setContactOptionError("");
    setSmsOptionError("");
    setSmsTitleError("");

    setSelectedContactsByGroup({});
    setGroupContacts({});
    setSelectedGroupID(null);
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
    setErrorMessage("");
  };

  const getGroupNames = () => {
    let payload = {
      event_id: eventSelect,
      from:'departure'
    };
    ApiServices.contact
      .getGroup(payload)
      .then((res) => {
        const { data } = res;
        if (data?.code === 200) {
          const groupNames = data?.data?.data?.map((name) => ({
            value: name?.id,
            label: name?.name,
            count: name?.user_count,
          }));
          setGroupOptions(groupNames);
        }
      })
      .catch((err) => {
        console.error("Error fetching group names:", err);
      });
  };

  const getGroupContact = (groupId) => {
    let payload = {
      event_id: eventSelect,
      from:'departure'
    };
    // console.log("event----------", payload); return false;
    ApiServices.contact
      .getGroupContactArrival(groupId, payload)
      .then((res) => {
        const { data } = res;
        if (data?.code === 200) {
          setGroupContacts((prevGroupContacts) => ({
            ...prevGroupContacts,
            [groupId]: data?.data,
          }));
          // Update selected contacts based on fetched contacts
          setSelectedContactsByGroup((prevSelectedContactsByGroup) => {
            const groupSelectedContacts = prevSelectedContactsByGroup[groupId] || [];
            const contactIds = data?.data.map((contact) => contact.uuid);
            const updatedGroupSelectedContacts = groupSelectedContacts.filter((id) => contactIds.includes(id));
            return {
              ...prevSelectedContactsByGroup,
              [groupId]: updatedGroupSelectedContacts,
            };
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching group contacts:", err);
      });
  };

  const handleGroupClick = (groupId) => {
    setSelectedGroupID(groupId);
    if (!groupContacts[groupId]) {
      getGroupContact(groupId);
    }
  };

  const handleCheckboxChange = (groupId, contactId) => {
    setSelectedContactsByGroup((prevSelectedContactsByGroup) => {
      const groupSelectedContacts = prevSelectedContactsByGroup[groupId] || [];
      const updatedGroupSelectedContacts = groupSelectedContacts.includes(contactId)
        ? groupSelectedContacts.filter((id) => id !== contactId)
        : [...groupSelectedContacts, contactId];

      // Remove the group from selectedContactsByGroup if no contacts are selected
      if (updatedGroupSelectedContacts.length === 0) {
        const { [groupId]: _, ...rest } = prevSelectedContactsByGroup;
        return rest;
      }

      return {
        ...prevSelectedContactsByGroup,
        [groupId]: updatedGroupSelectedContacts,
      };
    });
  };

  // NEW: Handle group checkbox change (select/deselect all users in group)
  const handleGroupCheckboxChange = (groupId) => {
    const groupContactsList = groupContacts[groupId] || [];
    const currentSelectedContacts = selectedContactsByGroup[groupId] || [];
    const allContactIds = groupContactsList.map(contact => contact.uuid);
    
    // If all contacts are selected, deselect all; otherwise, select all
    const isAllSelected = allContactIds.length > 0 && allContactIds.every(id => currentSelectedContacts.includes(id));
    
    setSelectedContactsByGroup((prevSelectedContactsByGroup) => {
      if (isAllSelected) {
        // Deselect all contacts in this group
        const { [groupId]: _, ...rest } = prevSelectedContactsByGroup;
        return rest;
      } else {
        // Select all contacts in this group
        return {
          ...prevSelectedContactsByGroup,
          [groupId]: allContactIds,
        };
      }
    });
  };

  // NEW: Check if group checkbox should be checked/indeterminate
  const getGroupCheckboxState = (groupId) => {
    const groupContactsList = groupContacts[groupId] || [];
    const currentSelectedContacts = selectedContactsByGroup[groupId] || [];
    const allContactIds = groupContactsList.map(contact => contact.uuid);
    
    if (allContactIds.length === 0) {
      return { checked: false, indeterminate: false };
    }
    
    const selectedCount = currentSelectedContacts.length;
    const totalCount = allContactIds.length;
    
    if (selectedCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (selectedCount === totalCount) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  };

  const getSelectedUsersByGroup = () => {
    return Object.entries(selectedContactsByGroup).map(([groupId, userIds]) => ({
      group_id: groupId,
      user_ids: userIds,
    }));
  };

  const selectedUsers = getSelectedUsersByGroup();

  // Use Effects

  // useEffect(() => {
  //   if (data !== null) {
  //     setEvent({ label: data?.event?.name, value: data?.event_id });
  //     setSmsOption(data?.event_id ? "selectedContactsInvited" : "allContactsSelectedAbove");
  //     setSendOption(data?.send_at ? "sendLater" : "sendNow");
  //     setContactOption(data?.send_to?.length > 0 ? "selectedContacts" : "allContacts");
  //     setSelectedContactsByGroup(data?.send_to);
  //     setSmsTitle(data?.title);
  //     setMessage(data?.message);
  //     setSelectDateTime(moment.unix(data?.send_at).format("YYYY-MM-DD HH:mm"));
  //   }
  // }, [isOpen]);

  useEffect(() => {
    if (data !== null) {
      setEvent({ label: data?.event?.name, value: data?.event_id });
      setSmsOption(data?.event_id ? "selectedContactsInvited" : "allContactsSelectedAbove");
      setSendOption(data?.send_at ? "sendLater" : "sendNow");
      setContactOption(data?.send_to?.length > 0 ? "selectedContacts" : "allContacts");

      // Create a temporary state for storing contacts to be selected based on data
      const tempSelectedContactsByGroup = {};

      // Loop through send_to to get the group_id and user_ids
      data?.send_to?.forEach((group) => {
        const { group_id, user_ids } = group;
        tempSelectedContactsByGroup[group_id] = user_ids;
      });

      // Set selected contacts by group state with temp data
      setSelectedContactsByGroup(tempSelectedContactsByGroup);

      setSmsTitle(data?.title);
      setMessage(data?.message);
      setSelectDateTime(moment.unix(data?.send_at).format("YYYY-MM-DD HH:mm"));

      // Fetch and set contacts for each group in send_to
      data?.send_to?.forEach((group) => {
        const { group_id } = group;
        if (!groupContacts[group_id]) {
          getGroupContact(group_id);
        }
      });
    }
  }, [isOpen, data]);

  console.log({ data });

  useEffect(() => {
    getEventList();
  }, []);

  useEffect(() => {
    getGroupNames();
  }, []);

  useEffect(() => {
    if (groupId) {
      getGroupContact();
    }
  }, [groupId]);

  // NEW: useEffect to handle indeterminate state for group checkboxes
  useEffect(() => {
    Object.keys(groupContacts).forEach(groupId => {
      const checkbox = document.getElementById(`group-${groupId}`);
      if (checkbox) {
        const { indeterminate } = getGroupCheckboxState(groupId);
        checkbox.indeterminate = indeterminate;
      }
    });
  }, [selectedContactsByGroup, groupContacts]);

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
                     
                   {t("arrival.messageSchedule")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  {/* <form onSubmit={data === null ? handleSubmit : updateSubmit}> */}
                  <form onSubmit={handleSubmit}>
                    <div className="h-[400px]  overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[400px] 2xl:h-[400px]">
                      {/* <Input
                        isRequired
                        label="Sms Title"
                        placeholder="Sms Title"
                        value={smsTitle}
                        error={smsTitleError}
                        onChange={(e) => {
                          setSmsTitle(e.target.value);
                          setSmsTitleError("");
                        }}
                      /> */}

                      {/* <Dropdown
                        isRequired
                        title="Events"
                        placeholder="Events"
                        withError={eventError}
                        options={allEvents}
                        value={event}
                        onChange={(e) => {
                          setEvent(e);
                          setEventError("");
                        }}
                      /> */}

                      <div className="my-5 w-full space-y-3">
                        <div className="label ltr:text-left rtl:text-right">
                          {t("arrival.selectContact")} <span className="text-red-500">*</span>
                          {contactOptionError && <span className="text-xs text-red-500">{contactOptionError}</span>}
                        </div>

                        <div className="flex items-center">
                          <input
                            id="allContacts"
                            type="radio"
                            value="allContacts"
                            name="contact-radio"
                            checked={contactOption === "allContacts"}
                            onChange={() => handleContactOptionChange("allContacts")}
                            className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                          />
                          <label htmlFor="allContacts" className="ms-2 text-sm font-medium text-gray-900">
                            {t("arrival.allContacts")}
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="selectedContacts"
                            type="radio"
                            value="selectedContacts"
                            name="contact-radio"
                            checked={contactOption === "selectedContacts"}
                            onChange={() => handleContactOptionChange("selectedContacts")}
                            className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                          />
                          <label htmlFor="selectedContacts" className="ms-2 text-sm font-medium text-gray-900">
                            {t("arrival.selectedContacts")}
                          </label>
                        </div>
                      </div>

                      {/* {showError && <div className="mt-2 text-sm text-red-500">Please select an event to choose a contact option.</div>} */}

                      {contactOption === "selectedContacts" && (
                        <div className="mt-5">
                          <div className="label mb-5 ml-6 text-left">
                            <div className="flex items-center gap-x-2">
                              <div className="h-3 w-3 rounded-full bg-black"></div>
                              <div className="font-medium">{t("arrival.groups")}</div>
                            </div>
                            {contactOptionError && <span className="text-xs text-red-500">* {contactOptionError}</span>}
                          </div>
                          <div className="ml-14 flex flex-col space-y-3">
                            {groupOptions?.map((item, index) => {
                              const { checked, indeterminate } = getGroupCheckboxState(item.value);
                              return (
                                <div className="" key={item?.value}>
                                  <div className="flex items-center text-left">
                                    <span className="text-sm font-medium">{index + 1})</span>
                                    
                                    {/* Group Checkbox */}
                                    <input
                                      id={`group-${item.value}`}
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleGroupCheckboxChange(item.value)}
                                      className="ml-2 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                                    />
                                    
                                    <label
                                      htmlFor={item?.value}
                                      onClick={() => handleGroupClick(item.value)}
                                      className="ms-2 flex cursor-pointer items-center gap-x-2 text-left text-sm font-medium text-gray-900"
                                    >
                                      {item?.label}
                                      <span className="text-xs font-semibold text-red-500">({item?.count})</span>
                                      {/* <span className="text-xs text-red-500 ms-2">see contacts</span> */}
                                    </label>
                                  </div>

                                  {selectedGroupID === item.value && (
                                    <div className="mt-2 flex flex-col gap-y-3 pl-2">
                                      {groupContacts[item.value] && groupContacts[item.value].length > 0 ? (
                                        groupContacts[item.value]?.map((contact) => (
                                          <div key={contact?.uuid} className="ml-8 flex items-center ">
                                            <input
                                              id={contact?.uuid}
                                              type="checkbox"
                                              checked={(selectedContactsByGroup[item.value] || []).includes(contact?.uuid)}
                                              onChange={() => handleCheckboxChange(item.value, contact?.uuid)}
                                              className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                                            />
                                            <span className="ms-2 text-xs">{contact.first_name + " " + contact.last_name}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-xs text-gray-500">No contacts available</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 w-full">
                        <div className="label mb-5 ltr:text-left rtl:text-right">
                          {t("arrival.sendSMS")} <span className="text-red-500">*</span>
                          {sendOptionError && <span className="text-xs text-red-500">{sendOptionError}</span>}
                        </div>

                        <div className="mb-3 flex items-center">
                          <input
                            id="sendNow"
                            type="radio"
                            value="sendNow"
                            name="send-radio"
                            checked={sendOption === "sendNow"}
                            onChange={(e) => handleSendOptionChange(e.target.value)}
                            className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                          />
                          <label htmlFor="sendNow" className="ms-2 text-sm font-medium text-gray-900">
                            {t("arrival.sendNow")}
                          </label>
                        </div>

                        {/* <div className="flex items-center">
                          <input
                            id="sendLater"
                            type="radio"
                            value="sendLater"
                            name="send-radio"
                            checked={sendOption === "sendLater"}
                            onChange={() => handleSendOptionChange("sendLater")}
                            className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                          />
                          <label htmlFor="sendLater" className="ms-2 text-sm font-medium text-gray-900">
                            {t("arrival.sendLater")}
                          </label>
                        </div> */}
                      </div>

                      {/* Send Sms Later */}
                      {sendOption === "sendLater" && (
                        <div className="mt-5">
                          <Input
                            isRequired
                            type="datetime-local"
                            label={t("scheduledOn")}
                            placeholder="Select Date & Time"
                            value={selectDateTime}
                            min={getLocalDateTime()} // Prevent past selection in supported browsers
                            onChange={handleDateTimeChange} // Manual validation for all cases
                            error={selectDateTimeError}
                          />
                        </div>
                      )}

                      <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("arrival.proceed") : t("arrival.sendOrSchedule")}
                          type="submit"
                          loading={data === null ? btnLoading : btnLoading2}
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

export default MessageSchedule;