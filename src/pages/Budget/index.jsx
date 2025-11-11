import ApiServices from "../../api/services";
import { Images } from "../../assets/Assets";
import Skeleton from "react-loading-skeleton";
import Input from "../../components/common/Input";
import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { MinusIcon, PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import ChooseFile from "../../components/common/ChooseFile";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { useTranslation } from "react-i18next";

function Budget() {
  const { t } = useTranslation("common");

  // Global States
  const {
    eventSelect,
    getCeremonies,
    allCeremonies,
    btnLoading,
    setBtnLoading,
    allEvents,
    openSuccessModal,
    closeSuccessModel,
    onSuccess,
    getEventList,
  } = useThemeContext();

  // Use states

  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [eventError, setEventError] = useState(false);
  const [totalBudgetError, setTotalBudgetError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalBudget, setTotalBudget] = useState("");
  const [budget, setBudget] = useState([
    {
      name: "",
      // credit: "",
      debit: "",
      file_url: null,
      date_time: "",
      loading: false, // Added loading state here
      budget_child: [],
    },
  ]);

  const addBudget = () => {
    setBudget([
      ...budget,
      {
        name: "",
        // credit: "",
        debit: "",
        file_url: null,
        date_time: "",
        loading: false,
        budget_child: [],
      },
    ]);
  };

  const removeBudget = (index) => {
    const newBudget = [...budget];
    newBudget.splice(index, 1);
    setBudget(newBudget);
  };

  const handleInputChange = (index, field, value) => {
    const newBudget = [...budget];
    newBudget[index][field] = value;
    setBudget(newBudget);
  };

  const addChild = (index) => {
    const newBudget = [...budget];
    newBudget[index].budget_child.push({
      name: "",
      // credit: "",
      debit: "",
      file_url: null,
      date_time: "",
    });
    setBudget(newBudget);
  };

  const removeChild = (parentIndex, childIndex) => {
    const newBudget = [...budget];
    newBudget[parentIndex].budget_child.splice(childIndex, 1);
    setBudget(newBudget);
  };

  const handleChildInputChange = (parentIndex, childIndex, field, value) => {
    const newBudget = [...budget];
    newBudget[parentIndex].budget_child[childIndex][field] = value;
    setBudget(newBudget);
  };

  // const getBudgetData = () => {
  //   if (selectedItem?.value) {
  //     setLoading(true);

  //     let id = selectedItem?.value;

  //     ApiServices.budget
  //       .getBudget(id)
  //       .then((res) => {
  //         const { data, message } = res;
  //         if (data.code === 200) {
  //           setLoading(false);
  //           if (data && data.data) {
  //             if (Array.isArray(data.data.budgets) && data.data.budgets.length === 0) {
  //               setBudget([
  //                 {
  //                   name: "",
  //                   credit: "",
  //                   debit: "",
  //                   file_url: null,
  //                   date_time: "",
  //                   budget_child: [],
  //                 },
  //               ]);
  //               setTotal(0);
  //               setTotalBudget("");
  //             } else {
  //               setBudget(data.data.budgets);
  //               setTotal(data?.data?.totals?.balance);
  //               setTotalBudget(data?.data?.totals?.total_budget);
  //             }
  //           }
  //         }
  //       })
  //       .catch((err) => {});
  //   }
  // };

  // Add Budget API
  const getBudgetData = () => {
    if (selectedItem?.value) {
      setLoading(true);

      let id = selectedItem?.value;

      ApiServices.budget
        .getBudget(id)
        .then((res) => {
          const { data, message } = res;
          if (data.code === 200) {
            setLoading(false);
            if (data && data.data) {
              if (Array.isArray(data.data.budgets) && data.data.budgets.length === 0) {
                setBudget([
                  {
                    name: "",
                    // credit: "",
                    debit: "",
                    file_url: null,
                    date_time: "",
                    budget_child: [],
                  },
                ]);
                setTotal(0);
                setTotalBudget("");
              } else {
                // Map through the budgets and convert date_time from Unix timestamp to Date object
                const budgetsWithConvertedDates = data.data.budgets.map((item) => ({
                  ...item,
                  date_time: item.date_time ? moment.unix(item?.date_time).format("YYYY-MM-DD HH:mm") : "", // Convert to Date
                  budget_child: item.budget_child.map((child) => ({
                    ...child,
                    date_time: child.date_time ? moment.unix(child?.date_time).format("YYYY-MM-DD HH:mm") : "", // Convert to Date for child
                  })),
                }));

                setBudget(budgetsWithConvertedDates);
                setTotal(data?.data?.totals?.balance);
                setTotalBudget(data?.data?.totals?.total_budget);
              }
            }
          }
        })
        .catch((err) => {
          setLoading(false);
          console.error("Error fetching budget data:", err); // Optional: handle the error
        });
    }
  };

  const validateInputs = () => {
    let isValidData = true;

    if (!selectedItem || !selectedItem.value) {
      setEventError(true);
      isValidData = false;
    }

    if (totalBudget === "") {
      setTotalBudgetError(true);
      isValidData = false;
    }

    return isValidData;
  };

  // const handleAddBudget = () => {
  //   if (validateInputs()) {
  //     const emptyFields = [];
  //     budget.forEach((item, index) => {
  //       if (Object.values(item).some((value) => value === "")) {
  //         emptyFields.push(`Budget ${index + 1}`);
  //       } else {
  //         item.budget_child.forEach((child, childIndex) => {
  //           if (Object.values(child).some((value) => value === "")) {
  //             emptyFields.push(`Child ${childIndex + 1} of Budget ${index + 1}`);
  //           }
  //         });
  //       }
  //     });

  //     if (emptyFields.length > 0) {
  //       setFieldError(`Please fill in all fields for ${emptyFields.join(", ")}.`);
  //       return;
  //     }

  //     setBtnLoading(true);

  //     let payload = {
  //       event_id: eventSelect,
  //       budget: budget,
  //       total_budget: totalBudget,
  //       ceremony_id: selectedItem?.value,
  //     };

  //     ApiServices.budget
  //       .addBudget(payload)
  //       .then((res) => {
  //         const { data, message } = res;

  //         if (data.code === 200) {
  //           setBtnLoading(false);
  //           setSelectedItem(null);
  //           setTotalBudget("");
  //           setTotalBudgetError(false);
  //           setBudget([
  //             {
  //               name: "",
  //               credit: "",
  //               debit: "",
  //               budget_child: [],
  //             },
  //           ]);
  //           setFieldError("");
  //           setTotal(0);
  //           openSuccessModal({
  //             title: "Success!",
  //             message: "Budget has been Add!",
  //             onClickDone: (close) => {
  //               closeSuccessModel();
  //               onSuccess();
  //             },
  //           });
  //         } else {
  //           setBtnLoading(false);
  //         }
  //       })
  //       .catch((err) => {
  //         setBtnLoading(false);
  //         setMessage(err?.response?.data?.message);
  //       });
  //   }
  // };

  const handleAddBudget = () => {
    if (validateInputs()) {
      const emptyFields = [];
      budget.forEach((item, index) => {
        if (Object.values(item).some((value) => value === "")) {
          emptyFields.push(`Budget ${index + 1}`);
        } else {
          item.budget_child.forEach((child, childIndex) => {
            if (Object.values(child).some((value) => value === "")) {
              emptyFields.push(`Child ${childIndex + 1} of Budget ${index + 1}`);
            }
          });
        }
      });

      if (emptyFields.length > 0) {
        setFieldError(`Please fill in all fields for ${emptyFields.join(", ")}.`);
        return;
      }

      setBtnLoading(true);

      // Convert date_time fields to Unix timestamps in a deep copy of budget
      const budgetWithUnixDates = budget.map((item) => ({
        ...item,
        date_time: item.date_time ? toUTCUnixTimestamp(item.date_time) : item.date_time,
        budget_child: item.budget_child.map((child) => ({
          ...child,
          date_time: child.date_time ? toUTCUnixTimestamp(child.date_time) : child.date_time,
        })),
      }));

      const payload = {
        event_id: eventSelect,
        budget: budgetWithUnixDates,
        total_budget: totalBudget,
        ceremony_id: selectedItem?.value,
      };

      ApiServices.budget
        .addBudget(payload)
        .then((res) => {
          const { data, message } = res;

          if (data.code === 200) {
            setBtnLoading(false);
            setSelectedItem(null);
            setTotalBudget("");
            setTotalBudgetError(false);
            setBudget([
              {
                name: "",
                // credit: "",
                debit: "",
                file_url: null,
                date_time: "",
                budget_child: [],
              },
            ]);
            setFieldError("");
            setTotal(0);
            openSuccessModal({
              title: t("messages.success"),
              message: t("budget.budgetSuccess"),
              onClickDone: (close) => {
                closeSuccessModel();
                onSuccess();
              },
            });
          } else {
            setBtnLoading(false);
          }
        })
        .catch((err) => {
          setBtnLoading(false);
          setMessage(err?.response?.data?.message);
        });
    }
  };

  useEffect(() => {
    getBudgetData();
  }, [selectedItem?.value]);

  useEffect(() => {
    getCeremonies();
  }, []);

  const [fileError, setFileError] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [identityFile, setIndentityFile] = useState(null);

  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];

  //   const uploadFile = (file) => {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     setFileLoading(true);

  //     ApiServices.contact
  //       .contactProfileUpload(formData)
  //       .then((res) => {
  //         const { data, message } = res;

  //         if (res.code === 200) {
  //           setIndentityFile(file);
  //           setFile(data);
  //           setFileLoading(false);
  //           setFileError("");
  //           event.target.value = null;
  //         }
  //       })
  //       .catch((err) => {
  //         setFileLoading(false);
  //         setFileError(err.response.data.message);
  //       });
  //   };

  //   // Call the uploadFile function passing the 'file' parameter
  //   uploadFile(file);
  // };

  // const handleFileChange = (index, event, isChild = false, childIndex = null) => {
  //   const file = event.target.files[0];
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   setFileLoading(true);

  //   ApiServices.contact
  //     .contactProfileUpload(formData)
  //     .then((res) => {
  //       if (res.code === 200) {
  //         const newBudget = [...budget];
  //         if (isChild) {
  //           newBudget[index].budget_child[childIndex].file_url = res.data;
  //         } else {
  //           newBudget[index].file_url = res.data;
  //         }
  //         setBudget(newBudget);
  //         setFileLoading(false);
  //         setFileError("");
  //       }
  //     })
  //     .catch((err) => {
  //       setFileLoading(false);
  //       setFileError(err.response.data.message);
  //     });
  // };

  const handleFileChange = (index, event, isChild = false, childIndex = null) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    // Update loading state only for the specific item or child
    setBudget((prevBudget) => {
      const newBudget = [...prevBudget];
      if (isChild) {
        newBudget[index].budget_child[childIndex].loading = true;
      } else {
        newBudget[index].loading = true;
      }
      return newBudget;
    });

    ApiServices.contact
      .contactProfileUpload(formData)
      .then((res) => {
        if (res.code === 200) {
          setBudget((prevBudget) => {
            const newBudget = [...prevBudget];
            if (isChild) {
              newBudget[index].budget_child[childIndex].file_url = res.data;
              newBudget[index].budget_child[childIndex].loading = false;
            } else {
              newBudget[index].file_url = res.data;
              newBudget[index].loading = false;
            }
            return newBudget;
          });
          setFieldError("");
        }
      })
      .catch((err) => {
        // Set loading to false on error
        setBudget((prevBudget) => {
          const newBudget = [...prevBudget];
          if (isChild) {
            newBudget[index].budget_child[childIndex].loading = false;
          } else {
            newBudget[index].loading = false;
          }
          return newBudget;
        });
        setFileError(err.response.data.message);
      });
  };

  const handleCrossClick = () => {
    setIndentityFile(null);
    setFile(null);
  };

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <div className="card min-h-[82vh] space-y-8">
          <h3 className="heading">Budget</h3>
          <div className="flex w-full items-center justify-between">
            <div className="flex w-full gap-x-3">
              <div className="w-3/12">
                <Dropdown
                  isRequired
                  // withoutTitle
                  options={allCeremonies}
                  placeholder="Select Ceremony"
                  value={selectedItem}
                  onChange={(e) => {
                    setSelectedItem(e);
                    setEventError(false);
                    setFieldError("");
                    // getBudgetData();
                    setTotalBudgetError(false);
                  }}
                  withError={eventError}
                  title={t("budget.ceremony")}
                />
              </div>
              <div className="w-3/12">
                <Input
                  type="number"
                  placeholder={t("budget.totalBudget")}
                  value={totalBudget}
                  onChange={(e) => {
                    setTotalBudget(e.target.value);
                    setTotalBudgetError(false);
                  }}
                  inputClassName="w-20"
                  labelOnTop
                  min
                  error={totalBudgetError}
                  label={t("budget.totalBudget")}
                  isRequired
                />
              </div>
            </div>

            <Button title={t("budget.addBudget")} onClick={addBudget} className="w-2/12" />
          </div>

          <div className="h-[44vh] overflow-y-auto">
            {loading ? (
              <Skeleton count={7} height={50} />
            ) : (
              <>
                {budget?.map((item, index) => (
                  <>
                    <div key={index} className="mb-5 rounded-lg border border-green-700 p-2">
                      {/* Parent Input  */}
                      {console.log({ item })}
                      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-3">
                        <Input
                          placeholder="Name"
                          inputClassName="w-20"
                          labelOnTop
                          type="text"
                          value={item.name}
                          onChange={(e) => handleInputChange(index, "name", e.target.value)}
                          error={index === index && fieldError !== "" && item.name === ""}
                        />

                        {/* <Input
                          placeholder="Credit"
                          inputClassName="w-20"
                          labelOnTop
                          type="number"
                          value={item.credit}
                          onChange={(e) => handleInputChange(index, "credit", e.target.value)}
                          error={index === index && fieldError !== "" && item.credit === ""}
                        /> */}
                        <Input
                          type="number"
                          placeholder="Debit"
                          value={item.debit}
                          onChange={(e) => handleInputChange(index, "debit", e.target.value)}
                          inputClassName="w-20"
                          labelOnTop
                          error={index === index && fieldError !== "" && item.debit === ""}
                        />

                        {/* Date & Time Picker */}
                        <Input
                          type="datetime-local"
                          placeholder="Select Date & Time"
                          value={item.date_time}
                          labelOnTop
                          onChange={(e) => handleInputChange(index, "date_time", e.target.value)}
                          error={index === index && fieldError !== "" && item.date_time === ""}
                        />

                        {/* File Upload */}
                        <ChooseFile
                          onClickCross={() => handleInputChange(index, "file_url", null)}
                          selectedFile={item.file_url}
                          loading={item.loading}
                          // accept="image/png, image/jpeg, image/jpg , .xls, .xlsx"
                          onChange={(e) => handleFileChange(index, e)}
                          uni={`fileInput-${index}`}
                          placeholder
                          style
                          noText
                        />

                        {/* <div
                          className={`mt-2 flex h-10 w-40 items-center justify-center rounded-10 ${item.credit - item.debit < 0 ? "bg-red-500" : "bg-green-500"}`}
                        >
                          <h2 className="text-white">{item.credit - item.debit}</h2>
                        </div> */}

                        {item?.budget_child?.length === 0 && (
                          <div
                            className="mt-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-secondary"
                            onClick={() => addChild(index)}
                          >
                            <img src={Images.ADDICON} alt="add icon" className="w-6" />
                          </div>
                        )}

                        {index !== 0 && (
                          <div
                            className="mt-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-red-500"
                            onClick={() => removeBudget(index)}
                          >
                            <MinusIcon className="w-6 text-white" />
                          </div>
                        )}
                      </div>
                      {/* Child Input */}
                      {item?.budget_child?.map((child, childIndex) => (
                        <div key={childIndex} className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-3 pl-10">
                          <Input
                            type="text"
                            placeholder="Child Name"
                            value={child.name}
                            onChange={(e) => handleChildInputChange(index, childIndex, "name", e.target.value)}
                            inputClassName="w-20"
                            labelOnTop
                            error={[index + 1][childIndex + 1] === [index + 1][index + 1] && fieldError !== "" && child.name === ""}
                          />
                          {/* <Input
                            type="number"
                            placeholder="Child Credit"
                            value={child.credit}
                            onChange={(e) => handleChildInputChange(index, childIndex, "credit", e.target.value)}
                            inputClassName="w-20"
                            labelOnTop
                            error={[index + 1][childIndex + 1] === [index + 1][index + 1] && fieldError !== "" && child.credit === ""}
                          /> */}
                          <Input
                            type="number"
                            placeholder="Child Debit"
                            value={child.debit}
                            onChange={(e) => handleChildInputChange(index, childIndex, "debit", e.target.value)}
                            inputClassName="w-20"
                            labelOnTop
                            error={[index + 1][childIndex + 1] === [index + 1][index + 1] && fieldError !== "" && child.debit === ""}
                          />

                          {/* Child Date & Time */}
                          <Input
                            type="datetime-local"
                            placeholder="Select Date & Time"
                            value={child.date_time}
                            onChange={(e) => handleChildInputChange(index, childIndex, "date_time", e.target.value)}
                            error={index === index && fieldError !== "" && item.date_time === ""}
                          />

                          {/* Child File Upload */}
                          <ChooseFile
                            onClickCross={() => handleChildInputChange(index, childIndex, "file_url", null)}
                            selectedFile={child.file_url}
                            oading={child.loading}
                            onChange={(e) => handleFileChange(index, e, true, childIndex)}
                            accept="image/png, image/jpeg, image/jpg , .xls, .xlsx"
                            placeholder
                            noText
                            style
                          />

                          {/* <div
                            className={`mt-1 flex h-10 w-40 items-center justify-center rounded-10 ${child.credit - child.debit < 0 ? "bg-red-500" : "bg-green-500"}`}
                          >
                            <h2 className="text-white">{child.credit - child.debit}</h2>
                          </div> */}

                          {childIndex === item?.budget_child?.length - 1 && (
                            <div
                              className="mt-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-secondary"
                              onClick={() => addChild(index)}
                            >
                              <PlusIcon className="w-6 text-white" />
                            </div>
                          )}
                          <div
                            className="mt-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-red-500"
                            onClick={() => removeChild(index, childIndex)}
                          >
                            <MinusIcon className="w-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ))}
              </>
            )}
          </div>
          {fileError && <span className="mt-5 block text-xs text-red-500"> {fileError}</span>}
          {message && <p className="mt-2 text-red-500">{message}</p>}
          <div className=" flex w-[25rem] justify-between rounded-md bg-primary px-4 py-2">
            <p>{t("budget.totalBalance")}</p>
            <p className="ml-30">{total}</p>
          </div>

          <div>
            <Button icon={btnLoading ? "" : <CheckIcon />} title={btnLoading ? <Spinner /> : t("budget.saveBudget")} onClick={handleAddBudget} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Budget;
