import React, { useEffect, useState , useRef } from "react";
import Dropdown from "../../components/common/Dropdown";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import { INVITATION_CARDS, MENU } from "../../routes/Names";
import Skeleton from "react-loading-skeleton";
import Lottie from "react-lottie";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import Button from "../../components/common/Button";
import ApiServices from "../../api/services";
import moment from "moment";
import { useThemeContext } from "../../context/GlobalContext";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";

const InvitationCardPrint = () => {
  const { t } = useTranslation("common");
  
const TABLE_HEAD_MENU = [t("invitationCard.name"), t("headings.notes")];

const TABLE_HEAD_GROUP = ["Salutation", "Contact Name"];
  // Context
  const { allInvitationCards , userData , getInvitationCards } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [allInvitationCardList, setAllInvitationCardList] = useState([]);
  const [allInvitationCardUserList, setAllInvitationCardUserList] = useState("");

  const getInvitationCardListToPrint = async () => {
    try {
      setLoading(true);
      const result = await ApiServices.invitation_card.getInvitationCardReport();
      if (result.data.code === 200) {
        setAllInvitationCardList(result?.data?.data);
        setLoading(false);
        setSelectedItem("")
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const [reportLoading , setReportLoading] = useState(false)

  const getInvitationCardUserListToPrint = async () => {
    let payload = {
      card_ids: selectedItem.map((item) => item.value),
    };
    try {
      setReportLoading(true);
      const result = await ApiServices.invitation_card.getInvitationCardReportUser(payload);
       
      if (result.status === 200) {
        setAllInvitationCardUserList(result?.data);
        setReportLoading(false);
      }
    } catch (error) {}
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handlePrintList = useReactToPrint({
    content: () => componentRef.current,
  });

  const PrintableCarsList = React.forwardRef(({ allInvitationCardUserList, reportLoading }, ref) => (
    <div ref={ref} className="mt-5 pr-2 printableCarsList">
    <table className="w-full text-left">
      <thead>
        <tr>
          {TABLE_HEAD_GROUP.map((head) => (
            <th key={head} className="border-b border-gray-100 bg-white p-4 first:pl-6">
              <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {reportLoading ? (
          <tr>
            <td colSpan="2">
              <Skeleton count={5} height={50} />
            </td>
          </tr>
        ) : allInvitationCardUserList?.length > 0 ? (
          allInvitationCardUserList.map((item) => (
            <>
              <tr className="bg-gray-100">
                <td colSpan="2" className="flex items-center gap-x-4 py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-bold 3xl:text-sm">Card:</p>
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name}</p>
                </td>
                <td></td>
              </tr>
              {item.card_allocation.length > 0 ? (
                item.card_allocation.map((item) => (
                  <tr>
                    <td className=" py-3 pl-6 pr-4">{item.salutation || "-"}</td>
                    <td className=" py-3 pl-6 pr-4">{item?.first_name + " " + item?.last_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className=" py-3 pl-6 pr-4">-</td>
                  <td className=" py-3 pl-6 pr-4">-</td>
                </tr>
              )}
            </>
          ))
        ) : (
          <tr className="h-[400px]">
            <td colSpan="2">
              <Lottie options={emptyFolderAnimation} width={200} height={200} />
              <p className="text-center text-lg text-gray-500">Please Generate Report</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  ));

  const PrintableList = React.forwardRef(({ allInvitationCardList, loading }, ref) => (
    <div ref={ref}  className="mt-5 h-[50vh] pr-2 printableCarsList">
    <div className="-mx-6 mb-8 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD_MENU.map((head) => (
              <th className="border-b border-gray-100 bg-white p-4 first:pl-6">
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="2">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allInvitationCardList?.length > 0 ? (
            allInvitationCardList?.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-6 3xl:pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.name}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.description}</p>
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="2">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  ));

  useEffect(()=>{
    getInvitationCardListToPrint();
    getInvitationCards()
  },[])

  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Invitation Cards")) && <div onClick={() => navigate(INVITATION_CARDS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
        <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
        <span> Back to invitation card list</span>
      </div>}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Invitation card</h3>
        <div className="grid grid-cols-12">
          <div className="col-span-4">
            <Dropdown
              isRequired
              withoutTitle
              placeholder="Guest Name"
              options={allInvitationCards}
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(e);
                setAllInvitationCardUserList("")
              }}
              isMulti
            />
          </div>
          <div className="ml-5 mt-2">
            <Button
              title={t("invitationCard.report")}
              type="button"
              onClick={() => {
                getInvitationCardUserListToPrint();
              }}
            />
          </div>
        </div>

        {selectedItem.length === 0 && (
         <PrintableList ref={componentRef} allInvitationCardList={allInvitationCardList} loading={loading} />
        )}

        {selectedItem.length > 0 && (
           <PrintableCarsList ref={componentRef} allInvitationCardUserList={allInvitationCardUserList} reportLoading={reportLoading} />
        )}

        <div className="mt-4 flex items-center justify-end">
          {
            selectedItem.length === 0 ?
            (
              <Button icon={<PrinterIcon />} title={t('buttons.print')} type="button" onClick={handlePrintList} />
            ) :

            (<Button icon={<PrinterIcon />} title={t('buttons.print')} type="button" onClick={handlePrint} />)
          }
          
        </div>
      </div>
    </>
  );
};

export default InvitationCardPrint;

