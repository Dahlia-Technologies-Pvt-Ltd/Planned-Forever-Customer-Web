import moment from "moment";
import React, { useState } from "react";
import { DASHBOARD, LOGIN, VENUES } from "../routes/Names";
import { Images } from "../assets/Assets";
import { Link, useNavigate } from "react-router-dom";
import { validateLoginForm } from "../utilities/HelperFunctions";
import { useThemeContext } from "../context/GlobalContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import SuccessModal from "../components/common/SuccessModal";
import { useTranslation } from "react-i18next";
import ApiServices from "../api/services";

const ForgotPassword = () => {

  const { t: commonT } = useTranslation("common");

  // Context
  const { loading, setLoading, successModal, setSuccessModal } = useThemeContext();

  // Navigation
  const navigate = useNavigate();

  // Use States
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
  });

  const { email } = formData;

  // Handle Change Input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // Submit Data
  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateLoginForm(formData);
    const { email } = errors;

    setErrors(errors);

    if (!email) {
      try {
        setLoading(true);
        setMessage("");

        let payload = {
          email: formData.email,
        };

        const response = await ApiServices.auth.forgotPassword(payload);

        if (response.data.code === 200) {
          setLoading(false);
          setMessage("");

          setSuccessModal({
            open: true,
            title: "Email Sent Successfully!",
            message: "Password reset email has been sent to your provided email!",
            onClickDone: () => {
              navigate(LOGIN);
            },
          });
        } else {
          setLoading(false);
          setMessage("Oops! There is some issue in forgot password!");
        }
      } catch ({ response }) {
        setMessage(response?.data?.message);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="mx-auto h-full max-w-lg space-y-8 lg:pr-20 2xl:py-12 3xl:pr-4">
        <img src={Images.LOGO1} className="w-52 3xl:w-60" alt="logo" />
        <div className="">
          <h2 className="heading">Forgot your password?</h2>
          <p className="mt-3 text-sm text-info-color">Enter your email address below and we'll send you a password reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-0">
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={handleChange}
            isRequired
            name="email"
            error={errors?.email}
          />
          {loading ? (
            <p className="mt-2 block cursor-default text-right text-sm text-gray-500">Back to login?</p>
          ) : (
            <Link to={LOGIN} className="mt-2 block text-right text-sm hover:underline">
              Back to login?
            </Link>
          )}

          {message && <p className="mt-2 text-red-500">{message}</p>}

          <Button title="Send" type="submit" className="mt-10 w-full" loading={loading} />
        </form>
      </div>

      <SuccessModal />
    </>
  );
};

export default ForgotPassword;
