import React from "react";
import { CalendarDaysIcon, GiftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  ARRIVALS_PRINT,
  CAR_PRINT,
  CEREMONIES_PRINT,
  CONTACT_PRINT,
  DEPARTURES_PRINT,
  EVENT_PRINT,
  GIFT_ALLOCATION_PRINT,
  GIFT_PRINT,
  HOTEL_PRINT,
  INVITATION_CARD_PRINT,
  INVITEES_PRINT,
  MENU_PRINT,
  RECEIVED_GIFT_PRINT,
  RSVP_PRINT,
  SAMAGRI_PRINT,
  VENDOR_PRINT,
  VENUE_PRINT,
} from "../../routes/Names";
import { Images } from "../../assets/Assets";
import { useTranslation } from "react-i18next";

const ReportItem = ({ title, icon, printRoute }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center gap-x-2">
        {icon}
        <h3 className="text-base font-medium">{title}</h3>
      </div>
      <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(printRoute)}>
        <PrinterIcon className="h-5 w-5" />
        <p>{`${title} List`}</p>
      </div>
    </div>
  );
};

const Reports = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <>
      <div className="h-[70vh]">
        <h1 className="heading mb-4">{t("reports.allReports")}</h1>
        <div className="grid grid-cols-3 gap-x-3 gap-y-5">
          {/* <ReportItem title="Invitees Reports" icon={<img src={Images.INVITEE} alt="Invitees Icon" className="w-5 h-5" />} printRoute={INVITEES_PRINT} />
          <ReportItem title="RSVP Reports" icon={<img src={Images.REPORTS} alt="Reports Icon" className="w-5 h-5" />} printRoute={RSVP_PRINT} />
          <ReportItem title="Gift Allocation Reports" icon={<img src={Images.GIFTALLOCATION} alt="Gift Allocation Icon" className="w-5 h-5" />} printRoute={GIFT_ALLOCATION_PRINT} /> */}
          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.INVITEE} alt="Invitees Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.inviteesReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(INVITEES_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.inviteesList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.REPORTS} alt="Reports Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.rsvpReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(RSVP_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.rsvpList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.GIFTALLOCATION} alt="Gift Allocation Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.giftAllocationReports")}</h3>
            </div>
            <div
              className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2"
              onClick={() => navigate(GIFT_ALLOCATION_PRINT)}
            >
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.giftAllocationList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.ARRIVALS} alt="Arrivals Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.arrivalReports")}</h3>
            </div>
            <div onClick={() => navigate(ARRIVALS_PRINT)} className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2">
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.arrivalList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.DEPARTURE} alt="Departures Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.departureReports")}</h3>
            </div>
            <div
              onClick={() => navigate(DEPARTURES_PRINT)}
              className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2"
            >
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.departureList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.HOTELROOM} alt="Hotel Room Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.hotelAllocationReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(HOTEL_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.hotelAllocationList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.CONTACT} alt="Services Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.contactReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(CONTACT_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.contactList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.VENUE} alt="Services Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.venueReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(VENUE_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.venueList")}</p>
            </div>
          </div>
          {/* <div>
            <div className="flex gap-x-2 items-center">
              <CalendarDaysIcon className="w-5 h-5" />
              <h3 className="text-base font-medium">Event Reports</h3>
            </div>
            <div className="flex gap-x-2 items-center p-2 mt-4 w-full rounded-md cursor-pointer bg-primary" onClick={() => navigate(EVENT_PRINT)}>
              <PrinterIcon className="w-5 h-5" />
              <p>Event List</p>
            </div>
          </div> */}

          <div>
            <div className="flex items-center gap-x-2">
              <CalendarDaysIcon className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.invitationCardReports")}</h3>
            </div>
            <div
              onClick={() => navigate(INVITATION_CARD_PRINT)}
              className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2"
            >
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.invitationCardList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.CEREMONIES} alt="Ceremonies Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.ceremonyReports")}</h3>
            </div>
            <div
              className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2"
              onClick={() => navigate(CEREMONIES_PRINT)}
            >
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.ceremonyList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <GiftIcon className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.giftReports")}</h3>
            </div>
            <div onClick={() => navigate(GIFT_PRINT)} className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2">
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.giftList")}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <GiftIcon className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.receivedGiftReports")}</h3>
            </div>
            <div
              onClick={() => navigate(RECEIVED_GIFT_PRINT)}
              className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2"
            >
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.receivedGiftList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.SAMAGRI} alt="Samagri Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.samagriReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(SAMAGRI_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.samagriList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.VENDOR} alt="VENDOR   Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.vendorReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(VENDOR_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.vendorList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.HOTEL} alt="HOTEL   Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.hotelReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(HOTEL_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.hotelList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.CAR} alt="CAR   Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.carReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(CAR_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.carList")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <img src={Images.MENU} alt="MENU   Icon" className="h-5 w-5" />
              <h3 className="text-base font-medium">{t("reports.menuReports")}</h3>
            </div>
            <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(MENU_PRINT)}>
              <PrinterIcon className="h-5 w-5" />
              <p>{t("reports.menuList")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
