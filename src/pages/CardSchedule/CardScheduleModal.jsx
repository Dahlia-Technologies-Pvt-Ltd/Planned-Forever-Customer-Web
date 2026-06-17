import React from "react";
import Input from "../../components/common/Input";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "../../context/GlobalContext";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import ApiServices from "../../api/services";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { CheckIcon } from "@heroicons/react/24/solid";

const CardScheduleModal = ({ isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");
  const { eventSelect, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel, setErrorMessage, getEventList } = useThemeContext();

  const [sendOption, setSendOption] = useState("sendNow");
  const [contactOption, setContactOption] = useState("");
  const [selectDateTime, setSelectDateTime] = useState("");

  const [sendOptionError, setSendOptionError] = useState("");
  const [contactOptionError, setContactOptionError] = useState("");
  const [selectDateTimeError, setSelectDateTimeError] = useState("");

  const [groupOptions, setGroupOptions] = useState([]);
  const [groupContacts, setGroupContacts] = useState({});
  const [selectedContactsByGroup, setSelectedContactsByGroup] = useState({});
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSelectAllGroup, setPendingSelectAllGroup] = useState(null);
  const [loadedGroupCounts, setLoadedGroupCounts] = useState({});
  const [allEventContacts, setAllEventContacts] = useState([]);

  const [btnLoading2, setBtnLoading2] = useState(false);

  const getLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (e) => {
    const selectedDateTime = e.target.value;
    const currentDateTime = getLocalDateTime();

    if (selectedDateTime < currentDateTime) {
      setSelectDateTimeError("You cannot select a past date and time.");
      setSelectDateTime("");
    } else {
      setSelectDateTime(selectedDateTime);
      setSelectDateTimeError("");
    }
  };

  const handleSendOptionChange = (value) => {
    setSendOption(value);
    setSendOptionError("");
    if (value === "sendNow") {
      setSelectDateTime("");
      setSelectDateTimeError("");
    }
  };

  const handleContactOptionChange = (value) => {
    setContactOption(value);
    setContactOptionError("");
    if (value === "allContacts") {
      setSelectedContactsByGroup({});
      setExpandedGroups([]);
      setPendingSelectAllGroup(null);
    }
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

  const getSelectedUsersByGroup = () => {
    return Object.entries(selectedContactsByGroup)
      .filter(([, userIds]) => userIds.length > 0)
      .map(([groupId, userIds]) => ({
        group_id: groupId,
        user_ids: userIds,
      }));
  };

  const selectedUsers = getSelectedUsersByGroup();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isValidForm()) {
      setBtnLoading(true);
      const requestData = {
        event_id: eventSelect,
        send_at: selectDateTime ? toUTCUnixTimestamp(selectDateTime) : "",
        send_now: selectDateTime ? false : true,
        send_to: selectedUsers,
      };

      ApiServices.Card_Schedule.SendScheduleInvitation(requestData)
        .then((res) => {
          const { data: responseData } = res;

          if (responseData?.code === 200) {
            refreshData();
            clearAllData();
            openSuccessModal({
              title: t("message.success"),
              message: t("cardSchedule.cardScheduleAddedSuccess"),
              onClickDone: closeSuccessModel,
            });
            setIsOpen(false);
            setBtnLoading(false);
          }
        })
        .catch(() => {
          setBtnLoading(false);
        });
    }
  };

  const updateSubmit = async (e) => {
    e.preventDefault();

    if (isValidForm()) {
      setBtnLoading2(true);
      const requestData = {
        event_id: eventSelect,
        send_at: selectDateTime ? toUTCUnixTimestamp(selectDateTime) : "",
        send_now: selectDateTime ? false : true,
        send_to: selectedUsers,
      };

      ApiServices.Card_Schedule.updateScheduleInvitation(data?.id, requestData)
        .then((res) => {
          const { data: responseData } = res;

          if (responseData?.code === 200) {
            refreshData();
            clearAllData();
            openSuccessModal({
              title: t("message.success"),
              message: t("cardSchedule.cardScheduleUpdatedSucess"),
              onClickDone: closeSuccessModel,
            });
            setIsOpen(false);
            setBtnLoading2(false);
          }
        })
        .catch(() => {
          setBtnLoading2(false);
        });
    }
  };

  const clearAllData = () => {
    setSendOption("");
    setContactOption("");
    setSelectDateTime("");
    setSendOptionError("");
    setContactOptionError("");
    setSelectDateTimeError("");
    setSelectedContactsByGroup({});
    setGroupContacts({});
    setExpandedGroups([]);
    setSearchTerm("");
    setPendingSelectAllGroup(null);
    setLoadedGroupCounts({});
    setAllEventContacts([]);
  };

  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
    setErrorMessage("");
  };

  const buildGroupsFromContacts = (contacts) => {
    const grouped = contacts.reduce((accumulator, contact) => {
      const groupId = contact?.group?.id || contact?.group_id;
      const groupLabel = contact?.group?.name || "Ungrouped";

      if (!groupId) {
        return accumulator;
      }

      if (!accumulator[groupId]) {
        accumulator[groupId] = {
          value: groupId,
          label: groupLabel,
          count: 0,
          contacts: [],
        };
      }

      accumulator[groupId].contacts.push(contact);
      accumulator[groupId].count += 1;

      return accumulator;
    }, {});

    const nextGroupOptions = Object.values(grouped);
    const nextGroupContacts = nextGroupOptions.reduce((accumulator, group) => {
      accumulator[group.value] = group.contacts;
      return accumulator;
    }, {});
    const nextLoadedCounts = nextGroupOptions.reduce((accumulator, group) => {
      accumulator[group.value] = group.count;
      return accumulator;
    }, {});

    setGroupOptions(nextGroupOptions);
    setGroupContacts(nextGroupContacts);
    setLoadedGroupCounts(nextLoadedCounts);
  };

  const fetchEventContacts = () => {
    const payload = {
      event_id: eventSelect,
      records_no: 1000,
    };

    ApiServices.contact
      .GetAllContact(payload)
      .then((res) => {
        const { data: responseData } = res;
        if (responseData?.code === 200) {
          const contacts = responseData?.data?.data || responseData?.data || [];
          setAllEventContacts(contacts);
          buildGroupsFromContacts(contacts);
        }
      })
      .catch((err) => {
        console.error("Error fetching contacts for card schedule:", err);
      });
  };

  const getGroupContact = (groupId) => {
    const contacts = groupContacts[groupId] || allEventContacts.filter((contact) => (contact?.group?.id || contact?.group_id) === groupId);

    setGroupContacts((prevGroupContacts) => ({
      ...prevGroupContacts,
      [groupId]: contacts,
    }));
    setLoadedGroupCounts((prevLoadedGroupCounts) => ({
      ...prevLoadedGroupCounts,
      [groupId]: contacts.length,
    }));

    if (pendingSelectAllGroup === groupId) {
      setSelectedContactsByGroup((prevSelectedContactsByGroup) => ({
        ...prevSelectedContactsByGroup,
        [groupId]: contacts.map((contact) => contact.uuid),
      }));
      setPendingSelectAllGroup(null);
    } else {
      setSelectedContactsByGroup((prevSelectedContactsByGroup) => {
        const groupSelectedContacts = prevSelectedContactsByGroup[groupId] || [];
        const contactIds = contacts.map((contact) => contact.uuid);
        return {
          ...prevSelectedContactsByGroup,
          [groupId]: groupSelectedContacts.filter((id) => contactIds.includes(id)),
        };
      });
    }

    return Promise.resolve(contacts);
  };

  const getResolvedGroupCount = (group) => {
    if (typeof loadedGroupCounts[group.value] === "number") {
      return loadedGroupCounts[group.value];
    }

    return Number(group.count || 0);
  };

  const toggleExpandedGroup = (groupId) => {
    setExpandedGroups((prevExpandedGroups) =>
      prevExpandedGroups.includes(groupId) ? prevExpandedGroups.filter((id) => id !== groupId) : [...prevExpandedGroups, groupId],
    );
  };

  const handleGroupClick = (groupId) => {
    setContactOption("selectedContacts");
    setContactOptionError("");
    toggleExpandedGroup(groupId);
    if (!groupContacts[groupId]) {
      getGroupContact(groupId);
    }
  };

  const handleCheckboxChange = (groupId, contactId) => {
    setContactOption("selectedContacts");
    setContactOptionError("");
    setSelectedContactsByGroup((prevSelectedContactsByGroup) => {
      const groupSelectedContacts = prevSelectedContactsByGroup[groupId] || [];
      const updatedGroupSelectedContacts = groupSelectedContacts.includes(contactId)
        ? groupSelectedContacts.filter((id) => id !== contactId)
        : [...groupSelectedContacts, contactId];

      if (updatedGroupSelectedContacts.length === 0) {
        const { [groupId]: removedGroupId, ...rest } = prevSelectedContactsByGroup;
        return rest;
      }

      return {
        ...prevSelectedContactsByGroup,
        [groupId]: updatedGroupSelectedContacts,
      };
    });
  };

  const handleGroupCheckboxChange = (groupId) => {
    setContactOption("selectedContacts");
    setContactOptionError("");

    if (!groupContacts[groupId]) {
      setPendingSelectAllGroup(groupId);
      setExpandedGroups((prevExpandedGroups) => (prevExpandedGroups.includes(groupId) ? prevExpandedGroups : [...prevExpandedGroups, groupId]));
      getGroupContact(groupId);
      return;
    }

    const groupContactsList = groupContacts[groupId] || [];
    const currentSelectedContacts = selectedContactsByGroup[groupId] || [];
    const allContactIds = groupContactsList.map((contact) => contact.uuid);
    const isAllSelected = allContactIds.length > 0 && allContactIds.every((id) => currentSelectedContacts.includes(id));

    setSelectedContactsByGroup((prevSelectedContactsByGroup) => {
      if (isAllSelected) {
        const { [groupId]: removedGroupId, ...rest } = prevSelectedContactsByGroup;
        return rest;
      }

      return {
        ...prevSelectedContactsByGroup,
        [groupId]: allContactIds,
      };
    });
  };

  const getGroupCheckboxState = (groupId) => {
    const groupContactsList = groupContacts[groupId] || [];
    const currentSelectedContacts = selectedContactsByGroup[groupId] || [];
    const allContactIds = groupContactsList.map((contact) => contact.uuid);

    if (allContactIds.length === 0) {
      return { checked: false, indeterminate: false };
    }

    const selectedCount = currentSelectedContacts.length;
    const totalCount = allContactIds.length;

    if (selectedCount === 0) {
      return { checked: false, indeterminate: false };
    }

    if (selectedCount === totalCount) {
      return { checked: true, indeterminate: false };
    }

    return { checked: false, indeterminate: true };
  };

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return groupOptions;
    }

    return groupOptions.filter((group) => {
      const groupMatches = group.label?.toLowerCase().includes(term);
      const contacts = groupContacts[group.value] || [];
      const contactMatches = contacts.some((contact) =>
        `${contact.first_name || ""} ${contact.last_name || ""} ${contact.contact_numbers?.[0]?.contact_number || ""}`.toLowerCase().includes(term),
      );

      return groupMatches || contactMatches;
    });
  }, [groupContacts, groupOptions, searchTerm]);

  const totalGuestCount = useMemo(() => {
    if (contactOption === "allContacts") {
      return groupOptions.reduce((count, group) => count + getResolvedGroupCount(group), 0);
    }

    return Object.values(selectedContactsByGroup).reduce((count, contacts) => count + contacts.length, 0);
  }, [contactOption, groupOptions, loadedGroupCounts, selectedContactsByGroup]);

  const selectedGroupCount = useMemo(() => {
    return Object.values(selectedContactsByGroup).filter((contacts) => contacts.length > 0).length;
  }, [selectedContactsByGroup]);

  const quickSelectCards = useMemo(() => {
    return [
      {
        id: "allGuests",
        label: "All Guests",
        count: groupOptions.reduce((count, group) => count + getResolvedGroupCount(group), 0),
        isSelected: contactOption === "allContacts",
        onClick: () => handleContactOptionChange("allContacts"),
      },
      ...groupOptions.slice(0, 4).map((group) => ({
        id: group.value,
        label: group.label,
        count: getResolvedGroupCount(group),
        isSelected: (selectedContactsByGroup[group.value] || []).length > 0,
        onClick: () => handleGroupCheckboxChange(group.value),
      })),
    ];
  }, [contactOption, groupOptions, loadedGroupCounts, selectedContactsByGroup]);

  useEffect(() => {
    if (data !== null) {
      setSendOption(data?.send_at ? "sendLater" : "sendNow");
      setContactOption(data?.send_to?.length > 0 ? "selectedContacts" : "allContacts");

      const tempSelectedContactsByGroup = {};
      data?.send_to?.forEach((group) => {
        const { group_id, user_ids } = group;
        tempSelectedContactsByGroup[group_id] = user_ids;
      });

      setSelectedContactsByGroup(tempSelectedContactsByGroup);
      setExpandedGroups(data?.send_to?.map((group) => group.group_id) || []);
      setSelectDateTime(data?.send_at ? moment.unix(data?.send_at).format("YYYY-MM-DD HH:mm") : "");

      data?.send_to?.forEach((group) => {
        if (!groupContacts[group.group_id]) {
          getGroupContact(group.group_id);
        }
      });
    }
  }, [data, isOpen]);

  useEffect(() => {
    getEventList();
  }, []);

  useEffect(() => {
    if (isOpen && eventSelect) {
      fetchEventContacts();
    }
  }, [eventSelect, isOpen]);

  useEffect(() => {
    Object.keys(groupContacts).forEach((groupId) => {
      const checkbox = document.getElementById(`group-${groupId}`);
      if (checkbox) {
        const { indeterminate } = getGroupCheckboxState(groupId);
        checkbox.indeterminate = indeterminate;
      }
    });
  }, [groupContacts, selectedContactsByGroup]);

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
          <div className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 lg:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-[980px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_54px_rgba(15,23,42,0.15)] transition-all">
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-rose-50 via-white to-white" />

                <div className="relative p-4 sm:p-4.5">
                  <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 shadow-inner">
                        <PaperAirplaneIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <Dialog.Title className="text-[24px] font-semibold tracking-tight text-slate-800">
                          Schedule Card / Message
                        </Dialog.Title>
                        <p className="mt-1 text-sm text-slate-500">Choose your guests and send your message</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={data === null ? handleSubmit : updateSubmit}>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                      <div className="space-y-4">
                        <div>
                          <div className="inline-flex border-b-2 border-rose-700 pb-2 text-sm font-semibold text-rose-700">Select Guests</div>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row">
                          <div className="relative flex-1">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search groups or guests..."
                              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                            />
                          </div>

                          <button
                            type="button"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <FunnelIcon className="h-5 w-5" />
                            Filters
                          </button>
                        </div>

                        <div>
                          <div className="mb-3 text-sm font-semibold text-slate-700">Quick Select</div>
                          <div className="flex flex-wrap items-stretch gap-3">
                            {quickSelectCards.map((card) => (
                              <button
                                key={card.id}
                                type="button"
                                onClick={card.onClick}
                                className={`inline-flex min-w-[150px] flex-1 items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-left shadow-sm transition ${
                                  card.isSelected
                                    ? "border-rose-300 bg-rose-50/70 shadow-[0_10px_35px_rgba(190,24,93,0.10)]"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <div>
                                  <div className="text-sm font-semibold text-slate-800">{card.label}</div>
                                  <div className="mt-1 text-sm text-slate-500">{card.count} Guests</div>
                                </div>
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                    card.isSelected ? "border-rose-700 bg-rose-700 text-white" : "border-slate-300 text-transparent"
                                  }`}
                                >
                                  <CheckIcon className="h-3.5 w-3.5" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm">
                          <div className="border-b border-slate-100 px-5 py-4">
                            <div className="text-sm font-semibold text-slate-700">Groups</div>
                            {contactOptionError && <div className="mt-1 text-xs text-rose-600">{contactOptionError}</div>}
                          </div>

                          <div className="max-h-[290px] overflow-y-auto px-4 py-3">
                            <div className="space-y-3">
                              {filteredGroups.map((group) => {
                                const isExpanded = expandedGroups.includes(group.value);
                                const visibleContacts = (groupContacts[group.value] || []).filter((contact) =>
                                  `${contact.first_name || ""} ${contact.last_name || ""} ${contact.contact_numbers?.[0]?.contact_number || ""}`
                                    .toLowerCase()
                                    .includes(searchTerm.trim().toLowerCase()),
                                );
                                const hasSearch = searchTerm.trim() !== "";
                                const shownContacts = hasSearch ? visibleContacts : visibleContacts.slice(0, 4);
                                const groupCheckboxState = getGroupCheckboxState(group.value);

                                return (
                                  <div key={group.value} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <div className="flex items-center gap-3 px-4 py-4">
                                      <input
                                        id={`group-${group.value}`}
                                        type="checkbox"
                                        checked={groupCheckboxState.checked}
                                        onChange={() => handleGroupCheckboxChange(group.value)}
                                        className="h-5 w-5 rounded border-slate-300 text-rose-700 focus:ring-rose-200"
                                      />

                                      <button
                                        type="button"
                                        onClick={() => handleGroupClick(group.value)}
                                        className="flex flex-1 items-center justify-between gap-4 text-left"
                                      >
                                        <div>
                                          <div className="text-sm font-semibold text-slate-800">
                                            {group.label} <span className="font-medium text-slate-500">({getResolvedGroupCount(group)} Guests)</span>
                                          </div>
                                        </div>
                                        {isExpanded ? (
                                          <ChevronUpIcon className="h-5 w-5 text-slate-500" />
                                        ) : (
                                          <ChevronDownIcon className="h-5 w-5 text-slate-500" />
                                        )}
                                      </button>
                                    </div>

                                    {isExpanded && (
                                      <div className="border-t border-slate-100 bg-slate-50/50">
                                        {shownContacts.length > 0 ? (
                                          <>
                                            {shownContacts.map((contact) => (
                                              <label
                                                key={contact.uuid}
                                                className="flex cursor-pointer items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-white"
                                              >
                                                <div className="flex items-center gap-3">
                                                  <input
                                                    type="checkbox"
                                                    checked={(selectedContactsByGroup[group.value] || []).includes(contact.uuid)}
                                                    onChange={() => handleCheckboxChange(group.value, contact.uuid)}
                                                    className="h-5 w-5 rounded border-slate-300 text-rose-700 focus:ring-rose-200"
                                                  />
                                                  <span className="text-sm font-medium text-slate-700">
                                                    {contact.first_name} {contact.last_name}
                                                  </span>
                                                </div>
                                                <span className="text-sm text-slate-500">
                                                  {contact.contact_numbers?.[0]?.contact_number || contact.contact_number?.[0] || "-"}
                                                </span>
                                              </label>
                                            ))}

                                            {!hasSearch && visibleContacts.length > shownContacts.length && (
                                              <div className="flex items-center justify-between px-4 py-3 text-sm">
                                                <span className="text-rose-700">+ {visibleContacts.length - shownContacts.length} more guests</span>
                                                <button
                                                  type="button"
                                                  onClick={() => handleGroupCheckboxChange(group.value)}
                                                  className="font-medium text-rose-700 transition hover:text-rose-800"
                                                >
                                                  Select All
                                                </button>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="px-4 py-5 text-sm text-slate-500">
                                            {groupContacts[group.value] ? "No guests found for this search." : "Open the group to load guests."}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>


                      </div>

                      <div className="flex min-w-0 flex-col justify-between gap-4 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div>
                          <div className="text-[22px] font-semibold text-rose-800">Selection Summary</div>

                          <div className="mt-5 space-y-4 text-slate-700">
                            <div>
                              <div className="text-sm text-slate-500">Groups Selected</div>
                              <div className="mt-2 text-2xl font-semibold text-slate-900">{contactOption === "allContacts" ? groupOptions.length : selectedGroupCount}</div>
                            </div>

                            <div>
                              <div className="text-sm text-slate-500">Individual Guests</div>
                              <div className="mt-2 text-2xl font-semibold text-slate-900">{contactOption === "allContacts" ? totalGuestCount : totalGuestCount}</div>
                            </div>
                          </div>

                          <div className="my-5 h-px bg-slate-200" />

                          <div>
                            <div className="text-sm text-slate-500">Total Guests</div>
                            <div className="mt-2 text-3xl font-semibold tracking-tight text-rose-700">{totalGuestCount}</div>
                          </div>

                          <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-slate-600">
                            You can select entire groups or individual guests.
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="inline-flex h-10 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            disabled={(data === null ? btnLoading : btnLoading2) === true}
                            className="inline-flex h-auto min-h-[42px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-700 to-rose-600 px-4 py-2.5 text-base font-medium text-white shadow-[0_16px_30px_rgba(190,24,93,0.16)] transition hover:shadow-[0_18px_34px_rgba(190,24,93,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <PaperAirplaneIcon className="h-4 w-4 shrink-0" />
                            <span className="text-center leading-4">{`Send to ${totalGuestCount} Guests`}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CardScheduleModal;









