import React from "react";
import { Fragment } from "react";
import { Images } from "../../assets/Assets";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "../../context/GlobalContext";
import Button from "./Button";

const SuccessModal = ({ onClickBtn }) => {
  // Context
  const { successModal, closeSuccessModel } = useThemeContext();

  return (
    <>
      <Transition appear show={successModal.open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={
            onClickBtn
              ? () => {
                  onClickBtn();
                  closeSuccessModel();
                }
              : () => closeSuccessModel()
          }
        >
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
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-10 text-center align-middle shadow-xl transition-all 3xl:max-w-md">
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <img src={Images.COMPLETED} alt="Tick" className="mx-auto" />
                      <h3 className="px-4 text-xl font-semibold capitalize text-secondary-color">{successModal?.title}</h3>
                      <h3 className="text-base font-normal text-primary-color">{successModal?.message}</h3>
                    </div>

                    <div className="flex justify-center">
                      <Button title="Done" type="submit" className="w-full" onClick={successModal?.onClickDone} />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default SuccessModal;
