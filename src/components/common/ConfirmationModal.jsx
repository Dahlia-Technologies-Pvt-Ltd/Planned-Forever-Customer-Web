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
                <Dialog.Panel className="w-full max-w-[23rem] rounded-[1.5rem] bg-white px-8 py-8 text-center align-middle shadow-xl transition-all">
                  <img src={Images.QUESTION_MARK} alt="question mark icon" className="mx-auto w-24 max-w-full" />
                  <Dialog.Title as="h3" className="mx-auto mt-6 max-w-[15rem] font-poppins text-[1rem] font-semibold leading-snug text-secondary-color sm:text-[1.05rem]">
                    {message}
                  </Dialog.Title>

                  <p className="mt-2 min-h-[1rem] text-xs text-red-500">{errorMessage}</p>

                  <div className="mt-7 flex items-center justify-center gap-4">
                    <Button
                      className="h-10 min-w-[7rem] rounded-[0.85rem] px-6 text-sm font-semibold"
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
                      className="h-10 min-w-[7rem] rounded-[0.85rem] px-6 text-sm font-semibold"
                      buttonColor="bg-red-500"
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
