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
  const { t } = useTranslation("common");
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
        title={t("contacts.contactExcel")}
        firstBtnTitle={t("contacts.backToContactList")}
        firstBtnIcon={<ArrowLeftIcon />}
        firstBtnClassName="bg-red-500"
        onClickFirstBtn={() => navigate(CONTACTS)}
        firstBtnOnly
      />
      <div className="grid grid-cols-12">
        <div className="col-span-9">
          <form onSubmit={handleSubmit} className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:h-9 [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:h-9 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:h-9 [&_.css-hlgwow]:min-h-[36px] [&_.css-hlgwow]:py-0 [&_.css-hlgwow]:px- [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-none [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-none [&_.css-1wy0on6]:h-9 [&_.css-19bb58m]:my-0">
            <div className="grid grid-cols-12 items-center">
              <div className="label col-span-3">{t("contacts.selectFile")}</div>
              <div className="col-span-9">
                <ChooseFile placeholder selectedFile={file} onChange={(e) => setFile(file)} accept=".xls/*|.xlsx/*" />
              </div>
            </div>

            <Dropdown
              title={t("contacts.columnHeadersIncluded")}
              placeholder={t("contacts.select")}
              value={headerInclude}
              onChange={(e) => {
                setHeaderInclude(e);
              }}
            />

            <Input
              type="number"
              text={t("contacts.numberGreaterThanZero")}
              label={t("contacts.headerRowNumber")}
              value={headerRowNo}
              onChange={(e) => setHeaderRowNo(e.target.value)}
            />

            <Input
              type="number"
              label={t("contacts.dataStartsAtRow")}
              text={t("contacts.greaterThanHeaderRow")}
              value={dataStartRow}
              onChange={(e) => setDataStartRow(e.target.value)}
            />

            <Dropdown
              title={t("contacts.groupUnder")}
              placeholder={t("contacts.selectOrEnterGroup")}
              value={groupUnder}
              onChange={(e) => {
                setGroupUnder(e);
              }}
            />
            <div className="grid grid-cols-12 items-center">
              <div className="label col-span-3">{t("contacts.duplicateContact")}</div>
              <div className="col-span-9">
                <RadioInput
                  name="duplicate contact"
                  options={[
                    {
                      id: "Merge contacts, keep original data",
                      value: "Merge contacts, keep original data",
                      label: t("contacts.mergeKeepOriginal"),
                    },
                    { id: "Merge contacts, keep new data", value: "Merge contacts, keep new data", label: t("contacts.mergeKeepNew") },
                    { id: "Create new contact", value: "Create new contact", label: t("contacts.createNewContact") },
                  ]}
                  value={duplicateContact}
                  onChange={(e) => {
                    setDuplicateContact(e);
                  }}
                />
              </div>
            </div>

            <div className="!mt-8 flex justify-end">
              <Button icon={<CheckIcon />} title={t("contacts.mapData")} className="me-4" />
              <Button icon={<XMarkIcon />} title={t("buttons.cancel")} className="bg-red-500" onClick={() => navigate(CONTACTS)} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ImportContact;
