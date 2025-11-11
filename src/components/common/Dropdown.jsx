import ReactSelect from "react-select";
import { components } from "react-select"; // Import components to customize options

const Dropdown = ({
  options = [],
  title = "",
  placeholder = "",
  defaultValue = null,
  value = null,
  onChange = () => {},
  backgroundColor = "",
  isRequired = false,
  tabIndex,
  isMulti = false,
  optionLabel,
  withError,
  selectClasses,
  withoutTitle,
  isSearchable = false,
  labelClasses,
  option,
  disabled = false,
  invisible,
  noMargin,
  Delete,
  setOpenDeleteModal,
  setOpenDeleteModalFamily,
}) => {
  const handleDelete = (selectedValue) => {
    setOpenDeleteModal({ open: true, data: selectedValue?.value });
    setOpenDeleteModalFamily({ open: true, data: selectedValue?.value });
  };

  const formatOptionLabel = (data, { context }) => {
    // Show only name when displaying the selected option
    if (context === "value") {
      return <span>{data.label}</span>;
    }

    // Show name and delete icon in the dropdown menu
    return (
      <div className="flex justify-between items-center">
        <span>{data.label}</span>
        {Delete && data.label !== "Add New Group" && data.label !== "Add New Family" && data.label !== "Add New Color Code" && (
          <span
            onClick={(e) => {
              e.stopPropagation(); // Prevent select option from being triggered
              handleDelete(data);
            }}
            style={{ marginLeft: 8, cursor: "pointer", color: "red" }}
            role="button" // Adding role to improve accessibility
            tabIndex={0} // Allows keyboard accessibility for the delete icon
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDelete(data);
              }
            }}
          >
            &#10005; {/* Cross mark as delete icon */}
          </span>
        )}
      </div>
    );
  };

  const commonProps = {
    styles: {
      placeholder: (defaultStyles) => ({
        ...defaultStyles,
        color: "#C5C5C5",
        fontWeight: "300",
        fontSize: "15px",
      }),
      control: (defaultStyles, state) => ({
        ...defaultStyles,
        boxShadow: state.isFocused ? "0 0 0 2px black" : defaultStyles.boxShadow,
        borderRadius: "10px",
        borderColor: state.isFocused || state.isHovered ? "none" : withError ? "#dc2626" : "rgb(209 213 219)",
        border: state.isFocused || state.isHovered ? "none" : defaultStyles.border,
        minHeight: "44px",
      }),
      menu: (defaultStyles) => ({
        ...defaultStyles,
        zIndex: "9999999",
      }),
    },
    value,
    options: options?.length ? options : [],
    defaultValue,
    onChange,
    placeholder,
    name: title,
    tabIndex,
    formatOptionLabel: formatOptionLabel, // Custom label with delete icon in dropdown only
    menuPlacement: "auto",
    isMulti,
    isSearchable:true,
    option,
    isDisabled: disabled,
  };

  return (
    <div className="ltr:text-left rtl:text-right">
      {!withoutTitle ? (
        <label className={`${labelClasses} label ${invisible ? "hidden" : ""}`}>
          {title}
          {isRequired && <span className="text-red-500">*</span>}
          {withError && <span className="text-xs text-red-500"> {withError}</span>}
        </label>
      ) : (
        ""
      )}
      <div className={`${noMargin ? "":"mt-2"}`}>
        <ReactSelect {...commonProps} />
      </div>
    </div>
  );
};

export default Dropdown;
