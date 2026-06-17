import React from "react";
import { CalendarDaysIcon, GiftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  ARRIVALS_PRINT,
  CAR_ALLOCATION_PRINT,
  CAR_PRINT,
  CARD_ALLOCATION_PRINT,
  CEREMONIES_PRINT,
  CONTACT_PRINT,
  DEPARTURES_PRINT,
  GIFT_ALLOCATION_PRINT,
  GIFT_PRINT,
  GUEST_FLIGHTS_PRINT,
  GUEST_TRAINS_PRINT,
  HOTEL_PRINT,
  HOTEL_ROOM_PRINT,
  INVITATION_CARD_PRINT,
  INVITEES_PRINT,
  MENU_PRINT,
  QR_OVERVIEW_PRINT,
  RECEIVED_GIFT_PRINT,
  RSVP_PRINT,
  SAMAGRI_PRINT,
  TASK_PRINT,
  VENDOR_PRINT,
  VENUE_PRINT,
} from "../../routes/Names";
import { Images } from "../../assets/Assets";
import { useTranslation } from "react-i18next";

const ReportItem = ({ title, icon, listLabel, printRoute }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center gap-x-2">
        {icon}
        <h3 className="text-base font-medium">{title}</h3>
      </div>
      <div className="mt-4 flex w-full cursor-pointer items-center gap-x-2 rounded-md bg-primary p-2" onClick={() => navigate(printRoute)}>
        <PrinterIcon className="h-5 w-5" />
        <p>{listLabel}</p>
      </div>
    </div>
  );
};

const Reports = () => {
  const { t } = useTranslation("common");

  const reportItems = [
    {
      title: t("reports.inviteesReports"),
      listLabel: t("reports.inviteesList"),
      icon: <img src={Images.INVITEE} alt="Invitees Icon" className="h-5 w-5" />,
      printRoute: INVITEES_PRINT,
    },
    {
      title: t("reports.rsvpReports"),
      listLabel: t("reports.rsvpList"),
      icon: <img src={Images.REPORTS} alt="RSVP Icon" className="h-5 w-5" />,
      printRoute: RSVP_PRINT,
    },
    {
      title: t("reports.giftAllocationReports"),
      listLabel: t("reports.giftAllocationList"),
      icon: <img src={Images.GIFTALLOCATION} alt="Gift Allocation Icon" className="h-5 w-5" />,
      printRoute: GIFT_ALLOCATION_PRINT,
    },
    {
      title: t("reports.arrivalReports"),
      listLabel: t("reports.arrivalList"),
      icon: <img src={Images.ARRIVALS} alt="Arrivals Icon" className="h-5 w-5" />,
      printRoute: ARRIVALS_PRINT,
    },
    {
      title: t("reports.departureReports"),
      listLabel: t("reports.departureList"),
      icon: <img src={Images.DEPARTURE} alt="Departures Icon" className="h-5 w-5" />,
      printRoute: DEPARTURES_PRINT,
    },
    {
      title: t("reports.contactReports"),
      listLabel: t("reports.contactList"),
      icon: <img src={Images.CONTACT} alt="Contacts Icon" className="h-5 w-5" />,
      printRoute: CONTACT_PRINT,
    },
    {
      title: t("reports.venueReports"),
      listLabel: t("reports.venueList"),
      icon: <img src={Images.VENUE} alt="Venues Icon" className="h-5 w-5" />,
      printRoute: VENUE_PRINT,
    },
    {
      title: t("reports.invitationCardReports"),
      listLabel: t("reports.invitationCardList"),
      icon: <CalendarDaysIcon className="h-5 w-5" />,
      printRoute: INVITATION_CARD_PRINT,
    },
    {
      title: "Card Allocation Reports",
      listLabel: "Card Allocation List",
      icon: <img src={Images.CARD_ALLOCATION} alt="Card Allocation Icon" className="h-5 w-5" />,
      printRoute: CARD_ALLOCATION_PRINT,
    },
    {
      title: t("reports.ceremonyReports"),
      listLabel: t("reports.ceremonyList"),
      icon: <img src={Images.CEREMONIES} alt="Ceremonies Icon" className="h-5 w-5" />,
      printRoute: CEREMONIES_PRINT,
    },
    {
      title: t("reports.giftReports"),
      listLabel: t("reports.giftList"),
      icon: <GiftIcon className="h-5 w-5" />,
      printRoute: GIFT_PRINT,
    },
    {
      title: t("reports.receivedGiftReports"),
      listLabel: t("reports.receivedGiftList"),
      icon: <GiftIcon className="h-5 w-5" />,
      printRoute: RECEIVED_GIFT_PRINT,
    },
    {
      title: t("reports.samagriReports"),
      listLabel: t("reports.samagriList"),
      icon: <img src={Images.SAMAGRI} alt="Samagri Icon" className="h-5 w-5" />,
      printRoute: SAMAGRI_PRINT,
    },
    {
      title: t("reports.vendorReports"),
      listLabel: t("reports.vendorList"),
      icon: <img src={Images.VENDOR} alt="Vendor Icon" className="h-5 w-5" />,
      printRoute: VENDOR_PRINT,
    },
    {
      title: t("reports.hotelReports"),
      listLabel: t("reports.hotelList"),
      icon: <img src={Images.HOTEL} alt="Hotel Icon" className="h-5 w-5" />,
      printRoute: HOTEL_PRINT,
    },
    {
      title: "Allocated Room Reports",
      listLabel: "Allocated Room List",
      icon: <img src={Images.HOTELROOM} alt="Allocated Room Icon" className="h-5 w-5" />,
      printRoute: HOTEL_ROOM_PRINT,
    },
    {
      title: t("reports.carReports"),
      listLabel: t("reports.carList"),
      icon: <img src={Images.CAR} alt="Car Icon" className="h-5 w-5" />,
      printRoute: CAR_PRINT,
    },
    {
      title: "Car Allocation Reports",
      listLabel: "Car Allocation List",
      icon: <img src={Images.CARALLOCATION} alt="Car Allocation Icon" className="h-5 w-5" />,
      printRoute: CAR_ALLOCATION_PRINT,
    },
    {
      title: t("reports.menuReports"),
      listLabel: t("reports.menuList"),
      icon: <img src={Images.MENU} alt="Menu Icon" className="h-5 w-5" />,
      printRoute: MENU_PRINT,
    },
    {
      title: "Task Reports",
      listLabel: "Task List",
      icon: <img src={Images.REPORTS} alt="Task Icon" className="h-5 w-5" />,
      printRoute: TASK_PRINT,
    },
    {
      title: "Guest Flight Reports",
      listLabel: "Guest Flight List",
      icon: <img src={Images.ARRIVALS} alt="Guest Flight Icon" className="h-5 w-5" />,
      printRoute: GUEST_FLIGHTS_PRINT,
    },
    {
      title: "Guest Train Reports",
      listLabel: "Guest Train List",
      icon: <img src={Images.TRAIN_INACTIVE} alt="Guest Train Icon" className="h-5 w-5" />,
      printRoute: GUEST_TRAINS_PRINT,
    },
    {
      title: "QR Overview Reports",
      listLabel: "QR Overview List",
      icon: <img src={Images.CONTACT} alt="QR Overview Icon" className="h-5 w-5" />,
      printRoute: QR_OVERVIEW_PRINT,
    },
  ];

  return (
    <>
      <div className="h-[70vh]">
        <h1 className="heading mb-4">{t("reports.allReports")}</h1>
        <div className="grid grid-cols-3 gap-x-3 gap-y-5">
          {reportItems.map((item) => (
            <ReportItem key={item.printRoute} title={item.title} listLabel={item.listLabel} icon={item.icon} printRoute={item.printRoute} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Reports;
