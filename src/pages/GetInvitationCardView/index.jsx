import React, { useState } from "react";
import { Images } from "../../assets/Assets";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { INVITATION_CARD_VIEW } from "../../routes/Names";
import Dropdown from "../../components/common/Dropdown";
import countriesCodeData from "../../utilities/countryCode.json";
import { getInvitationCardUser } from "../../api/services/InvitationCardView"; // Import the API function

const GetInvitationCardView = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [countryCodeError, setCountryCodeError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setCountryCodeError("");
    setPhoneNumberError("");

    // Validate country code
    if (!countryCode) {
      setCountryCodeError("Required");
      isValid = false;
    }

    // Validate phone number
    if (!phoneNumber) {
      setPhoneNumberError("Required");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setBtnLoading(true);
      
      try {
        // Extract just the country code value from the selected option
        const extractedCountryCode = countryCode.value;
        
        // Make the API call with the required format
        const response = await getInvitationCardUser({
          country_code: extractedCountryCode,
          contact_number: phoneNumber
        });
        console.log("response", response?.data)
        // Navigate to the invitation card view with the response data
        navigate(INVITATION_CARD_VIEW, { state: { invitationData: response?.data } });
      } catch (error) {
        console.error("Error fetching invitation card:", error);
        // Handle error (could add error state and display message)
      } finally {
        setBtnLoading(false);
      }
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center py-10">
      <div>
        <img src={Images.LOGO1} className="h-60" alt="Logo" />
      </div>
      <p className="text-primary-color-200 px-2 py-5 text-center text-sm font-normal md:w-6/12 lg:text-left xl:w-3/12 3xl:text-base">
        Enter your phone number to receive your invitation card for viewing.
      </p>
      <div className="w-10/12 space-y-10 md:w-6/12 lg:space-y-16 xl:w-3/12">
        <div>
          <h2 className="label">
            Phone Number{" "}
            <span className="text-red-500">
              * {phoneNumberError && countryCodeError && <span className=" text-sm text-red-500">{phoneNumberError}</span>}
            </span>
          </h2>
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-6 lg:col-span-5">
              <Dropdown
                isSearchable
                options={countriesCodeData?.countries.map((country) => ({
                  label: `+${country.callingCodes[0]} ${country.name}`,
                  value: `+${country.callingCodes[0]} ${country.name}`,
                }))}
                placeholder="Country Code"
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e);
                  setCountryCodeError("");
                }}
                invisible
              />
              {countryCodeError && !phoneNumberError && <p className="mt-1 text-sm text-red-500">{countryCodeError}</p>}
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-7">
              <Input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneNumberError("");
                }}
              />
              {phoneNumberError && !countryCodeError && <p className="mt-1 text-sm text-red-500">{phoneNumberError}</p>}
            </div>
          </div>
        </div>
        <Button icon={<CheckIcon />} title="Submit" type="submit" loading={btnLoading} className="w-full" onClick={handleSubmit} />
      </div>
    </div>
  );
};

export default GetInvitationCardView;