import React, { useEffect, useState } from "react";
import Dropdown from "@components/common/Dropdown";
import Button from "@components/common/Button";
import Lottie from "react-lottie";
import { emptyFolderAnimation } from "@utilities/lottieAnimations";
import ApiServices from "@api";
import { useThemeContext } from "@context";

const QrCodesOverviewPrint = () => {
  const { eventSelect } = useThemeContext();

  const [selectedColorCode, setSelectedColorCode] = useState(null);
  const [generatedQrCode, setGeneratedQrCode] = useState(null);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [colorCodeOptions, setColorCodeOptions] = useState([]);
  const [allContact, setAllContact] = useState([]);

  // Add function to get color codes
  const getColorCodes = () => {
    const requestData = {};
    ApiServices.contact
      .getColorCodes(requestData)
      .then((res) => {
        const { data, message } = res;
        if (data.status === true) {
          const colorCodes = data?.data?.map((color) => ({ id: color.id, value: color.id, label: color.name }));
          setColorCodeOptions(colorCodes);
        }
      })
      .catch((err) => {});
  };

  const getContacts = () => {
    let payload = {
      color_code_id: selectedColorCode?.value,
      event_id: eventSelect,
    };

    ApiServices.contact
      .GetAllContact(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setAllContact(data.data);
        } else {
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getColorCodes();
  }, []);

  return (
    <div className="grid grid-cols-12">
      <div className="card col-span-12 h-[84vh]">
        <h2 className="text-xl font-semibold">Print QR Codes</h2>

        <div className="mt-4 grid grid-cols-12 gap-7">
          <div className="col-span-3">
            <Dropdown
              isSearchable
              options={colorCodeOptions}
              placeholder="Select Color Code"
              title="Select Guest Colour Code"
              onChange={(value) => {
                setSelectedColorCode(value);
                setServerError("");
              }}
              value={selectedColorCode}
            />
          </div>
          <div className="col-span-3 mt-[32px]">
            <Button title={"Request QR Code"} onClick={getContacts} />
          </div>
        </div>
        {allContact?.length > 0  ? (
          <div className="mt-10 flex items-center justify-center">
            <div className="-mr-4 h-[60vh] w-60 overflow-auto rounded border border-gray-200 bg-gray-50 p-4 pr-4">
              {allContact?.length === 0 && selectedColorCode && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-gray-500">No Contact found against this color code</p>
                </div>
              )}
              {allContact?.map((item, index) => (
                <h2 key={index} className="text-left text-base">
                  {item?.first_name} {item?.last_name}
                </h2>
              ))}
            </div>

            <div className="mx-auto flex  max-w-2xl items-center justify-center gap-x-10">
              <div className="mt-4 flex h-[56vh] w-full flex-col items-center justify-center">
                <div className="flex h-full w-full items-center justify-center">
                  <img src={generatedQrCode} alt="Generated QR Code" className="h-auto max-h-[20vh] max-w-[20vw] rounded-lg shadow-lg" />
                </div>
                <Button title={"Download Design File"} />
              </div>
              <div className="mt-4 flex h-[56vh] w-full flex-col items-center justify-center">
                <div className="flex h-full w-full items-center justify-center">
                  <img src={generatedQrCode} alt="Generated QR Code" className="h-auto max-h-[20vh] max-w-[20vw] rounded-lg shadow-lg" />
                </div>
                <Button title={"Download Design File"} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-20 flex items-center justify-center">
            <div>
              <p>
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
                <p className="-mt-8 text-center text-gray-500">Select Color Code to generate the QR Code</p>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCodesOverviewPrint;
