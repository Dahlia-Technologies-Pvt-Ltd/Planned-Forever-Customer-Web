import ApiServices from "../../api/services";
import { Images } from "../../assets/Assets";
import Skeleton from "react-loading-skeleton";
import Input from "../../components/common/Input";
import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { MinusIcon, PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

function LiveEvent() {
  const { t } = useTranslation("common");

  // Global States
  const {
    eventSelect,
    getCeremonies,
    allCeremonies,
    btnLoading,
    setBtnLoading,
    loading,
    setLoading,
    allEvents,
    openSuccessModal,
    closeSuccessModel,
    onSuccess,
    getEventList,
  } = useThemeContext();

  // Use states
  const [message, setMessage] = useState("");
  const [eventError, setEventError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAllContacts, setSelectAllContacts] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [withOutformattedContact, setWithOutformattedContact] = useState([]);
  const [allContact, setAllContact] = useState([]);
  // Add Live Event API with selected contacts
  const validateInputs = () => {
    let isValidData = true;

    if (!selectedItem || !selectedItem.value) {
      setEventError(" Required");
      isValidData = false;
    }

    if (url === "") {
      setUrlError(" Required");
      isValidData = false;
    }

    // Validate that selected contacts still exist in the current contact list
    if (selectedContacts.length > 0) {
      const validContactUuids = allContact.map((contact) => contact.value);
      const invalidContacts = selectedContacts.filter((uuid) => !validContactUuids.includes(uuid));

      if (invalidContacts.length > 0) {
        // Remove invalid contacts and update the selection
        setSelectedContacts((prev) => prev.filter((uuid) => validContactUuids.includes(uuid)));
        setMessage("Some selected contacts are no longer available and have been removed from selection");
        return false;
      }
    }

    return isValidData;
  };

  const handleAddBudgetTrue = () => {
    if (validateInputs()) {
      setBtnLoading(true);
      setMessage(""); // Clear any previous error messages

      let payload = {
        event_id: eventSelect,
        ceremony_id: selectedItem?.value,
        url: url,
        broadcast_all: true,
      };

      ApiServices.Nearby_Attraction.addLiveEvent(payload)
        .then((res) => {
          const { data, message } = res;

          if (data.code === 200) {
            setBtnLoading(false);
            setSelectedItem(null);
            setUrl("");

            openSuccessModal({
              title: "Success!",
              message: "Broadcast has been sent to all contacts!",
              onClickDone: (close) => {
                closeSuccessModel();
                onSuccess();
              },
            });
          } else {
            setBtnLoading(false);
            setMessage(data?.message || "An error occurred while sending the broadcast");
          }
        })
        .catch((err) => {
          setBtnLoading(false);
          setMessage(err?.response?.data?.message || "An error occurred while sending the broadcast");
        });
    }
  };

  const handleAddBudget = () => {
    if (validateInputs()) {
      if (selectedContacts.length === 0) {
        setMessage("Please select at least one contact");
        return;
      }

      setLoading(true);
      setMessage(""); // Clear any previous error messages

      let payload = {
        event_id: eventSelect,
        ceremony_id: selectedItem?.value,
        url: url,
        broadcast_all: false,
        contact_ids: selectedContacts,
      };

      ApiServices.Nearby_Attraction.addLiveEvent(payload)
        .then((res) => {
          const { data, message } = res;

          if (data.code === 200) {
            setLoading(false);
            setSelectedItem(null);
            setUrl("");
            setSelectedContacts([]);
            setSelectAllContacts(false);

            openSuccessModal({
              title: "Success!",
              message: "Broadcast has been sent!",
              onClickDone: (close) => {
                closeSuccessModel();
                onSuccess();
              },
            });
          } else {
            setLoading(false);
            setMessage(data?.message || "An error occurred while sending the broadcast");
          }
        })
        .catch((err) => {
          setLoading(false);
          setMessage(err?.response?.data?.message || "An error occurred while sending the broadcast");
        });
    }
  };

  const getContacts = () => {
    let payload = {
      event_id: eventSelect,
    };
    ApiServices.contact
      .GetAllContact(payload)
      .then((res) => {
        const { data, message } = res;
        console.log("data", data);
        if (data?.code === 200) {
          const formattedContacts = data?.data?.map((contact) => ({
            value: contact?.uuid,
            label: contact?.first_name + " " + contact?.last_name,
          }));

          setAllContact(formattedContacts);
          setWithOutformattedContact(data?.data);
        }
      })
      .catch((err) => {});
  };

  // Handle select all contacts
  const handleSelectAll = (checked) => {
    if (!Array.isArray(allContact) || allContact.length === 0) return;

    setSelectAllContacts(checked);
    if (checked) {
      const allContactUuids = allContact.filter((contact) => contact && contact.value).map((contact) => contact.value);
      setSelectedContacts(allContactUuids);
    } else {
      setSelectedContacts([]);
    }
  };

  // Handle select filtered contacts
  const handleSelectFiltered = () => {
    if (!Array.isArray(filteredContacts) || filteredContacts.length === 0) return;

    const filteredUuids = filteredContacts.filter((contact) => contact && contact.value).map((contact) => contact.value);
    const newSelectedContacts = [...new Set([...selectedContacts, ...filteredUuids])];
    setSelectedContacts(newSelectedContacts);
  };

  // Handle individual contact selection
  const handleContactSelection = (contactUuid, checked) => {
    if (!contactUuid) return;

    if (checked) {
      setSelectedContacts((prev) => [...prev, contactUuid]);
    } else {
      setSelectedContacts((prev) => prev.filter((uuid) => uuid !== contactUuid));
    }
  };

  // Clear search query when component unmounts or when needed
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Update select all state when individual selections change
  useEffect(() => {
    if (selectedContacts.length === allContact.length && allContact.length > 0) {
      setSelectAllContacts(true);
    } else {
      setSelectAllContacts(false);
    }
  }, [selectedContacts, allContact]);

  // Filter contacts based on search query
  const filteredContacts = allContact.filter(
    (contact) => contact && contact.label && contact.value && contact.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Fetch contacts with loading state
  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      await getContacts();
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    getCeremonies();
    fetchContacts();
  }, []);

  // Cleanup effect when event changes
  useEffect(() => {
    if (eventSelect) {
      clearSearch();
      setSelectedContacts([]);
      setSelectAllContacts(false);
    }
  }, [eventSelect]);

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Main card with input fields and contact selection */}
      <div className="col-span-11">
        <div className="card min-h-[82vh]">
          <div className="grid h-full grid-cols-12 gap-8">
            {/* Left side - Input fields */}
            <div className="col-span-6 space-y-8">
              <div className="space-y-8">
                <h3 className="heading">Live Event</h3>
                <div className="space-y-5">
                  <Input
                    isRequired
                    type="url"
                    error={urlError}
                    label={t("liveEvent.addLiveEventUrl")}
                    placeholder={t("liveEvent.addLiveEventUrl")}
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setUrlError("");
                    }}
                  />

                  <Dropdown
                    isRequired
                    options={allCeremonies}
                    placeholder={t("liveEvent.ceremony")}
                    value={selectedItem}
                    onChange={(e) => {
                      setSelectedItem(e);
                      setEventError(false);
                    }}
                    withError={eventError}
                    title={t("liveEvent.ceremony")}
                  />
                </div>
              </div>

              {message && <p className="mt-2 text-red-500">{message}</p>}

              <div className="flex gap-x-5 pt-8">
                <Button title={btnLoading ? <Spinner /> : t("liveEvent.sendBroadCastMessageToAllContacts")} onClick={handleAddBudgetTrue} />
                {/* <Button buttonColor="bg-primary" title={loading ? <Spinner /> : t("liveEvent.selectContactsForBroadcast")} onClick={handleAddBudget} /> */}
              </div>
            </div>

            {/* Right side - Contact selection */}
            <div className="col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-lg font-semibold text-gray-800">{t("liveEvent.contacts")}</h4>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchContacts}
                    disabled={contactsLoading}
                    className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary"
                    title="Refresh contacts"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={selectAllContacts}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary  focus:ring-2"
                    />
                    <label htmlFor="selectAll" className="cursor-pointer text-sm font-medium text-gray-700">
                      {t("liveEvent.selectAll")}
                    </label>
                    {searchQuery && filteredContacts.length > 0 && (
                      <button onClick={handleSelectFiltered} className="hover:text-primary-dark ml-2 text-xs text-primary underline">
                        {t("liveEvent.selectFiltered")}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-[60vh] space-y-2 overflow-y-auto">
                {contactsLoading ? (
                  <div className="py-8 text-center text-gray-500">
                    <Spinner />
                    <p className="mt-2">{t("liveEvent.loadingContacts")}</p>
                  </div>
                ) : allContact.length > 0 ? (
                  <>
                    <div className="sticky top-0 bg-white pb-2">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder={t("liveEvent.searchContacts")}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-8 text-sm focus:border-transparent focus:outline-none focus:ring-gray-300"
                        />
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                            title={t("liveEvent.clearSearch")}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => (
                        <div
                          key={contact.value}
                          className={`flex cursor-pointer items-center space-x-3 rounded p-2 transition-all duration-200 ${
                            selectedContacts.includes(contact.value)
                              ? "border border-primary/20 bg-primary/10 shadow-sm"
                              : "hover:bg-gray-50 hover:shadow-sm"
                          }`}
                          onClick={() => handleContactSelection(contact.value, !selectedContacts.includes(contact.value))}
                        >
                          <input
                            type="checkbox"
                            id={`contact-${contact.value}`}
                            checked={selectedContacts.includes(contact.value)}
                            onChange={(e) => handleContactSelection(contact.value, e.target.checked)}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-primary focus:ring-2 focus:ring-primary"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label htmlFor={`contact-${contact.value}`} className="flex-1 cursor-pointer select-none text-sm text-gray-700">
                            {contact.label}
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        <p>
                          {t("liveEvent.noContactsFound")} "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <p>{t("liveEvent.noContactsAvailable")}</p>
                    <button onClick={fetchContacts} className="hover:text-primary-dark mt-2 text-sm text-primary underline">
                      {t("liveEvent.refreshContacts")}
                    </button>
                  </div>
                )}
              </div>

              {selectedContacts.length > 0 && (
                <div className="mt-auto rounded-lg border-t bg-gray-50 p-3 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">
                      {selectedContacts.length} {t("liveEvent.contactsSelected")}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedContacts([]);
                        setSelectAllContacts(false);
                      }}
                      className="text-sm text-red-500 underline transition-all hover:text-red-700 hover:no-underline"
                    >
                      {t("liveEvent.clearAll")}
                    </button>
                  </div>
                </div>
              )}
              <Button title={t("liveEvent.selectContactsForBroadcast")} onClick={handleAddBudget} buttonColor="bg-primary" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveEvent;
