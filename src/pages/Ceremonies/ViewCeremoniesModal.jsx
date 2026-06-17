import React from "react";
import moment from "moment";
import Input from "../../components/common/Input";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const ViewCeremoniesModal = ({ isOpen, setIsOpen, data }) => {
  const { t } = useTranslation("common");

  const closeModal = () => {
    setIsOpen(false);
  };

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
              <Dialog.Panel className="w-full max-w-4xl overflow-hidden rounded-xl bg-white p-5 shadow-xl transition-all">
                <div className="mb-5 flex items-center justify-between">
                  <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                    {t("ceremonies.updateCeremony")}
                  </Dialog.Title>
                  <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                </div>

                <div className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm">
                  <div className="h-[520px] overflow-y-scroll p-1 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                    <div className="mb-5 ltr:text-left rtl:text-right">
                      <div className="mb-2 label text-secondary">{t("headings.basicInfo")}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <Input label={t("ceremonies.ceremonyName")} value={data?.name || "-"} readOnly />
                      <Input label={t("ceremonies.venue")} value={data?.venue?.name || "-"} readOnly />
                      <Input label={t("ceremonies.heldAt")} value={data?.held_at?.name || "-"} readOnly />
                      <Input label={t("ceremonies.dressCode")} value={data?.dress_code || "-"} readOnly />
                      <Input
                        type="datetime-local"
                        label={t("ceremonies.startDateAndTime")}
                        value={data?.start_date ? moment.unix(data?.start_date).format("YYYY-MM-DDTHH:mm") : ""}
                        readOnly
                      />
                      <Input
                        type="datetime-local"
                        label={t("ceremonies.endDateAndTime")}
                        value={data?.end_date ? moment.unix(data?.end_date).format("YYYY-MM-DDTHH:mm") : ""}
                        readOnly
                      />
                    </div>

                    <div className="my-4 ltr:text-left rtl:text-right">
                      <h2 className="label text-secondary">{t("headings.otherInfo")}</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                      <Input label={t("ceremonies.personIncharge")} value={data?.incharge_name || "-"} readOnly />
                      <Input label={t("ceremonies.countryCode")} value={data?.incharge_contact_number?.code || "-"} readOnly />
                      <Input label={t("ceremonies.contactNumber")} value={data?.incharge_contact_number?.phone_number || "-"} readOnly />
                      <Input label={t("ceremonies.asstPersonIncharge")} value={data?.asst_incharge_name || "-"} readOnly />
                      <Input label={t("ceremonies.countryCode")} value={data?.asst_incharge_contact_number?.code || "-"} readOnly />
                      <Input label={t("ceremonies.contactNumber")} value={data?.asst_incharge_contact_number?.phone_number || "-"} readOnly />
                    </div>

                    <div className="mt-5">
                      <Input label={t("headings.notes")} value={data?.description || "-"} textarea readOnly />
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

export default ViewCeremoniesModal;
