import { Dialog, Transition } from "@headlessui/react";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";



const SessionModal = ({ sessionExpire, setSessionExpire }) => {
  //   const { logOut } = useThemeContext();

  const expireSessionFunc = () => {
        setSessionExpire(false);
    //     logOut();
    //     scroll(true);
  };

  return (
    <Transition.Root show={sessionExpire} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative flex w-full  max-w-md transform flex-col items-center gap-y-8 overflow-hidden rounded-lg bg-white px-4 pt-5 pb-10 text-left  shadow-xl transition-all">
                <XMarkIcon className="h-8 w-8 self-end cursor-pointer " onClick={expireSessionFunc} />
                <div className=" flex flex-col items-center gap-y-6">
                  <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Your session has expired.
                  </Dialog.Title>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SessionModal;
