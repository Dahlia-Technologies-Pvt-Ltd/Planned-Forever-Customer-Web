import { ArrowLeftIcon, ArrowUpCircleIcon, PlusCircleIcon, PrinterIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import Dropdown from "./Dropdown";

const GlobalHeader = ({
  title,
  count,
  firstBtnOnly,
  firstBtnIcon,
  firstBtnTitle,
  firstBtnClassName,
  onClickFirstBtn,
  secondBtnIcon,
  secondBtnTitle,
  secondBtnClassName,
  onClickSecondBtn,

  withMiddleButton,
  middleBtnIcon,
  middleBtnTitle,
  middleBtnClassName,
  onClickMiddleBtn,

  onlydropdown,
  dropdownOptions,
  dropdownPlaceholder,

  withoutBtns,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="">
          <h2 className="heading">
            {title} {count && `(${count})`}
          </h2>
        </div>
        {!withoutBtns && (
          <div className="flex">
            {onlydropdown ? (
              <Dropdown placeholder={dropdownPlaceholder} withoutTitle options={dropdownOptions} />
            ) : firstBtnOnly ? (
              <Button
                icon={firstBtnIcon ? firstBtnIcon : <PlusCircleIcon />}
                title={firstBtnTitle}
                className={firstBtnClassName}
                onClick={onClickFirstBtn}
              />
            ) : (
              <>
                <Button
                  icon={firstBtnIcon ? firstBtnIcon : <PlusCircleIcon />}
                  title={firstBtnTitle}
                  className={firstBtnClassName}
                  onClick={onClickFirstBtn}
                />
                {withMiddleButton && (
                  <Button
                    icon={middleBtnIcon ? middleBtnIcon : <ArrowUpCircleIcon />}
                    title={middleBtnTitle}
                    className={middleBtnClassName}
                    onClick={onClickMiddleBtn}
                  />
                )}
                <Button
                  icon={secondBtnIcon ? secondBtnIcon : <PrinterIcon />}
                  title={secondBtnTitle}
                  className={secondBtnClassName}
                  onClick={onClickSecondBtn}
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalHeader;
