import Button from "./Button";
import { Fragment, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";
import Input from "./Input";
const AddGroupModal = ({ isOpen, setIsOpen, handleSubmit, value, handleChange, message, setErrorMessageServer, setNewGroupName }) => {
  // Close Modal
  function closeModal() {
    setIsOpen(false);
    setErrorMessageServer("");
    setNewGroupName("");
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="w-full max-w-xl overflow-hidden rounded-2xl bg-white p-8 align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      Add New Guest Color
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="text-primary-color-200 h-8 w-8 cursor-pointer" />
                  </div>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <Input label="Color Name" placeholder="Enter Color Name" value={value} onChange={handleChange} />
                    <span className="text-xs font-medium text-red-500"> {message}</span>

                    {/* Message */}
                    {/* <p className="text-center text-sm font-medium text-red-500">{message}</p> */}
                    {/* End Message */}

                    <div className="flex items-center justify-end gap-x-6">
                      <h3 onClick={closeModal} className="cursor-pointer text-lg font-medium text-secondary">
                        Cancel
                      </h3>
                      <Button title="Add Color" />
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

export default AddGroupModal;
