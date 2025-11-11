import moment from "moment";
import Lottie from "react-lottie";
import { TASKS } from "../../routes/Names";
import { useNavigate } from "react-router";
import ApiServices from "../../api/services";
import Skeleton from "react-loading-skeleton";
import { useReactToPrint } from "react-to-print";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import InputTags from "../../components/common/InputTags";
import React, { useEffect, useRef, useState } from "react";
import { useThemeContext } from "../../context/GlobalContext";
import { emptyFolderAnimation } from "../../utilities/lottieAnimations";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

// options
const taskTypeOptions = [
  { label: "My Tasks", value: "my" },
  { label: "Delegated Tasks", value: "delegate" },
  { label: "Other Tasks", value: null },
];
const TaskPrint = () => {
  const { t } = useTranslation("common");

  const TABLE_HEAD_ARRIVALS = [t("tasks.title"), t("tasks.dueDate"), t("tasks.status"), t("tasks.assignedTo"), t("tasks.tags")];

  // useContext
  const { eventSelect, allUsers, userData } = useThemeContext();

  // Navigations
  const navigate = useNavigate();

  // Ref
  const componentRef = useRef();

  // Use States
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState(null);
  const [usersError, setUsersError] = useState("");
  const [allTasksList, setAllTasksList] = useState([]);
  const [taskTypeError, setTaskTypeError] = useState("");

  // Handle Print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Validations
  const isValidForm = () => {
    let isValidData = true;
    if (taskType === null) {
      setTaskTypeError(" Required");
      isValidData = false;
    }
    if (users === null) {
      setUsersError(" Required");
      isValidData = false;
    }
    return isValidData;
  };

  // get tasks list to print
  const getTasksListToPrintAll = async () => {
    try {
      setLoading(true);
      let payload;

      payload = {
        type: taskType?.value,
        user_id: users?.value,
        tags: tags,
        event_id: eventSelect,
      };

      const result = await ApiServices.tasks.getTasksReport(payload);
      //
      if (result.data.code === 200) {
        setAllTasksList(result?.data?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // Filter
  const handleFilter = (e) => {
    e.preventDefault();

    if (isValidForm()) {
      getTasksListToPrintAll();
    }
  };

  // useEffects
  useEffect(() => {
    getTasksListToPrintAll();
  }, []);

  const PrintableVenueList = React.forwardRef(({ allTasksList, loading }, ref) => (
    <div ref={ref} className="printableVenueList pr-2">
      <table className="w-full text-left">
        <thead>
          <tr>
            {TABLE_HEAD_ARRIVALS.map((head) => (
              <th className="border-b border-gray-100 bg-white p-4 first:pl-6" key={head}>
                <p className="font-inter cursor-pointer whitespace-nowrap text-xs font-semibold leading-5 3xl:text-sm">{head}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8">
                <Skeleton count={5} height={50} />
              </td>
            </tr>
          ) : allTasksList && allTasksList.length > 0 ? (
            allTasksList.map((item, index) => (
              <tr key={item?.id}>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm"> {item?.title || "-"}</p>
                </td>
                <td className="py-3 pl-6 pr-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">
                    {moment.unix(item?.end_date).format("D MMM YYYY") || "-"}
                  </p>
                </td>
                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{item?.status || "-"}</p>
                </td>

                <td className="py-3 pl-4 pr-3 3xl:px-4">
                  <p className="text-primary-color-200 text-xs font-normal 3xl:text-sm">{`${item?.assign_to?.first_name} ${item?.assign_to?.last_name}`}</p>
                </td>
                <td className="py-3 pl-6 pr-4">
                  {item?.tags.length > 0
                    ? item?.tags.map((tag, index) => (
                        <span key={index}>
                          <Badge title={tag} />
                        </span>
                      ))
                    : "No Tags"}
                </td>
              </tr>
            ))
          ) : (
            <tr className="h-[400px]">
              <td colSpan="6">
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
      {(userData?.role === "superAdmin" || userData?.role?.permissions?.includes("Tasks")) && (
        <div onClick={() => navigate(TASKS)} className={`mb-5 flex cursor-pointer text-base font-medium text-secondary hover:underline`}>
          <ArrowLeftIcon className="mr-2 h-6 w-4 text-secondary" />
          <span> Back to Tasks list</span>
        </div>
      )}
      <div className="card min-h-[76vh]">
        <h3 className="heading">Print Tasks</h3>
        <div className="mt-5 grid grid-cols-6 gap-8 xl:grid-cols-12">
          <div className="col-span-3">
            <Dropdown
              isRequired
              withoutTitle
              withError={taskTypeError}
              options={taskTypeOptions}
              placeholder="Select Task Type"
              value={taskType}
              onChange={(e) => {
                setTaskType(e);
                setTaskTypeError("");
              }}
            />
          </div>
          <div className="col-span-3">
            <Dropdown
              isRequired
              withoutTitle
              withError={usersError}
              options={allUsers}
              placeholder="Select Any User"
              value={users}
              onChange={(e) => {
                setUsers(e);
                setUsersError("");
              }}
            />
          </div>
          <div className="col-span-3">
            <InputTags selected={tags} setSelected={setTags} name="tags" />
          </div>
          <div className="col-span-3 mt-2">
            <Button title={t("tasks.showReport")} onClick={handleFilter} />
          </div>
        </div>

        <div className="mt-5 h-[54vh] overflow-y-auto overflow-x-hidden">
          <div className="mb-8 overflow-x-auto">
            <PrintableVenueList ref={componentRef} allTasksList={allTasksList} loading={loading} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button icon={<PrinterIcon />} title={t("buttons.print")} type="button" onClick={handlePrint} />
        </div>
      </div>
    </>
  );
};

export default TaskPrint;
