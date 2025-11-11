import React from "react";
import { Outlet } from "react-router-dom";
import { Images } from "../assets/Assets";

const Auth = () => {
  return (
    <section className="relative flex h-screen items-center overflow-hidden bg-white px-8 lg:px-0">
      <div className="rounded-2.5xl w-full bg-white lg:px-28">
        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-6 xl:h-[500px] 3xl:h-[850px]">
            <Outlet />
          </div>
          <div className="relative flex items-center lg:col-span-5 lg:h-full xl:col-span-6">
            <img src={Images.AuthImageNew} alt="" className="absolute hidden h-[600px] w-full object-contain lg:block 2xl:h-[700px] 3xl:h-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Auth;
