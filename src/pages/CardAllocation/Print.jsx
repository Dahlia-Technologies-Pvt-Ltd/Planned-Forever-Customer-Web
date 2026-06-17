import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import { CARD_ALLOCATION } from "../../routes/Names";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/common/Button";
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const CardAllocationPrint = () => {
  const { t } = useTranslation("common");
  const { eventSelect, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allCardAllocationList, setAllCardAllocationList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getCardAllocationListToPrint = async () => {
    let payload = {
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.invitation_card.getInvitationCardReport(payload);
      if (result.data.code === 200) {
        setAllCardAllocationList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCardAllocationListToPrint();
  }, []);

  const PrintableCardAllocationList = React.forwardRef(({ allCardAllocationList, loading }, ref) => {
    const allColumns = ["Guest Name", "Mobile Number", "Allocated Card"];

    const renderCell = (item, header) => {
      if (header === "Guest Name") {
        return `${item?.first_name || ""} ${item?.last_name || ""}`.trim() || "-";
      }

      if (header === "Mobile Number") {
        const primaryContact = item?.contact_numbers?.[0];
        const countryCode = primaryContact?.country_code || "";
        const contactNumber = primaryContact?.contact_number || "";
        const mobileNumber = `${countryCode} ${contactNumber}`.trim();
        return mobileNumber || "-";
      }

      if (header === "Allocated Card") {
        const allocatedCards = item?.allocated_cards || [];
        if (!allocatedCards.length) {
          return "-";
        }

        return allocatedCards
          .map((cardAllocation) => cardAllocation?.card?.name || "Unknown Card")
          .join(", ");
      }

      return "-";
    };

    return (
      <div ref={ref} className="pr-2 printableCardAllocationList">
        <table className="w-full text-left">
          <thead>
            <tr>
              {allColumns.map((head) => (
                <th key={head} className="p-4 bg-white border-b border-gray-100 first:pl-6">
                  <p className="text-sm font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={allColumns.length}>
                  <Skeleton count={5} height={50} />
                </td>
              </tr>
            ) : allCardAllocationList?.length > 0 ? (
              allCardAllocationList?.map((item) => (
                <tr key={item?.uuid}>
                  {allColumns.map((head) => (
                    <td key={head} className="py-3 pr-3 pl-4 first:pl-6 3xl:px-4">
                      <p className="text-md font-normal text-primary-color-200 3xl:text-sm">{renderCell(item, head)}</p>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="h-[400px]">
                <td colSpan={allColumns.length}>
                  <Lottie options={emptyFolderAnimation} width={200} height={200} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  });

  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Card Allocation")) && (
        <div onClick={() => navigate(CARD_ALLOCATION)} className={`flex mb-5 text-base font-medium cursor-pointer text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 w-4 h-6 text-secondary" />
          <span> Back to Card Allocation list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Card Allocation</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden">
          <div className="overflow-x-auto -mx-6 mb-8">
            <PrintableCardAllocationList ref={componentRef} allCardAllocationList={allCardAllocationList} loading={loading} />
          </div>
        </div>

        {allCardAllocationList?.length > 0 && (
          <div className="flex justify-end items-center mt-4">
            <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
          </div>
        )}
      </div>
    </>
  );
};

export default CardAllocationPrint;
