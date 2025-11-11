import React, { useState, useRef } from "react";
import { Images } from "../../assets/Assets";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { MagnifyingGlassIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { CONTACT_DETAILS_VIEW } from "../../routes/Names";
import Dropdown from "../../components/common/Dropdown";
import countriesCodeData from "../../utilities/countryCode.json";
import ApiServices from "../../api/services";

const GetContactDetails = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("phone"); // "phone" or "otp"
  const [btnLoading, setBtnLoading] = useState(false);
  const [countryCodeError, setCountryCodeError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [searchError, setSearchError] = useState("");

  // Refs for OTP inputs
  const otpRefs = useRef([]);

  const validatePhoneForm = () => {
    let isValid = true;

    // Reset errors
    setCountryCodeError("");
    setPhoneNumberError("");
    setSearchError("");

    // Validate country code
    if (!countryCode) {
      setCountryCodeError("Required");
      isValid = false;
    }

    // Validate phone number
    if (!phoneNumber) {
      setPhoneNumberError("Required");
      isValid = false;
    } else if (phoneNumber.length < 7) {
      setPhoneNumberError("Phone number must be at least 7 digits");
      isValid = false;
    }

    return isValid;
  };

  const validateOtpForm = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setOtpError("Please enter complete 6-digit OTP");
      return false;
    }
    setOtpError("");
    return true;
  };

  const handlePhoneSubmit = async () => {
    if (validatePhoneForm()) {
      setBtnLoading(true);
      setSearchError("");

      try {
        // Extract just the country code value from the selected option
        const extractedCountryCode = countryCode.value.split(" ")[0];

        // Make the API call to send OTP
        const response = await ApiServices.contact.SendOTP({
          contact_number: phoneNumber,
          country_code: extractedCountryCode,
        });

        console.log("OTP sent response", response?.data);

        if (response?.data) {
          // Move to OTP step
          setStep("otp");
        } else {
          setSearchError("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        console.error("Error sending OTP:", error);

        // Handle different error scenarios
        if (error.response?.status === 404) {
          setSearchError("No contact found with this phone number");
        } else if (error.response?.status === 400) {
          setSearchError("Invalid phone number format");
        } else if (error.response?.status === 429) {
          setSearchError("Too many attempts. Please try again later.");
        } else {
          setSearchError("Failed to send OTP. Please try again.");
        }
      } finally {
        setBtnLoading(false);
      }
    }
  };

  const handleOtpSubmit = async () => {
    if (validateOtpForm()) {
      setBtnLoading(true);
      setOtpError("");

      try {
        // Extract just the country code value from the selected option
        const extractedCountryCode = countryCode.value.split(" ")[0];
        const otpString = otp.join("");

        // Make the API call to verify OTP and get contact details
        const response = await ApiServices.contact.VerifyOTPAndGetContact({
          contact_number: phoneNumber,
          country_code: extractedCountryCode,
          otp: parseInt(otpString),
        });

        console.log("OTP verification response", response?.data);

        // Check if response is successful and has the expected data structure
        if (response?.data) {
          // Store the token if needed for future API calls
          if (response.data.token) {
            // Store token in localStorage or context as needed
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('mobile', true);

          }

          // Navigate to the contact details view with the response data
          navigate(CONTACT_DETAILS_VIEW, {
            state: {
              contactData: response.data,
              searchPhone: `${extractedCountryCode}${phoneNumber}`,
              token: response.data.token,
            },
          });
        } else {
          setOtpError("Invalid response format. Please try again.");
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);

        // Handle different error scenarios
        if (error.response?.status === 400) {
          setOtpError("Invalid OTP. Please try again.");
        } else if (error.response?.status === 404) {
          setOtpError("No contact found with this phone number");
        } else if (error.response?.status === 401) {
          setOtpError("OTP has expired. Please request a new one.");
        } else if (error.response?.status === 429) {
          setOtpError("Too many attempts. Please try again later.");
        } else {
          setOtpError("Failed to verify OTP. Please try again.");
        }
      } finally {
        setBtnLoading(false);
      }
    }
  };

  const handlePhoneNumberChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
    setPhoneNumberError("");
    setSearchError("");
  };

  const handleOtpChange = (index, value) => {
    // Allow only numbers and single digit
    const numericValue = value.replace(/\D/g, "").slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (numericValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
  };

  const handleResendOTP = async () => {
    setBtnLoading(true);
    setOtpError("");

    try {
      const extractedCountryCode = countryCode.value.split(" ")[0];

      const response = await ApiServices.contact.SendOTP({
        contact_number: phoneNumber,
        country_code: extractedCountryCode,
      });

      if (response?.data) {
        // Clear current OTP and show success message
        setOtp(["", "", "", "", "", ""]);
        // You might want to show a success toast here
        console.log("OTP resent successfully");
      } else {
        setOtpError("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setBtnLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <>
      <p className="text-primary-color-200 px-2 py-5 text-center text-sm font-normal md:w-6/12 lg:text-left xl:w-3/12 3xl:text-base">
        Enter a phone number to search and view contact details.
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
                  setSearchError("");
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
                onChange={handlePhoneNumberChange} 
                maxLength="15" 
              />
              {phoneNumberError && !countryCodeError && <p className="mt-1 text-sm text-red-500">{phoneNumberError}</p>}
            </div>
          </div>
          {searchError && (
            <div className="mt-3 rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-600">{searchError}</p>
            </div>
          )}
        </div>
        <Button
          icon={<MagnifyingGlassIcon />}
          title="Send OTP"
          type="submit"
          loading={btnLoading}
          className="w-full"
          onClick={handlePhoneSubmit}
          disabled={btnLoading}
        />
      </div>
    </>
  );

  const renderOtpStep = () => (
    <>
      <p className="text-primary-color-200 px-2 py-5 text-center text-sm font-normal md:w-6/12 lg:text-left xl:w-3/12 3xl:text-base">
        Enter the 6-digit OTP sent to {countryCode?.value?.split(" ")[0]} {phoneNumber}
      </p>
      <div className="w-10/12 space-y-10 md:w-6/12 lg:space-y-16 xl:w-3/12">
        <div>
          <h2 className="label">
            Enter OTP <span className="text-red-500">*</span>
          </h2>
          <div className="mt-3 flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="h-12 w-12 rounded-lg border border-gray-300 text-center text-lg font-semibold focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="1"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>
          {otpError && (
            <div className="mt-3 rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-600">{otpError}</p>
            </div>
          )}
          
          {/* Resend OTP option */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the OTP?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={btnLoading}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <Button
            icon={<MagnifyingGlassIcon />}
            title="Verify & Get Contact"
            type="submit"
            loading={btnLoading}
            className="w-full"
            onClick={handleOtpSubmit}
            disabled={btnLoading}
          />
          <Button
            icon={<ArrowLeftIcon />}
            title="Back to Phone Number"
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleBackToPhone}
            disabled={btnLoading}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex w-full flex-col items-center justify-center py-10">
      <div>
        <img src={Images.LOGO1} className="h-60" alt="Logo" />
      </div>
      {step === "phone" ? renderPhoneStep() : renderOtpStep()}
    </div>
  );
};

export default GetContactDetails;