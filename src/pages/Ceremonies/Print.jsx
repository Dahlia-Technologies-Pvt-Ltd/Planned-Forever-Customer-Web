import moment from "moment";
import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { CEREMONIES } from "../../routes/Names";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import React, { useEffect, useRef, useState } from "react";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const CeremoniesPrint = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD_Ceremonies = [
    t("ceremonies.ceremonyName"),
    t("ceremonies.venue"),
    t("ceremonies.heldAt"),
    t("ceremonies.dressCode"),
    t("ceremonies.startDateAndTime"),
    t("ceremonies.endDateAndTime"),
    t("ceremonies.personIncharge"),
    t("ceremonies.countryCode"),
    t("Number"),
  ];
  const TABLE_HEAD_Ceremonies_BY_GIFT = [
    t("ceremonies.ceremonyName"),
    t("ceremonies.venue"),
    t("ceremonies.heldAt"),
    t("ceremonies.dressCode"),
    t("ceremonies.startDateAndTime"),
    t("ceremonies.endDateAndTime"),
    t("ceremonies.personIncharge"),
    t("ceremonies.countryCode"),
    t("Number"),
    "Gifts",
  ];
  const TABLE_HEAD_Ceremonies_BY_Samagri = [
    t("ceremonies.ceremonyName"),
    t("ceremonies.venue"),
    t("ceremonies.heldAt"),
    t("ceremonies.dressCode"),
    t("ceremonies.startDateAndTime"),
    t("ceremonies.endDateAndTime"),
    t("ceremonies.personIncharge"),
    t("ceremonies.countryCode"),
    t("Number"),
    "Samagri",
  ];
  const TABLE_HEAD_Ceremonies_BY_BOTH = [
    t("ceremonies.ceremonyName"),
    t("ceremonies.venue"),
    t("ceremonies.heldAt"),
    t("ceremonies.dressCode"),
    t("ceremonies.startDateAndTime"),
    t("ceremonies.endDateAndTime"),
    t("ceremonies.personIncharge"),
    t("ceremonies.countryCode"),
    t("ceremonies.number"),
    "Gifts",
    "Samagri",
  ];

  // useContext
  const { eventSelect, allEvents, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [isCheckedGift, setIsCheckedGift] = useState(false);
  const [allCeremonyList, setAllCeremonyList] = useState([]);
  const [isCheckedSamagri, setIsCheckedSamagri] = useState(false);
  const [selectedEventItem, setSelectedEventItem] = useState(null);

  console.log("allCeremonyList",allCeremonyList);
  // handel gift checkbox change
  const handleCheckboxChangeGift = () => {
    setIsCheckedGift(!isCheckedGift);
  };

  // handel Samagri checkbox change
  const handleCheckboxChangeSamagri = () => {
    setIsCheckedSamagri(!isCheckedSamagri);
  };

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // get ceremony list to print
  const getCeremonyListToPrintAll = async (all, type) => {
    try {
      let payload;
      if (all === "all") {
        payload = {
          type: "all",
          event_id: eventSelect,
        };
      } else {
        payload = {
          event_id: eventSelect,
        };
      }
      setLoading(true);
      const result = await ApiServices.ceremonies.getCeremoniesReport(payload);
      if (result.data.code === 200) {
        setAllCeremonyList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // useEffect
  useEffect(() => {
    getCeremonyListToPrintAll("all");
  }, []);

  const PrintableVenueList = React.forwardRef(({ allCeremonyList, loading }, ref) => (
    <div ref={ref} className="pr-2 printableVenueList">
      <table className="w-full text-left">
        <thead>
          {isCheckedGift && !isCheckedSamagri ? (
            <tr>
              {TABLE_HEAD_Ceremonies_BY_GIFT.map((head) => (
                <th className="p-4 bg-white border-b border-gray-100 first:pl-6" key={head}>
                  <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
                </th>
              ))}
            </tr>
          ) : isCheckedSamagri && !isCheckedGift ? (
            <tr>
              {TABLE_HEAD_Ceremonies_BY_Samagri.map((head) => (
                <th className="p-4 bg-white border-b border-gray-100 first:pl-6" key={head}>
                  <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
                </th>
              ))}
            </tr>
          ) : isCheckedGift && isCheckedSamagri ? (
            <tr>
              {TABLE_HEAD_Ceremonies_BY_BOTH.map((head) => (
                <th className="p-4 bg-white border-b border-gray-100 first:pl-6" key={head}>
                  <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
                </th>
              ))}
            </tr>
          ) : (
            <tr>
              {TABLE_HEAD_Ceremonies.map((head) => (
                <th className="p-4 bg-white border-b border-gray-100 first:pl-6" key={head}>
                  <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allCeremonyList && allCeremonyList.length > 0 ? (
            allCeremonyList.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pr-4 pl-6">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.name || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.venue?.name || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.held_at?.name || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.dress_code || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">
                    {moment.unix(item?.start_date).format("D MMM YYYY h:mm A") || "-"}
                  </p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">
                    {moment.unix(item?.end_date).format("D MMM YYYY h:mm A") || "-"}
                  </p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.incharge_name || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.incharge_contact_number?.code || "-"}</p>
                </td>
                <td className="py-3 pr-3 pl-4 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.incharge_contact_number?.phone_number || "-"}</p>
                </td>
                {isCheckedGift && (
                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    {item?.gift?.length > 0 ? (
                      item?.gift?.map((gifts) => <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{gifts?.name || "-"}</p>)
                    ) : (
                      <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">-</p>
                    )}
                  </td>
                )}
                {isCheckedSamagri && (
                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    {item?.samagri?.length > 0 ? (
                      <>
                        {" "}
                        {item?.samagri?.map((samagriItem) => (
                          <div key={samagriItem.id}>
                            <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{samagriItem.title || "-"}</p>
                            {samagriItem?.items?.map((samagriItems) => (
                              <div key={samagriItems.id} className="flex gap-x-1 items-center">
                                <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{samagriItems?.qty || "-"}</p>
                                <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{samagriItems?.name || "N"}</p>
                              </div>
                            ))}
                          </div>
                        ))}{" "}
                      </>
                    ) : (
                      <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">-</p>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="9">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
                <p className="text-lg text-center text-gray-500">{selectedEventItem && "No Ceremony for this Selected Event"} </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Ceremonies")) && (
        <div onClick={() => navigate(CEREMONIES)} className={`flex mb-5 text-base font-medium cursor-pointer text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 w-4 h-6 text-secondary" />
          <span> Back to Ceremonies list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Ceremonies</h3>
        <div className="grid grid-cols-6 gap-8 mt-5 xl:grid-cols-12">
          {/* <div className="col-span-3">
            <Dropdown
              isRequired
              withoutTitle
              placeholder="Select Event Type"
              options={allEvents}
              value={selectedEventItem}
              onChange={(e) => {
                setSelectedEventItem(e);
                getCeremonyListToPrintAll("", e?.value);
              }}
            />
          </div> */}
          <div className="flex col-span-4 gap-x-12 items-center">
            <h3 className="text-base font-medium">{t("ceremonies.includes")}:</h3>
            <div className="flex gap-x-2 items-center pl-2">
              <input
                onChange={handleCheckboxChangeGift}
                type="checkbox"
                id="addressCheckbox"
                name="addressCheckbox"
                className="rounded"
                checked={isCheckedGift}
              />
              <label htmlFor="addressCheckbox" className="label">
                {t("ceremonies.gift")}
              </label>
            </div>
            <div className="flex gap-x-2 items-center pl-2">
              <input
                onChange={handleCheckboxChangeSamagri}
                type="checkbox"
                id="addressCheckbox"
                name="addressCheckbox"
                className="rounded"
                checked={isCheckedSamagri}
              />
              <label htmlFor="addressCheckbox" className="label">
                {t("ceremonies.samagri")}
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 h-[54vh] overflow-y-auto overflow-x-hidden">
          <div className="overflow-x-auto -mx-6 mb-8">
            <PrintableVenueList ref={componentRef} allCeremonyList={allCeremonyList} loading={loading} />
          </div>
        </div>

        <div className="flex justify-end items-center mt-4">
          <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default CeremoniesPrint;
