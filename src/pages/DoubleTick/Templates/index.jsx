import React, { Fragment, useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  FunnelIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ApiServices from "../../../api/services";
import { DOUBLE_TICK } from "../../../routes/Names";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import ChooseFile from "../../../components/common/ChooseFile";
import { useThemeContext } from "../../../context/GlobalContext";

const Templates = () => {
  const navigate = useNavigate();
  const { withOutformattedContact, openSuccessModal, closeSuccessModel, getContacts, getGroupNames } = useThemeContext();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
  const [headerImage, setHeaderImage] = useState(null);
  const [sendTemplate, setSendTemplate] = useState(false);
  const [templatesListing, setTemplatesListing] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showHeaderImage, setShowHeaderImage] = useState(true);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [selectedContactsByGroup, setSelectedContactsByGroup] = useState({});
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactOption, setContactOption] = useState("");

  const checkboxClassName = "h-5 w-5 rounded border-slate-300 text-rose-700 focus:ring-rose-200";

  const bodyVariables = useMemo(
    () =>
      selectedTemplate?.components?.flatMap((component) =>
        component.type === "BODY" ? component.variables || [] : [],
      ) || [],
    [selectedTemplate],
  );

  const hasHeader = selectedTemplate?.components?.some((component) => component?.type === "HEADER");
  const hasMediaUrl = selectedTemplate?.components?.some((component) => component?.type === "HEADER" && component?.variables?.[0]?.mediaUrl);
  const shouldShowImageInput = hasHeader || hasMediaUrl;

  const groupedContacts = useMemo(() => {
    return (withOutformattedContact || []).reduce((accumulator, contact) => {
      const groupId = contact?.group?.id || contact?.group_id;
      const groupLabel = contact?.group?.name || "Ungrouped";

      if (!groupId) {
        return accumulator;
      }

      if (!accumulator[groupId]) {
        accumulator[groupId] = {
          value: groupId,
          label: groupLabel,
          contacts: [],
        };
      }

      accumulator[groupId].contacts.push(contact);
      return accumulator;
    }, {});
  }, [withOutformattedContact]);

  const groupOptions = useMemo(() => Object.values(groupedContacts), [groupedContacts]);

  const getSelectedContactIds = () =>
    Object.values(selectedContactsByGroup).flatMap((ids) => ids || []);

  const getSelectedContactsCount = () => getSelectedContactIds().length;

  const getSelectedGroupCount = () =>
    Object.values(selectedContactsByGroup).filter((ids) => (ids || []).length > 0).length;

  const getTotalGuestsCount = () => groupOptions.reduce((count, group) => count + group.contacts.length, 0);

  const getContactFullName = (contact) => {
    return [contact?.salutation, contact?.first_name, contact?.last_name].filter(Boolean).join(" ").trim();
  };

  const getContactPhone = (contact) => {
    const contactNumber = contact?.contact_numbers?.[0];
    if (!contactNumber) {
      return "-";
    }
    return `${contactNumber?.country_code || ""} ${contactNumber?.contact_number || ""}`.trim();
  };

  const resetTemplateState = () => {
    setErrors({});
    setInputValues({});
    setHeaderImage(null);
    setShowHeaderImage(true);
    setSelectedContactsByGroup({});
    setExpandedGroups([]);
    setSearchTerm("");
    setContactOption("");
    setOpenContactModal(false);
  };

  const formatTemplate = (template) => template?.replace(/\\n/g, "\n");

  const formatName = (name = "") =>
    name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setHeaderImage(file);
    }
  };

  const handleCrossClick = () => {
    setHeaderImage(null);
  };

  const getTemplatesList = async () => {
    try {
      setLoading(true);
      const res = await ApiServices.doubleTick.templateList({});
      const { data } = res;
      if (data.code === 200) {
        const filteredTemplates = data.data?.filter((template) => template?.name && template?.name?.includes("planned_forever"));
        setTemplatesListing(filteredTemplates);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDerivedFamilyName = () => {
    const selectedGroupIds = Object.entries(selectedContactsByGroup)
      .filter(([, ids]) => (ids || []).length > 0)
      .map(([groupId]) => groupId);

    if (selectedGroupIds.length === 1) {
      return groupedContacts[selectedGroupIds[0]]?.label || "";
    }

    return "";
  };

  const buildPlaceholders = () => {
    const derivedFamilyName = getDerivedFamilyName();

    return bodyVariables.reduce((accumulator, variable) => {
      const variableName = variable?.name;

      if (["guest_name", "name", "guest", "user"].includes(variableName)) {
        return accumulator;
      }

      if (variableName === "family_name") {
        accumulator.push(derivedFamilyName);
        return accumulator;
      }

      accumulator.push(inputValues[variableName] || "");
      return accumulator;
    }, []);
  };

  const handleSubmit = async () => {
    const selectedUserIds = getSelectedContactIds();

    if (selectedUserIds.length === 0) {
      setErrors((prev) => ({ ...prev, selectedContacts: "Please select at least one contact" }));
      return;
    }

    try {
      setBtnLoading(true);

      const placeholders = buildPlaceholders();

      let payload;
      if (headerImage) {
        payload = new FormData();
        payload.append("template_name", selectedTemplate.name);
        selectedUserIds.forEach((id) => payload.append("user_ids[]", id));
        placeholders.forEach((value) => payload.append("placeholders[]", value));
        payload.append("header_type", "image");
        payload.append("image", headerImage);
      } else {
        payload = {
          template_name: selectedTemplate.name,
          user_ids: selectedUserIds,
          placeholders,
        };
      }

      const res = await ApiServices.doubleTick.sendTemplate(payload, {
        headers: headerImage ? { "Content-Type": "multipart/form-data" } : {},
      });
      const { data } = res;

      if (data.code === 200) {
        openSuccessModal({
          title: "Success",
          message: "Template sent successfully",
          onClickDone: () => {
            closeSuccessModel();
            setSendTemplate(false);
            setSelectedTemplate(null);
            resetTemplateState();
            navigate(DOUBLE_TICK);
          },
        });
      }
    } catch (err) {
      console.error("Error sending template:", err);
    } finally {
      setBtnLoading(false);
    }
  };

  const toggleExpandedGroup = (groupId) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  const handleGroupClick = (groupId) => {
    toggleExpandedGroup(groupId);
  };

  const handleCheckboxChange = (groupId, contactId) => {
    setErrors((prev) => ({ ...prev, selectedContacts: "" }));
    setContactOption("selectedContacts");
    setSelectedContactsByGroup((prev) => {
      const currentIds = prev[groupId] || [];
      const updatedIds = currentIds.includes(contactId)
        ? currentIds.filter((id) => id !== contactId)
        : [...currentIds, contactId];

      if (updatedIds.length === 0) {
        const { [groupId]: removedGroup, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [groupId]: updatedIds,
      };
    });
  };

  const handleGroupCheckboxChange = (groupId) => {
    setErrors((prev) => ({ ...prev, selectedContacts: "" }));
    setContactOption("selectedContacts");
    const groupContacts = groupedContacts[groupId]?.contacts || [];
    const allIds = groupContacts.map((contact) => contact.uuid);
    const currentIds = selectedContactsByGroup[groupId] || [];
    const isAllSelected = allIds.length > 0 && allIds.every((id) => currentIds.includes(id));

    setSelectedContactsByGroup((prev) => {
      if (isAllSelected) {
        const { [groupId]: removedGroup, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [groupId]: allIds,
      };
    });
  };

  const handleAllGuestsSelect = () => {
    setErrors((prev) => ({ ...prev, selectedContacts: "" }));
    const totalGuests = getTotalGuestsCount();
    const selectedCount = getSelectedContactsCount();

    if (selectedCount === totalGuests) {
      setSelectedContactsByGroup({});
      setContactOption("");
      return;
    }

    const allSelected = groupOptions.reduce((accumulator, group) => {
      accumulator[group.value] = group.contacts.map((contact) => contact.uuid);
      return accumulator;
    }, {});

    setSelectedContactsByGroup(allSelected);
    setContactOption("allContacts");
  };

  const getGroupCheckboxState = (groupId) => {
    const groupContacts = groupedContacts[groupId]?.contacts || [];
    const currentSelectedContacts = selectedContactsByGroup[groupId] || [];
    const allContactIds = groupContacts.map((contact) => contact.uuid);

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
      const contactMatches = group.contacts.some((contact) =>
        `${getContactFullName(contact)} ${getContactPhone(contact)}`.toLowerCase().includes(term),
      );

      return groupMatches || contactMatches;
    });
  }, [groupOptions, searchTerm]);

  const quickSelectCards = useMemo(
    () => [
      {
        id: "allGuests",
        label: "All Guests",
        count: getTotalGuestsCount(),
        isSelected: contactOption === "allContacts",
        onClick: handleAllGuestsSelect,
      },
      ...groupOptions.slice(0, 4).map((group) => ({
        id: group.value,
        label: group.label,
        count: group.contacts.length,
        isSelected: (selectedContactsByGroup[group.value] || []).length > 0,
        onClick: () => handleGroupCheckboxChange(group.value),
      })),
    ],
    [contactOption, groupOptions, selectedContactsByGroup],
  );

  useEffect(() => {
    getTemplatesList();
    getContacts();
    getGroupNames();
  }, []);

  useEffect(() => {
    Object.keys(groupedContacts).forEach((groupId) => {
      const checkbox = document.getElementById(`template-group-${groupId}`);
      if (checkbox) {
        const { indeterminate } = getGroupCheckboxState(groupId);
        checkbox.indeterminate = indeterminate;
      }
    });
  }, [groupedContacts, selectedContactsByGroup]);

  return (
    <div className="card min-h-[82vh] space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Templates List</h2>
      </div>
      {!sendTemplate ? (
        <div className="grid grid-cols-3 gap-3">
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} count={1} className="!h-72 !w-full !rounded" />
              ))}
            </>
          ) : (
            templatesListing?.map((item, index) => (
              <div key={index} className="flex h-full flex-col justify-between space-y-6 rounded border px-5 pb-3 pt-5">
                <div className="space-y-5">
                  <h2 className="text-lg font-medium">{formatName(item?.name)}</h2>
                  {item?.components?.map((component, idx) =>
                    component.type === "BODY" ? (
                      <p key={idx} className="whitespace-pre-line text-sm text-gray-500">
                        {formatTemplate(component.text)}
                      </p>
                    ) : null,
                  )}
                </div>
                <div className="mt-auto flex items-center justify-end">
                  <Button
                    title="Send Template"
                    onClick={() => {
                      setSendTemplate(true);
                      setSelectedTemplate(item);
                      resetTemplateState();
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="grid min-h-[75vh] grid-cols-2 gap-5 divide-x">
            <div className="-mr-4 max-h-[70vh] space-y-5 overflow-auto pr-4">
              <h2 className="text-lg font-medium">{formatName(selectedTemplate?.name)}</h2>

              {selectedTemplate?.components?.map((component, index) =>
                component.type === "HEADER" && component.variables?.[0]?.mediaUrl && showHeaderImage ? (
                  <div key={index} className="h-96 w-full rounded-md">
                    <img
                      src={component.variables[0].mediaUrl}
                      alt="Template Header"
                      className="h-full w-full rounded-md object-contain"
                      onError={() => setShowHeaderImage(false)}
                    />
                  </div>
                ) : null,
              )}

              {selectedTemplate?.components?.map((component, index) =>
                component.type === "BODY" ? (
                  <p key={index} className="whitespace-pre-line text-sm text-gray-500">
                    {formatTemplate(component.text)}
                  </p>
                ) : null,
              )}
            </div>

            <div className="pl-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base">Add Variables</h2>
                <button
                  type="button"
                  onClick={() => {
                    setSendTemplate(false);
                    setSelectedTemplate(null);
                    resetTemplateState();
                  }}
                  className="text-sm font-medium text-primary-color-200 transition hover:text-primary-color-100"
                >
                  Back to templates
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {bodyVariables.map((variable) => {
                  const variableName = variable?.name;

                  if (["guest_name", "name", "guest", "user", "family_name"].includes(variableName)) {
                    return null;
                  }

                  return (
                    <Input
                      isRequired
                      key={variableName}
                      label={formatName(variableName)}
                      placeholder={formatName(variableName)}
                      value={inputValues[variableName] || ""}
                      error={errors[variableName]}
                      onChange={(e) => {
                        setInputValues((prev) => ({
                          ...prev,
                          [variableName]: e.target.value,
                        }));
                      }}
                    />
                  );
                })}

                {shouldShowImageInput && (
                  <div>
                    <h2 className="label">
                      Document
                      <span className="text-base text-red-500">* {errors.headerImage}</span>
                    </h2>
                    <ChooseFile
                      placeholder="Choose Image"
                      onChange={handleImageChange}
                      selectedFile={headerImage}
                      onClickCross={handleCrossClick}
                      error={errors.headerImage}
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
  
                {/* Left Section */}
                <div>
                  <p className="text-sm font-medium text-secondary-color">
                    Selected Contacts
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {getSelectedContactsCount() > 0
                      ? `${getSelectedContactsCount()} contact${
                          getSelectedContactsCount() > 1 ? "s" : ""
                        } selected`
                      : "No contacts selected yet"}
                  </p>

                  {errors.selectedContacts ? (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.selectedContacts}
                    </p>
                  ) : null}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                  
                  <Button
                    title="Cancel"
                    type="button"
                    buttonColor="bg-red-500"
                    onClick={() => {
                      setSendTemplate(false);
                      setErrors({});
                      setGuestNames([]);
                      setHeaderImage(null);
                      setInputValues([]);
                      setSelectedGroup(null);
                      setShowHeaderImage(true);
                    }}
                  />

                  <Button
                    title="Select Contact"
                    onClick={() => setOpenContactModal(true)}
                  />

                </div>
              </div>
            </div>
          </div>

          <Transition appear show={openContactModal} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setOpenContactModal(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/30" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="relative w-full max-w-[960px] overflow-hidden rounded-[24px] bg-white text-left align-middle shadow-[0_24px_70px_rgba(15,23,42,0.16)] transition-all">
                      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-rose-50 via-white to-white" />

                      <div className="relative p-5 lg:p-6">
                        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700 shadow-inner">
                              <PaperAirplaneIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <Dialog.Title className="text-[20px] font-semibold tracking-tight text-slate-800">
                                Select Contact
                              </Dialog.Title>
                              <p className="mt-1 text-sm text-slate-500">Choose your guests and send your message</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setOpenContactModal(false)}
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
                          <div className="space-y-4">
                            <div className="inline-flex border-b-2 border-rose-700 pb-2 text-sm font-semibold text-rose-700">
                              Select Guests
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
                                  <div
                                    key={card.id}
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
                                    <input
                                      type="checkbox"
                                      checked={card.isSelected}
                                      onChange={card.onClick}
                                      className={checkboxClassName}
                                    />
                                  </div>
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
                                {errors.selectedContacts ? <div className="mt-1 text-xs text-rose-600">{errors.selectedContacts}</div> : null}
                              </div>

                              <div className="max-h-[360px] overflow-y-auto px-4 py-3">
                                <div className="space-y-3">
                                  {filteredGroups.map((group) => {
                                    const isExpanded = expandedGroups.includes(group.value);
                                    const visibleContacts = group.contacts.filter((contact) =>
                                      `${getContactFullName(contact)} ${getContactPhone(contact)}`
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
                                            id={`template-group-${group.value}`}
                                            type="checkbox"
                                            checked={groupCheckboxState.checked}
                                            onChange={() => handleGroupCheckboxChange(group.value)}
                                            className={checkboxClassName}
                                          />

                                          <button
                                            type="button"
                                            onClick={() => handleGroupClick(group.value)}
                                            className="flex flex-1 items-center justify-between gap-4 text-left"
                                          >
                                            <div className="text-sm font-semibold text-slate-800">
                                              {group.label} <span className="font-medium text-slate-500">({group.contacts.length} Guests)</span>
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
                                                        className={checkboxClassName}
                                                      />
                                                      <span className="text-sm font-medium text-slate-700">
                                                        {getContactFullName(contact) || "-"}
                                                      </span>
                                                    </div>
                                                    <span className="text-sm text-slate-500">{getContactPhone(contact)}</span>
                                                  </label>
                                                ))}

                                                {!hasSearch && visibleContacts.length > shownContacts.length && (
                                                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                                                    <span className="text-rose-700">
                                                      + {visibleContacts.length - shownContacts.length} more guests
                                                    </span>
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
                                              <div className="px-4 py-5 text-sm text-slate-500">No guests found for this search.</div>
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
                                    {contactOption === "allContacts" ? groupOptions.length : getSelectedGroupCount()}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-sm text-slate-500">Individual Guests</div>
                                  <div className="mt-2 text-[30px] font-semibold leading-none text-slate-900">{getSelectedContactsCount()}</div>
                                </div>
                              </div>

                              <div className="my-5 h-px bg-slate-200" />

                              <div>
                                <div className="text-sm text-slate-500">Total Guests</div>
                                <div className="mt-2 text-[42px] font-semibold leading-none tracking-tight text-rose-700">
                                  {getSelectedContactsCount()}
                                </div>
                              </div>

                              <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-slate-600">
                                You can select entire groups or individual guests.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
                          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                            <button
                              type="button"
                              onClick={() => setOpenContactModal(false)}
                              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={handleSubmit}
                              disabled={btnLoading}
                              className="inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-700 to-rose-600 px-6 text-base font-medium text-white shadow-[0_16px_30px_rgba(190,24,93,0.16)] transition hover:shadow-[0_18px_34px_rgba(190,24,93,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <PaperAirplaneIcon className="h-4 w-4 shrink-0" />
                              <span className="text-center leading-4">
                                {`Send to ${getSelectedContactsCount()} Guests`}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </div>
  );
};

export default Templates;
