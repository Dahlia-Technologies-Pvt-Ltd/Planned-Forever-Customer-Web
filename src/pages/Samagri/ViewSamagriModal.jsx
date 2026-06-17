import React, { Fragment } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Input from "../../components/common/Input";
import { mediaUrl } from "../../utilities/config";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import moment from "moment";

const ViewSamagriModal = ({ isOpen, setIsOpen, data }) => {
  const closeModal = () => setIsOpen(false);

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
              <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-3 shadow-xl transition-all xl:max-w-4xl xl:p-4">
                <div className="mb-5 flex items-center justify-between">
                  <Dialog.Title as="h3" className="font-poppins text-sm font-semibold leading-6 text-secondary-color xl:text-[15px]">
                    View Samagri
                  </Dialog.Title>
                  <XMarkIcon onClick={closeModal} className="h-5 w-5 cursor-pointer text-info-color" />
                </div>

                <div className="h-[360px] overflow-y-auto p-1 md:h-[350px] lg:h-[370px] xl:h-[400px] 2xl:h-[460px]">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="[&_input]:h-10 [&_input]:text-sm [&_input]:leading-5 [&_textarea]:text-sm [&_textarea]:leading-5 [&_label]:text-sm">
                      <Input label="Samagri For" value={data?.title || ""} readOnly />

                      <div className="[&_label]:text-sm">
                        <Input label="Ceremony Name" value={data?.ceremony?.name || ""} readOnly />
                      </div>

                      <div className="[&_label]:text-sm">
                        <Input
                          label="Handover Name"
                          value={
                            data?.contact?.first_name
                              ? `${data?.contact?.first_name || ""} ${data?.contact?.last_name || ""}`.trim()
                              : ""
                          }
                          readOnly
                        />
                      </div>

                      <Input
                        label="Handover Date and Time"
                        value={data?.hand_over_date ? moment.unix(data?.hand_over_date).format("YYYY-MM-DD HH:mm") : ""}
                        readOnly
                      />
                    </div>

                    <div className="ltr:text-left rtl:text-right">
                      <div className="label text-xs xl:text-sm">Samagri Items</div>
                      <div>
                        {(data?.items || []).map((item, index) => (
                          <div key={index} className="mb-2  flex w-full flex-wrap items-start gap-y-2 space-x-2 [&_.label]:text-sm [&_input]:h-10 [&_input]:text-sm">
                            <Input label={`${index === 0 ? "Item" : ""}`} value={item?.name || ""} readOnly />
                            <Input label={`${index === 0 ? "Quantity" : ""}`} value={item?.qty || ""} readOnly />
                            <Input label={`${index === 0 ? "Units" : ""}`} value={item?.unit || ""} readOnly />

                            <div className="relative w-[96px] text-left lg:w-[110px]">
                              {index === 0 && (
                                <div className="">
                                  <label className="label">Image</label>
                                </div>
                              )}
                              {/* {index !== 0 && (
                                <div className="mb-2">
                                  <label className="label invisible">Image</label>
                                </div>
                              )} */}
                              {item?.image ? (
                                <PhotoProvider>
                                  <PhotoView src={mediaUrl + item?.image}>
                                    <img src={mediaUrl + item?.image} alt="Preview" className="h-10 w-full cursor-pointer rounded-10 object-cover" />
                                  </PhotoView>
                                </PhotoProvider>
                              ) : (
                                <div className="flex h-10 mt-2 w-full items-center justify-center rounded-10 border  border-gray-300 bg-white px-2 text-xs text-primary-light-color">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* <div className="relative text-left">
                              <Switch
                                checked={item?.status === 1}
                                disabled
                                className={`group relative flex h-6 w-12 cursor-default rounded-full ${item?.status === 1 ? "bg-green-500" : "bg-black/30"} p-1 transition-colors duration-200 ease-in-out`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item?.status === 1 ? "translate-x-6" : "translate-x-0"}`}
                                />
                              </Switch>
                            </div> */}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5 mt-5 text-left">
                      <h2 className="label mb-2 text-sm text-secondary">Other Information</h2>
                    </div>

                    <Input label="Notes" placeholder="Notes" textarea value={data?.description || ""} readOnly />
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

export default ViewSamagriModal;
