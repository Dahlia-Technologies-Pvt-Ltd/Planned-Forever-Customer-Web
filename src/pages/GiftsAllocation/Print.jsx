import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import { GIFT_ALLOCATION } from "../../routes/Names";
import Skeleton from "react-loading-skeleton";
import Lottie from "react-lottie";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import Button from "../../components/common/Button";
import ApiServices from "../../api/services";
import { useReactToPrint } from "react-to-print";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const GiftAllocationPrint = () => {
  const { t } = useTranslation("common");

  const { userData, eventSelect } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allGiftAllocationList, setAllGiftAllocationList] = useState([]);

  // Function to get maximum number of gifts across all contacts
  const getMaxGiftsCount = (giftAllocations) => {
    if (!giftAllocations || giftAllocations.length === 0) return 0;
    return Math.max(...giftAllocations.map(contact => contact?.gift?.length || 0));
  };

  // Generate dynamic gift columns
  const generateGiftColumns = (maxGifts) => {
    const giftColumns = [];
    for (let i = 1; i <= maxGifts; i++) {
      giftColumns.push(`Gift ${i}`, `Gift ${i} Quantity`);
    }
    return giftColumns;
  };

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Get Gift Allocation List to Print
  const getGiftAllocationListToPrint = async () => {
    let payload = {
      event_id: eventSelect,
      type: "contact"
    };
    try {
      setLoading(true);
      const result = await ApiServices.gifts.getGiftReport(payload);
      if (result.data.code === 200) {
        setAllGiftAllocationList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGiftAllocationListToPrint();
  }, []);

  const PrintableGiftAllocationList = React.forwardRef(({ allGiftAllocationList, loading }, ref) => {
    const maxGifts = getMaxGiftsCount(allGiftAllocationList);
    const giftColumns = generateGiftColumns(maxGifts);
    const allColumns = ["Guest Name", ...giftColumns];
    
    return (
      <div ref={ref} className="printableGiftAllocationList pr-2">
        <table className="w-full text-left">
          <thead>
            <tr>
              {allColumns.map((head, index) => (
                <th key={index} className="border-b border-gray-100 bg-white p-4 first:pl-6">
                  <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
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
            ) : allGiftAllocationList?.length > 0 ? (
              allGiftAllocationList.map((item) => (
                <tr key={item?.id}>
                  <td className="py-3 pl-6 pr-4">
                    <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                      {`${item?.first_name} ${item?.last_name}` || "-"}
                    </p>
                  </td>
                  
                  {/* Dynamic Gift and Gift Quantity Columns */}
                  {giftColumns.map((_, giftIndex) => {
                    const giftNumber = Math.floor(giftIndex / 2) + 1;
                    const isQuantity = giftIndex % 2 === 1;
                    const gift = item?.gift && item?.gift[giftNumber - 1];
                    
                    return (
                      <td key={giftIndex} className="py-3 pl-4 pr-3 3xl:px-4">
                        <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                          {gift ? (isQuantity ? gift?.pivot?.quantity || "-" : gift?.name || "-") : "-"}
                        </p>
                      </td>
                    );
                  })}
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
      {/* {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Gift Allocation")) &&  */}
      
      <div onClick={() => navigate(GIFT_ALLOCATION)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
        <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
        <span> Back to GIft Allocation list</span>
      </div>
      {/* } */}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Gift Allocation</h3>


        <div className="mt-5 h-[58vh] overflow-y-auto overflow-x-hidden">
          <div className="-mx-6 mb-8 overflow-x-auto">
            <PrintableGiftAllocationList
              ref={componentRef}
              allGiftAllocationList={allGiftAllocationList}
              loading={loading}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={t('buttons.print')} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default GiftAllocationPrint;
