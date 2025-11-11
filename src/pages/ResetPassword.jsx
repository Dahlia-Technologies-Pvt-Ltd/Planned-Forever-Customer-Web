import moment from "moment";
import React, { useState, useEffect, useRef } from "react";
import { DASHBOARD, FORGOT_PASSWORD, LOGIN, VENUES } from "../routes/Names";
import { Images } from "../assets/Assets";
import { Link, useNavigate } from "react-router-dom";
import { validateLoginForm, validateResetPasswordForm } from "../utilities/HelperFunctions";
import { useThemeContext } from "../context/GlobalContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import SuccessModal from "../components/common/SuccessModal";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {

  const { t: commonT } = useTranslation("common");

  // Context
  const { loading, setLoading, setSuccessModal } = useThemeContext();

  // Navigation
  const navigate = useNavigate();

  // Use States
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const { confirmPassword, password } = formData;

  // Handle Change Input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // Submit Data
  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateResetPasswordForm(formData);
    const { confirmPassword, password } = errors;

    setErrors(errors);

    if (!confirmPassword && !password) {
      setLoading(true);
      setMessage("");

      setSuccessModal({
        open: true,
        title: "Congratulations!",
        message: "Your password has been reset successfully!",
      });

      // const next24Hours = moment().add(24, "hours").valueOf();
      // localStorage.setItem("sessionTime", next24Hours);
      // localStorage.setItem("user", JSON.stringify("Taimur"));
      // navigate(VENUES);

      // const user = await signInAdmin(formData.password);

      //   if (user.success) {
      //     setLoading(false);
      //     setMessage("");
      //     // Calculate next 24-hour time from now using moment
      //     const next24Hours = moment().add(24, "hours").valueOf();
      //     localStorage.setItem("sessionTime", next24Hours);
      //     localStorage.setItem("user", JSON.stringify(user));
      //     navigate(DASHBOARD);
      //   } else {
      //     setMessage(user.message);
      //     setLoading(false);
      //   }
    }
  };

  return (
    <>
      <div className="mx-auto h-full max-w-lg space-y-8 lg:pr-20 2xl:py-12 3xl:pr-4">
        <img src={Images.LOGO1} className="w-52 3xl:w-60" alt="logo" />
        <div className="">
          <h2 className="heading">Reset your password</h2>
          <p className="mt-3 text-sm text-info-color">Reset your password to continue planning your dream wedding.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-0">
          <div className="">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
              isRequired
              name="password"
              error={errors.password}
            />
          </div>
          <div className="mt-5">
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={handleChange}
              isRequired
              name="confirmPassword"
              error={errors.confirmPassword}
            />
          </div>
          <Button title="Save" type="submit" className="mt-10 w-full" />
        </form>
      </div>

      <SuccessModal onClickBtn={() => navigate(LOGIN)} />
    </>
  );
};

export default ResetPassword;
