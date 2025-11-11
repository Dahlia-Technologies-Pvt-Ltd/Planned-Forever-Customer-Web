import Lottie from "react-lottie";
import { CARS } from "../../routes/Names";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/common/Button";
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";
import moment from "moment";

const CarPrint = () => {
  const { t } = useTranslation("common");

  // Table Head
  const TABLE_HEAD = [
    t("cars.carMakeModel"),
    t("cars.carNumber"),
    t("cars.driverName"),
    t("cars.driverPhoneNumber"),
    t("cars.availableFrom"),
    t("cars.availableTill"),
    t("cars.owner"),
  ];

  const { eventSelect, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allCarsList, setAllCarsList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getCarListToPrint = async () => {
    let payload = {
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.car.getCarReport(payload);
      if (result.data.code === 200) {
        setAllCarsList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCarListToPrint();
  }, []);

  const PrintableCarsList = React.forwardRef(({ allCarsList, loading }, ref) => (
    <div ref={ref} className="printableCarsList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th className="border-b border-gray-100 bg-white p-4 first:pl-6">
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allCarsList?.length > 0 ? (
            allCarsList?.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.make_and_model || "-"}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.number || "-"}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.driver_name || "-"}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.driver_contact?.country_code?.split(' ')[0] || ""} {item?.driver_contact?.phone || "-"}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {moment.unix(item?.available_from).format("D MMM YYYY  h:mm A") || "-"}
                  </p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                  {moment.unix(item?.available_till).format("D MMM YYYY  h:mm A") || "-"}

                  </p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.owner_name || "-"}</p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="7">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Cars")) && (
        <div onClick={() => navigate(CARS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span> Back to Car list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Cars</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableCarsList ref={componentRef} allCarsList={allCarsList} loading={loading} />
          </div>
        </div>

        {allCarsList?.length > 0 && (
          <div className="mt-4 flex items-center justify-end">
            <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
          </div>
        )}
      </div>
    </>
  );
};

export default CarPrint;
