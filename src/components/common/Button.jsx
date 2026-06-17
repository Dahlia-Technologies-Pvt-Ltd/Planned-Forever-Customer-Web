import React from "react";
import Spinner from "./Spinner";
import { Link } from "react-router-dom";

const Button = ({ type, title, className, href, link, icon, onClick, buttonColor, loading, disabled }) => {
  return link ? (
    <Link
      to={href}
      onClick={onClick}
      className={`inline-flex h-10 shrink-0 whitespace-nowrap items-center justify-center rounded-10 px-6 ${buttonColor ? buttonColor : "border-secondary bg-secondary"} text-sm font-medium text-white
 transition-all hover:shadow-lg ${className ? className : ""}`}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {icon && <span className="w-6 h-6 mr-2 text-white">{icon}</span>}
          {title}
        </>
      )}
    </Link>
  ) : (
    <button
      type={type ? type : "submit"}
      onClick={onClick}
      disabled={disabled && disabled}
      className={`inline-flex h-10 shrink-0 whitespace-nowrap items-center justify-center rounded-10 px-6 ${buttonColor ? buttonColor : "border-secondary bg-secondary"} text-sm font-medium text-white
 transition-all hover:shadow-lg ${className ? className : ""}`}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {icon && <span className="w-6 h-6 mr-2 text-white">{icon}</span>}
          {title}
        </>
      )}
    </button>
  );
};

export default Button;
