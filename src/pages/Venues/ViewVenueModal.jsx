import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Input from "../../components/common/Input";

const ViewVenueModal = ({ isOpen, setIsOpen, detail }) => {
  const { t } = useTranslation("common");

  const closeModal = () => {
    setIsOpen(false);
  };

  const venueDetails =
    Array.isArray(detail?.venue_details) && detail.venue_details.length
      ? detail.venue_details
      : [{ name: "", location: "" }];

  const contactNumbers = Array.isArray(detail?.contact_numbers)
    ? detail.contact_numbers
    : [];
  const emails = Array.isArray(detail?.emails) ? detail.emails : [];
  const contactRowCount = Math.max(contactNumbers.length, emails.length, 1);
  const contacts = Array.from({ length: contactRowCount }, (_, index) => {
    const contact = contactNumbers[index] || {};
    const email = emails[index] || {};

    return {
      contactPerson:
        contact.contact_person_name ||
        email.contact_person_name ||
        (index === 0 ? detail?.contact_person_name : "") ||
        "",
      countryCode: contact.country_code || "",
      phone: contact.mobile || contact.land_line_number || "",
      email: email.personal || email.work || "",
    };
  });

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
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="venue-modal w-full max-w-4xl rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="mb-2 flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="ml-1 font-poppins text-lg font-semibold leading-7 text-secondary-color"
                  >
                    {t("venues.viewVenue")}
                  </Dialog.Title>
                  <XMarkIcon
                    onClick={closeModal}
                    className="h-8 w-8 cursor-pointer text-info-color"
                  />
                </div>

                <div className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:py-1 [&_input]:text-sm [&_textarea]:text-sm">
                  <div className="h-[600px] overflow-y-auto p-1 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                    <div className="mb-5 ltr:text-left rtl:text-right">
                      <div className="mb-2 label text-secondary">
                        {t("headings.basicInfo")}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label={t("venues.venueName")}
                        labelOnTop
                        value={detail?.name || ""}
                        readOnly
                      />
                      <Input
                        label={t("venues.venueAddress1")}
                        labelOnTop
                        value={detail?.address || ""}
                        readOnly
                      />
                      <Input
                        label={t("venues.venueAddress2")}
                        labelOnTop
                        value={detail?.address_2 || detail?.address2 || ""}
                        readOnly
                      />
                      <Input
                        label={t("venues.country")}
                        labelOnTop
                        value={detail?.country || ""}
                        readOnly
                      />
                      <Input
                        label={t("venues.state")}
                        labelOnTop
                        value={detail?.state || ""}
                        readOnly
                      />
                      <Input
                        label={t("venues.city")}
                        labelOnTop
                        value={detail?.city || ""}
                        readOnly
                      />
                      <Input
                        label={t("venues.pin")}
                        labelOnTop
                        value={detail?.pin || ""}
                        readOnly
                      />
                      <Input
                        label={t("venues.timeZone")}
                        labelOnTop
                        value={detail?.time_zone || ""}
                        readOnly
                      />
                    </div>

                    <div className="relative mt-12 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                      <div className="mb-5 flex items-center gap-1.5 label text-secondary">
                        <span>{t("venues.venueDetail")}</span>
                        <span className="group relative inline-flex">
                          <button
                            type="button"
                        aria-label={t("venues.hallInfo")}
                            className="inline-flex text-secondary"
                          >
                            <InformationCircleIcon className="h-5 w-5" />
                          </button>
                          <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-80 rounded-md bg-secondary px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-within:block">
                            Enter the halls, banquet rooms, lawns, or other event
                            spaces inside this venue where wedding functions will
                            be conducted.
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {venueDetails.map((venue, index) => (
                        <div
                          key={`venue-detail-${index}`}
                          className="grid grid-cols-12 items-end gap-3"
                        >
                          <div className="col-span-5">
                            <Input
                              label={index === 0 ? t("venues.hallName") : ""}
                              labelOnTop={index === 0}
                              value={venue?.name || ""}
                              readOnly
                            />
                          </div>
                          <div className="col-span-5">
                            <Input
                              label={
                                index === 0 ? t("venues.hallAddress") : ""
                              }
                              labelOnTop={index === 0}
                              value={venue?.location || ""}
                              readOnly
                            />
                          </div>
                          <div className="col-span-2" />
                        </div>
                      ))}
                    </div>

                    <div className="relative mb-5 mt-14 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                      <div className="mb-5 label text-secondary">
                        {t("venues.venuePrimaryContact")}
                      </div>
                    </div>

                    <div className="mt-5">
                      {contacts.map((contact, index) => (
                        <div
                          key={`contact-${index}`}
                          className="mb-4 grid grid-cols-12 items-end gap-4"
                        >
                          <div className="col-span-3">
                            <Input
                              label={t("venues.contactPerson")}
                              labelOnTop
                              value={contact.contactPerson}
                              readOnly
                            />
                          </div>

                          <div className="col-span-4">
                            <div className="label ltr:text-left rtl:text-right">
                              <p>{t("venues.contactNumber")}</p>
                            </div>
                            <div className="flex gap-2">
                              <div className="w-24">
                                <Input
                                  value={contact.countryCode}
                                  readOnly
                                  invisible
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={contact.phone}
                                  readOnly
                                  invisible
                                />
                              </div>
                            </div>
                          </div>

                          <div className="col-span-3">
                            <Input
                              label={t("venues.emailAddress")}
                              labelOnTop
                              value={contact.email}
                              readOnly
                            />
                          </div>

                          <div className="col-span-2" />
                        </div>
                      ))}
                    </div>

                    <div className="relative mt-14 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                      <div className="mb-2 label text-secondary">
                        {t("headings.otherInfo")}
                      </div>
                    </div>

                    <div className="mb-2 mt-5">
                      <Input
                        label={t("headings.notes")}
                        labelOnTop
                        textarea
                        value={detail?.description || ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ViewVenueModal;
