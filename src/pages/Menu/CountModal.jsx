import Button from "../../components/common/Button";

import { Fragment } from "react";

import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";

export default function ConfirmationModal({ data, isOpen, setIsOpen }) {
  // Context
  const { t } = useTranslation("common");

  // Close Modal
  function closeModal() {
    setIsOpen(false);
  }

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

          <div className="overflow-y-auto fixed inset-0">
            <div className="flex justify-center items-center p-4 min-h-full text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="overflow-hidden p-8 w-full max-w-3xl text-center align-middle bg-white rounded-2xl shadow-xl transition-all 3xl:max-w-md">
                  <Dialog.Title as="h3" className="mx-auto mt-8 max-w-xs font-semibold leading-7 font-poppins text-20 text-secondary-color">
                    {t("menu.guestMealPreference")}
                  </Dialog.Title>

                  <div className="mt-5 flex max-h-[400px] flex-wrap justify-center overflow-auto">
                    {data?.length > 0 ? (
                      data.map((item, index) => (
                          <div key={item?.id || item?.name || index} className="m-3 flex gap-5 rounded-lg border border-gray-200 bg-gray-50 p-5">
                            <p className="font-bold">{item?.name}:</p>
                            <p className="font-bold text-secondary">{item?.count}</p>
                          </div>
                      ))
                    ) : (
                      <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                        <p className="text-base font-semibold text-black">{t("menu.noCountsAvailable")}</p>
                        <p className="mt-2 text-sm text-gray-500">{t("menu.noGuestCountsDescription")}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-x-6 justify-center px-8 mt-12">
                    <Button
                      // className="w-full"
                      title={t("buttons.okay")}
                      onClick={closeModal}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
