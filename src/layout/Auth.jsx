import React from "react";
import { Outlet } from "react-router-dom";
import { Images } from "../assets/Assets";

const Auth = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-y-auto bg-white px-8 py-8 lg:px-0 lg:py-6">
      <div className="w-full rounded-2.5xl bg-white lg:px-28">
        <div className="items-center gap-8 lg:grid lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-6">
            <Outlet />
          </div>
          <div className="relative hidden min-h-[32rem] items-center lg:col-span-5 lg:flex xl:col-span-6">
            <img src={Images.AuthImageNew} alt="" className="mx-auto h-[32rem] w-full object-contain 2xl:h-[38rem] 3xl:h-[44rem]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Auth;
