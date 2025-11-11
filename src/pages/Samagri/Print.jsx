import moment from "moment";
import { useEffect } from "react";
import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { SAMAGRI } from "../../routes/Names";
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/common/Button";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const SamagriPrint = () => {
  // translation
  const { t } = useTranslation("common");

  const { eventSelect, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allSamagriList, setSamagriList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  //   Get Samagri List to Print
  const getSamagriListToPrint = async (type) => {
    let payload = {
      type,
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.samagri.getSamagriReport(payload);
      if (result.data.code === 200) {
        setSamagriList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSamagriListToPrint();
  }, []);

  const TABLE_HEAD = [t("samagri.samagriListName"), t("samagri.ceremonyName"), t("samagri.ceremonyDateTime"), t("samagri.itemsAndQuantity")];

  const PrintableSamagriList = React.forwardRef(({ allSamagriList, loading }, ref) => (
    <div ref={ref} className="printableSamagriList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th key={head} className="border-b border-gray-100 bg-white p-4 first:pl-6">
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allSamagriList?.length > 0 ? (
            allSamagriList?.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.title}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.ceremony?.name}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {moment.unix(item?.ceremony?.start_date).format("D MMM YYYY h:mm A")}
                  </p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {`${item?.samagri_items[0]?.name} (${item?.samagri_items[0]?.qty} ${item?.samagri_items[0]?.unit})`}
                  </p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="4">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
                <p className="text-center text-lg text-gray-500">Please select an event type!</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Samagri")) && (
        <div onClick={() => navigate(SAMAGRI)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span>{t("samagri.backToSamagriList")}</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">{t("samagri.printSamagri")}</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableSamagriList ref={componentRef} allSamagriList={allSamagriList} loading={loading} />
          </div>
        </div>
        {allSamagriList?.length > 0 && (
          <div className="mt-4 flex items-center justify-end">
            <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
          </div>
        )}
      </div>
    </>
  );
};

export default SamagriPrint;
