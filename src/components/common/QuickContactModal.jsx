import Button from "./Button";
import Spinner from "./Spinner";
import { Fragment } from "react";
import { Images } from "../../assets/Assets";
import { Dialog, Transition } from "@headlessui/react";

export default function QuickContactModal({ message, isOpen, setIsOpen, handleSubmit, btnLoading , title , description }) {
  // Close Modal
  function closeModal() {
    setIsOpen(false);
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
            <div className="flex items-center justify-center min-h-full p-4 ">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="w-full max-w-xl p-8 overflow-hidden  align-middle transition-all bg-white shadow-xl rounded-2xl 3xl:max-w-xl">
                <Dialog.Title as="h3" className="max-w-xl mx-auto mt-8 font-semibold text-center leading-7 font-poppins text-2xl text-secondary-color">
                {title}
                  </Dialog.Title>
                <Dialog.Title as="h3" className="max-w-xl mx-auto mt-8 leading-7 font-poppins text-12 text-secondary-color">
                {description}
                  </Dialog.Title>
                  
                  <Dialog.Title as="h3" className="max-w-xl mx-auto mt-8 font-semibold leading-7 font-poppins text-16 text-secondary-color">
                    {message}
                  </Dialog.Title>

                  <div className="flex justify-center px-8 mt-12 gap-x-6">
                    <Button
                      className="w-full"
                      title="Yes"
                      onClick={() => {
                        handleSubmit ? handleSubmit() : closeModal();
                      }}
                    />

                    <Button title="No" onClick={closeModal} buttonColor="w-full bg-red-600" />
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
