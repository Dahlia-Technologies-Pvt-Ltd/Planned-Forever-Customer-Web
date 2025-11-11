import React, { useState } from "react";
import Input from "../../components/common/Input";
import { PlusCircleIcon, MinusCircleIcon, PencilIcon } from "@heroicons/react/24/solid";
import Dropdown from "../../components/common/Dropdown";
import Button from "../../components/common/Button";
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CONTACTS, SAMAGRI } from "../../routes/Names";
import GlobalHeader from "../../components/common/GlobalHeader";
import { useNavigate } from "react-router-dom";
import ChooseFile from "../../components/common/ChooseFile";
import RadioInput from "../../components/common/RadioInput";
import { useTranslation } from "react-i18next";


const ImportContact = () => {
  // Use States

  const [headerInclude, setHeaderInclude] = useState("");
  const [headerRowNo, setHeaderRowNo] = useState("");
  const [dataStartRow, setDataStartRow] = useState("");
  const [groupUnder, setGroupUnder] = useState("");
  const [duplicateContact, setDuplicateContact] = useState("");
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <GlobalHeader
        title="Import Contacts From Excel"
        firstBtnTitle="Back to Contact list"
        firstBtnIcon={<ArrowLeftIcon />}
        firstBtnClassName="bg-red-500"
        onClickFirstBtn={() => navigate(CONTACTS)}
        firstBtnOnly
      />
      <div className="grid grid-cols-12">
        <div className="col-span-9">
          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <div className="grid grid-cols-12 items-center">
              <div className="label col-span-3">Select file (.xls or .xlsx)</div>
              <div className="col-span-9">
                <ChooseFile placeholder selectedFile={file} onChange={(e) => setFile(file)} accept=".xls/*|.xlsx/*" />
              </div>
            </div>

            <Dropdown
              title="Column Headers Included"
              placeholder="-- Select --"
              value={headerInclude}
              onChange={(e) => {
                setHeaderInclude(e);
              }}
            />

            <Input
              type="number"
              text="Should be a number greater than 0."
              label="Header row number"
              value={headerRowNo}
              onChange={(e) => setHeaderRowNo(e.target.value)}
            />

            <Input
              type="number"
              label="Data starts at row"
              text="Should be a number greater than the header row number."
              value={dataStartRow}
              onChange={(e) => setDataStartRow(e.target.value)}
            />

            <Dropdown
              title="Group Under"
              placeholder="Select or enter group"
              value={groupUnder}
              onChange={(e) => {
                setGroupUnder(e);
              }}
            />
            <div className="grid grid-cols-12 items-center">
              <div className="label col-span-3">Duplicate Contact</div>
              <div className="col-span-9">
                <RadioInput
                  name="duplicate contact"
                  options={[
                    {
                      id: "Merge contacts, keep original data",
                      value: "Merge contacts, keep original data",
                      label: "Merge contacts, keep original data",
                    },
                    { id: "Merge contacts, keep new data", value: "Merge contacts, keep new data", label: "Merge contacts, keep new data" },
                    { id: "Create new contact", value: "Create new contact", label: "Create new contact" },
                  ]}
                  value={duplicateContact}
                  onChange={(e) => {
                    setDuplicateContact(e);
                  }}
                />
              </div>
            </div>

            <div className="!mt-8 flex justify-end">
              <Button icon={<CheckIcon />} title="Map Data" className="me-4" />
              <Button icon={<XMarkIcon />} title="Cancle" className="bg-red-500" onClick={() => navigate(CONTACTS)} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ImportContact;
