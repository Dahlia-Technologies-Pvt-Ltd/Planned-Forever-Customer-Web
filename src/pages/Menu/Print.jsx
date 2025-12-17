import React, { useRef, useState, useEffect } from "react";
import Dropdown from "../../components/common/Dropdown";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import { MENU } from "../../routes/Names";
import Skeleton from "react-loading-skeleton";
import Lottie from "react-lottie";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import Button from "../../components/common/Button";
import ApiServices from "../../api/services";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import { useThemeContext } from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const MenuPrint = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD_MENU = [t("menu.dateTime"), t("menu.sessionName"), t("menu.menuItemCourse")];
  const TABLE_HEAD_MENU_ITEMS = [t("menu.dateTime"), t("menu.sessionName"), t("menu.menuItemName"), t("qty	"), t("notes"), t("type")];

  const menu_options = [
    {
      label: "Print Menu Details",
      value: "menu",
    },
    {
      label: "Print Menu Items",
      value: "menuItems",
    },
  ];

  const { eventSelect, userData } = useThemeContext();
  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [loading, setLoading] = useState(false);
  const [allMenuList, setAllMenuList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
//'Print Menu Items'
  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    setSelectedItem("menuItems");
  }, []);

  useEffect(() => {
    if (selectedItem) {
      getMenuListToPrint(selectedItem);
    }
  }, [selectedItem]);
  //   Get Menu List to Print
  const getMenuListToPrint = async (type) => {
    let payload = {
      type,
      event_id: eventSelect,
    };
    try {
      setLoading(true);
      const result = await ApiServices.menu.getMenuReport(payload);
      if (result.data.code === 200) {
        setAllMenuList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const PrintableMenuList = React.forwardRef(({ allMenuList, selectedItem, loading }, ref) => (
    <div ref={ref} className="printableMenuList">
      <table className="w-full text-left">
        <thead>
          {selectedItem?.value === "menu" ? (
            <tr>
              {TABLE_HEAD_MENU.map((head) => (
                <th className="p-4 bg-white border-b border-gray-100 first:pl-6">
                  <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
                </th>
              ))}
            </tr>
          ) : (
            <tr>
              {TABLE_HEAD_MENU_ITEMS.map((head) => (
                <th className="p-4 bg-white border-b border-gray-100 first:pl-6">
                  <p className="text-xs font-semibold leading-5 whitespace-nowrap cursor-pointer font-inter 3xl:text-sm">{head}</p>
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allMenuList?.length > 0 ? (
            allMenuList?.map((item, index) =>
              selectedItem?.value === "menu" ? (
                <tr key={item?.id}>
                  <td className="py-3 pr-4 pl-6">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{moment.unix(item?.date).format("D MMM YYYY")}</p>
                  </td>

                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.session}</p>
                  </td>

                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">
                      <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">
                        {item?.menu_items?.map((menuItem, index) => (
                          <span key={index}>
                            {menuItem.name}
                            {item.menu_items.length > 1 && index !== item.menu_items.length - 1 && ", "}
                          </span>
                        ))}
                      </p>
                    </p>
                  </td>
                </tr>
              ) : (
                
                <tr key={item?.id}>
                  <td className="py-3 pr-4 pl-6">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{moment.unix(item.menu.date).format("D MMM YYYY")}</p>
                  </td>

                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item.menu.session}</p>
                  </td>
                  <td className="py-3 pr-4 pl-6">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.name}</p>
                  </td>

                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.qty}</p>
                  </td>

                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">{item?.notes}</p>
                  </td>

                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">
                      {item?.type}
                    </p>
                  </td>
{/* 
                  <td className="py-3 pr-3 pl-4 3xl:px-4">
                    <p className="text-xs font-normal text-primary-color-200 3xl:text-sm">
                      {moment(item?.menu?.end_time, "HH:mm").format("hh:mm A")}
                    </p>
                  </td> */}
                </tr>
              ),
            )
          ) : (
            <tr className="h-[400px]">
              <td colSpan="6">
                <Lottie options={emptyFolderAnimation} width={200} height={200} />
                <p className="text-lg text-center text-gray-500">Please select an menu type!</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <>
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Menu")) && (
        <div onClick={() => navigate(MENU)} className={`flex mb-5 text-base font-medium cursor-pointer text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 w-4 h-6 text-secondary" />
          <span> Back to Menu list</span>
        </div>
      )}
      <div className="card ">
        <h3 className="heading">Print Menu</h3>
        {/* <div className="grid grid-cols-12">
          <div className="col-span-4">
            <Dropdown
              isRequired
              withoutTitle
              placeholder="Select Menu Type"
              options={menu_options}
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(e);
                getMenuListToPrint(e?.value);
              }}
            />
          </div>
        </div> */}

        <div className="mt-5 ">
          <div className="overflow-x-auto -mx-6 mb-8">
            <PrintableMenuList ref={componentRef} allMenuList={allMenuList} selectedItem={selectedItem} loading={loading} />
          </div>
        </div>
        {selectedItem !== null && (
          <div className="flex justify-end items-center mt-4">
            <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
          </div>
        )}
      </div>
    </>
  );
};

export default MenuPrint;
