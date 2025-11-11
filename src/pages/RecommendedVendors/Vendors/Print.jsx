import Lottie from "react-lottie";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { VENDORS } from "../../routes/Names";
import { useReactToPrint } from "react-to-print";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import React, { useEffect, useState, useRef } from "react";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const VendorsPrint = () => {

  const { t: commonT } = useTranslation("common");

  const { eventSelect , userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allVendorsList, setAllVendorsList] = useState([]);

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getVendorsListToPrint = async () => {
    let payload = {
      event_id : eventSelect
    };
    try {
      setLoading(true);
      const result = await ApiServices.vendors.getVendorReport(payload);
      if (result.data.code === 200) {
        setAllVendorsList(result?.data?.data);
        setLoading(false);
      }
       
    } catch (error) {
      setLoading(false);
       
    }
  };

  useEffect(() => {
    getVendorsListToPrint();
  }, []);

  const PrintableVendorsList = React.forwardRef(({ allVendorsList, loading }, ref) => (
    <div ref={ref} className="pr-2 printableVendorsList">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th className="p-4 bg-white border-b border-gray-100 first:pl-6">
                <p className="text-xs font-semibold leading-5 cursor-pointer font-inter whitespace-nowrap 3xl:text-sm">{head}</p>
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
          ) : allVendorsList?.length > 0 ? (
            allVendorsList?.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.name}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.first_contact_person_name}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.first_contact_person_phone}</p>
                </td>

                <td className="py-3 pl-4 pr-3 max-w-52 3xl:px-4">
                  <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">
                    {item?.tags.length > 0
                      ? item?.tags.map((tag, index) => (
                          <span key={index}>
                            <Badge title={tag} />
                          </span>
                        ))
                      : "No Tags"}
                  </p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="4">
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
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Vendors")) && <div onClick={() => navigate(VENDORS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
        <ArrowLeftIcon className="w-4 h-6 mr-2 text-secondary" />
        <span> Back to Vendors list</span>
      </div>}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Vendors</h3>

        <div className="mt-5 h-[58vh] overflow-y-auto  overflow-x-hidden">
          <div className="mb-8 -mx-6 overflow-x-auto">
            <PrintableVendorsList ref={componentRef} allVendorsList={allVendorsList} loading={loading} />
          </div>
        </div>

        {allVendorsList?.length > 0 && (
          <div className="flex items-center justify-end mt-4">
            <Button icon={<PrinterIcon />} title={commonT('buttons.print')} type="button" onClick={handlePrint} />
          </div>
        )}
      </div>
    </>
  );
};

export default VendorsPrint;

// Table Head
const TABLE_HEAD = ["Vendor Name", "Contact Person", "Contact Number", "Tags"];
