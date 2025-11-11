import Button from "./Button";
import Spinner from "./Spinner";
import { Fragment } from "react";
import { Images } from "../../assets/Assets";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "../../context/GlobalContext";

export default function ConfirmationModal({ message, isOpen, setIsOpen, handleSubmit, handleCancel }) {
  // Context
  const { btnLoading, errorMessage, setErrorMessage, setLoading, setBtnLoading } = useThemeContext();
  // Close Modal
  function closeModal() {
    setIsOpen(false);
    setLoading(false);
    setErrorMessage("");
    setBtnLoading(false);
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
                <Dialog.Panel className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-xl transition-all 3xl:max-w-md">
                  <img src={Images.QUESTION_MARK} alt="question mark icon" className="mx-auto" />
                  <Dialog.Title as="h3" className="mx-auto mt-8 max-w-xs font-poppins text-20 font-semibold leading-7 text-secondary-color">
                    {message}
                  </Dialog.Title>

                  <p className="my-4 text-sm text-red-500">{errorMessage}</p>

                  <div className="mt-12 flex justify-center gap-x-6 px-8">
                    <Button
                      className="w-full"
                      title={btnLoading ? <Spinner /> : "Yes"}
                      onClick={() => {
                        handleSubmit ? handleSubmit() : closeModal();
                      }}
                    />

                    <Button
                      title="No"
                      onClick={() => {
                        handleCancel ? handleCancel() : closeModal();
                      }}
                      buttonColor="bg-red-500 w-full"
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
