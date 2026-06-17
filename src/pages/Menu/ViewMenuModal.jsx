import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import moment from "moment";
import Input from "../../components/common/Input";
import { mediaUrl } from "../../utilities/config";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useTranslation } from "react-i18next";

const gridCols = "grid grid-cols-[1.2fr_1fr_0.8fr_1.4fr_0.8fr] gap-3 items-start";

const ViewMenuModal = ({ isOpen, setIsOpen, data }) => {
  const { t } = useTranslation("common");

  const closeModal = () => setIsOpen(false);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
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
              <Dialog.Panel className="w-full overflow-hidden rounded-xxl bg-white p-8 shadow-xl transition-all md:max-w-4xl xl:max-w-12xl">
                <div className="mb-5 flex items-center justify-between">
                  <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                    {t("headings.viewDetails")}
                  </Dialog.Title>
                  <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                </div>

                <div className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_textarea]:text-sm [&_textarea]:leading-5 [&_textarea]:resize-none [&_textarea]:overflow-hidden">
                  <div className="h-[750px] overflow-y-auto p-2 md:h-[550px] lg:h-[550px] xl:h-[650px] 2xl:h-[750px]">
                    {/* <div className="mb-5 ltr:text-left rtl:text-right">
                      <div className="label mb-2 text-secondary">{t("headings.basicInfo")}</div>
                    </div> */}

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        isRequired
                        type="date"
                        label={t("menu.date")}
                        value={data?.date ? moment.unix(data.date).format("YYYY-MM-DD") : ""}
                        disabled
                      />

                      <Input isRequired label={t("menu.session_name")} value={data?.session || ""} disabled />

                      <Input isRequired type="time" label={t("menu.start_time")} value={data?.start_time || ""} disabled />

                      <Input isRequired type="time" label={t("menu.end_time")} value={data?.end_time || ""} disabled />
                    </div>

                    {/* <div className="my-5 ltr:text-left rtl:text-right">
                      <div className="label mb-2">{t("menu.menuItemsFile")}</div>
                      <div className="mt-2">
                        {Array.isArray(data?.images) && data.images.length > 0 ? (
                          <div className="grid w-full grid-cols-3 gap-2">
                            {data.images.map((image, index) => (
                              <img key={`${image}-${index}`} src={mediaUrl + image} alt="menu" className="h-full w-full rounded-10 object-cover" />
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-24 items-center justify-center rounded-10 border border-dashed border-primary-light-color text-sm text-info-color">
                            {t("message.noDataFound")}
                          </div>
                        )}
                      </div>
                    </div> */}

                    <div className="mt-10 ltr:text-left rtl:text-right">
                      <div className="label">{t("menu.menuItems")}</div>

                      <div>
                        <div className={`${gridCols} mb-2 mt-3 text-sm font-semibold text-gray-700`}>
                          <div>
                            {t("menu.menu_item")}<span className="text-red-500">*</span>
                          </div>
                          <div>{t("menu.itemType")}</div>
                          <div>
                            {t("menu.quantity")}<span className="text-red-500">*</span>
                          </div>
                          <div>{t("menu.description")}</div>
                          <div>{t("menu.image")}</div>
                        </div>

                        {(data?.menu_items || []).map((item, index) => (
                          <div key={item?.menu_item_id || item?.id || index} className={`${gridCols} mb-2`}>
                            <Input labelOnTop value={item?.name || ""} disabled />
                            <Input labelOnTop value={item?.type || ""} disabled />
                            <Input labelOnTop value={item?.qty || ""} disabled />
                            <Input labelOnTop value={item?.notes || ""} disabled />

                            <div>
                              <div className="mb-2 label opacity-0">{t("menu.image")}</div>
                              <PhotoProvider>
                                <PhotoView src={item?.image ? mediaUrl + item.image : undefined}>
                                  {item?.image ? (
                                    <img
                                      src={mediaUrl + item.image}
                                      alt="item"
                                      className="h-15 w-15 cursor-pointer rounded-10 object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-9 items-center justify-center rounded-10 border border-dashed border-primary-light-color px-3 text-xs text-info-color">
                                      -
                                    </div>
                                  )}
                                </PhotoView>
                              </PhotoProvider>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 ltr:text-left rtl:text-right">
                      <div className="label mb-2 text-secondary">{t("headings.otherInfo")}</div>
                    </div>

                    <div className="mt-5">
                      <Input label={t("headings.notes")} textarea value={data?.notes || ""} disabled />
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

export default ViewMenuModal;
