import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import ApiServices from "../../api/services";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const MessageSchedule = ({ isOpen, setIsOpen, refreshData, data, setModalData }) => {
  const { t } = useTranslation("common");
  const { eventSelect, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel, setErrorMessage } = useThemeContext();

  const [sendOption, setSendOption] = useState("sendNow");
  const [contactOption, setContactOption] = useState("");

  const [contactOptionError, setContactOptionError] = useState("");

  const [groupOptions, setGroupOptions] = useState([]);
  const [groupContacts, setGroupContacts] = useState({});
  const [selectedContactsByGroup, setSelectedContactsByGroup] = useState({});
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSelectAllGroup, setPendingSelectAllGroup] = useState(null);
  const [loadedGroupCounts, setLoadedGroupCounts] = useState({});
  const [allEventContacts, setAllEventContacts] = useState([]);

  const clearAllData = () => {
    setSendOption("sendNow");
    setContactOption("");
    setContactOptionError("");
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

  const isValidForm = () => {
    let isValidData = true;

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

    return isValidData;
  };

  const getSelectedUsersByGroup = () =>
    Object.entries(selectedContactsByGroup)
      .filter(([, userIds]) => userIds.length > 0)
      .map(([groupId, userIds]) => ({
        group_id: groupId,
        user_ids: userIds,
      }));

  const selectedUsers = getSelectedUsersByGroup();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidForm()) return;

    try {
      setBtnLoading(true);

      const requestData = {
        event_id: eventSelect,
        send_at: "",
        send_now: true,
        send_to: selectedUsers,
        request_type: "arrival",
      };

      const res = await ApiServices.arrivalDeparture.SendArrivalDepartureMessage(requestData);
      const { data: responseData } = res;

      if (responseData?.code === 200) {
        refreshData();
        clearAllData();
        openSuccessModal({
          open: true,
          title: t("message.success"),
          message: "Arrival Message Sent",
          onClickDone: closeSuccessModel,
        });
        setIsOpen(false);
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
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

  const fetchEventContacts = async () => {
    try {
      const payload = {
        event_id: eventSelect,
        records_no: 1000,
      };

      const res = await ApiServices.contact.GetAllContact(payload);
      const { data: responseData } = res;

      if (responseData?.code === 200) {
        const contacts = responseData?.data?.data || responseData?.data || [];
        setAllEventContacts(contacts);
        buildGroupsFromContacts(contacts);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  const getGroupContact = async (groupId) => {
    try {
      const contacts = groupContacts[groupId] || allEventContacts.filter((contact) => (contact?.group?.id || contact?.group_id) === groupId);

      setGroupContacts((prevGroupContacts) => ({
        ...prevGroupContacts,
        [groupId]: contacts,
      }));

      setLoadedGroupCounts((prevLoadedCounts) => ({
        ...prevLoadedCounts,
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

      return contacts;
    } catch (err) {
      console.error("Error fetching group contacts:", err);
      return [];
    }
  };

  const fetchAndSelectAllContacts = async () => {
    const allSelected = {};

    for (const group of groupOptions) {
      const groupId = group.value;
      const contacts = groupContacts[groupId] || (await getGroupContact(groupId));
      allSelected[groupId] = contacts.map((contact) => contact.uuid);
    }

    setSelectedContactsByGroup(allSelected);
    setExpandedGroups([]);
  };

  const handleContactOptionChange = async (value) => {
    setContactOption(value);
    setContactOptionError("");

    if (value === "allContacts") {
      await fetchAndSelectAllContacts();
    }
  };

  const toggleExpandedGroup = (groupId) => {
    setExpandedGroups((prevExpandedGroups) =>
      prevExpandedGroups.includes(groupId)
        ? prevExpandedGroups.filter((id) => id !== groupId)
        : [...prevExpandedGroups, groupId],
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
      setExpandedGroups((prevExpandedGroups) =>
        prevExpandedGroups.includes(groupId) ? prevExpandedGroups : [...prevExpandedGroups, groupId],
      );
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

  const getResolvedGroupCount = (group) => {
    if (typeof loadedGroupCounts[group.value] === "number") {
      return loadedGroupCounts[group.value];
    }

    return Number(group.count || 0);
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
        `${contact.first_name || ""} ${contact.last_name || ""} ${contact.contact_numbers?.[0]?.contact_number || ""}`
          .toLowerCase()
          .includes(term),
      );

      return groupMatches || contactMatches;
    });
  }, [groupContacts, groupOptions, searchTerm]);

  const totalGuestCount = useMemo(() => {
    return Object.values(selectedContactsByGroup).reduce((count, contacts) => count + contacts.length, 0);
  }, [selectedContactsByGroup]);

  const selectedGroupCount = useMemo(() => {
    return Object.values(selectedContactsByGroup).filter((contacts) => contacts.length > 0).length;
  }, [selectedContactsByGroup]);

  const quickSelectCards = useMemo(
    () => [
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
    ],
    [contactOption, groupOptions, loadedGroupCounts, selectedContactsByGroup],
  );

  useEffect(() => {
    if (isOpen && eventSelect) {
      fetchEventContacts();
      if (data === null) {
        setSendOption("sendNow");
      }
    }
  }, [eventSelect, isOpen]);

  useEffect(() => {
    if (data !== null && isOpen) {
      setSendOption("sendNow");
      setContactOption(data?.send_to?.length > 0 ? "selectedContacts" : "allContacts");

      const tempSelectedContactsByGroup = {};
      data?.send_to?.forEach((group) => {
        tempSelectedContactsByGroup[group.group_id] = group.user_ids;
      });

      setSelectedContactsByGroup(tempSelectedContactsByGroup);
      setExpandedGroups(data?.send_to?.map((group) => group.group_id) || []);

      data?.send_to?.forEach((group) => {
        if (!groupContacts[group.group_id]) {
          getGroupContact(group.group_id);
        }
      });
    }
  }, [data, isOpen]);

  useEffect(() => {
    Object.keys(groupContacts).forEach((groupId) => {
      const checkbox = document.getElementById(`arrival-group-${groupId}`);
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
              <Dialog.Panel className="relative w-full max-w-[960px] overflow-hidden rounded-[24px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] transition-all">
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-rose-50 via-white to-white" />

                <div className="relative p-5 lg:p-6">
                  <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700 shadow-inner">
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <Dialog.Title className="text-[20px] font-semibold tracking-tight text-slate-800">Schedule Card / Message</Dialog.Title>
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

                  <form onSubmit={handleSubmit} className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:h-9 [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:h-9 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:h-9 [&_.css-hlgwow]:min-h-[36px] [&_.css-hlgwow]:py-0 [&_.css-hlgwow]:px- [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-none [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-none [&_.css-1wy0on6]:h-9 [&_.css-19bb58m]:my-0">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
                      <div className="space-y-4">
                        <div className="inline-flex border-b-2 border-rose-700 pb-2 text-sm font-semibold text-rose-700">Select Guests</div>

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
                                className={`inline-flex min-w-[150px] flex-1 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
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
                            <button
                              type="button"
                              className="inline-flex min-h-[76px] w-[54px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              <ChevronDownIcon className="h-5 w-5 -rotate-90" />
                            </button>
                          </div>
                        </div>

                        <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm">
                          <div className="border-b border-slate-100 px-5 py-4">
                            <div className="text-sm font-semibold text-slate-700">Groups</div>
                            {contactOptionError && <div className="mt-1 text-xs text-rose-600">{contactOptionError}</div>}
                          </div>

                          <div className="max-h-[360px] overflow-y-auto px-4 py-3">
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
                                        id={`arrival-group-${group.value}`}
                                        type="checkbox"
                                        checked={groupCheckboxState.checked}
                                        onChange={() => handleGroupCheckboxChange(group.value)}
                                        className="h-5 w-5 rounded border-slate-300 text-rose-700 focus:ring-rose-200"
                                        style={{
                                          minHeight: "unset",
                                          height: "16px",
                                          width: "16px",
                                        }}
                                      />

                                      <button
                                        type="button"
                                        onClick={() => handleGroupClick(group.value)}
                                        className="flex flex-1 items-center justify-between gap-4 text-left"
                                      >
                                        <div className="text-sm font-semibold text-slate-800">
                                          {group.label} <span className="font-medium text-slate-500">({getResolvedGroupCount(group)} Guests)</span>
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
                                                    className="h-4 w-4 rounded border-gray-300 text-secondary-color focus:ring-secondary-color"
                                                    style={{
                                                      minHeight: "unset",
                                                      height: "16px",
                                                      width: "16px",
                                                    }}
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

                      <div className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div>
                          <div className="text-[14px] font-semibold text-rose-800">Selection Summary</div>

                          <div className="mt-5 space-y-4 text-slate-700">
                            <div>
                              <div className="text-sm text-slate-500">Groups Selected</div>
                              <div className="mt-2 text-[30px] font-semibold leading-none text-slate-900">
                                {contactOption === "allContacts" ? groupOptions.length : selectedGroupCount}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-slate-500">Individual Guests</div>
                              <div className="mt-2 text-[30px] font-semibold leading-none text-slate-900">{totalGuestCount}</div>
                            </div>
                          </div>

                          <div className="my-5 h-px bg-slate-200" />

                          <div>
                            <div className="text-sm text-slate-500">Total Guests</div>
                            <div className="mt-2 text-[42px] font-semibold leading-none tracking-tight text-rose-700">{totalGuestCount}</div>
                          </div>

                          <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-slate-600">
                            You can select entire groups or individual guests.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 lg:flex-row lg:items-end lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-700">Send Timing</div>
                        <div className="mt-4 max-w-[320px] rounded-2xl border border-rose-200 bg-rose-50/40 px-4 py-3">
                          <div className="flex items-start gap-3">
                            <input
                              id="sendNowFooter"
                              type="radio"
                              value="sendNow"
                              name="send-radio-footer"
                              checked={true}
                              readOnly
                              style={{
                                minHeight: "unset",
                                height: "16px",
                                width: "16px",
                              }}
                              className="mt-1 h-4 w-4 border-slate-300 text-rose-700 focus:ring-rose-200"
                            />
                            <div>
                              <div className="text-sm font-semibold text-slate-800">Send Now</div>
                              <div className="mt-1 text-sm text-slate-500">Send message immediately</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={btnLoading}
                          className="inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-700 to-rose-600 px-6 text-base font-medium text-white shadow-[0_16px_30px_rgba(190,24,93,0.16)] transition hover:shadow-[0_18px_34px_rgba(190,24,93,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <PaperAirplaneIcon className="h-4 w-4 shrink-0" />
                          <span className="text-center leading-4">{`Send to ${totalGuestCount} Guests`}</span>
                        </button>
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

export default MessageSchedule;
