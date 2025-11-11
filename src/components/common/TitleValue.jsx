import React from "react";

const TitleValue = ({ title, value, image, url }) => {
  return (
    <div className="space-y-1">
      <h3 className="text-xs text-info-color">{title}</h3>
      {image && (
        <div className="w-32 h-36">
          <img src={image} alt="image" className="object-contain w-full h-full rounded-10" />
        </div>
      )}

      {url ? (
        <a 
        href={url} 
        className="text-sm font-medium flex flex-wrap text-blue-500 hover:underline" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {value}
      </a>
      
      ) : (
        <h2 className="text-sm font-medium flex flex-wrap text-secondary-color">{value}</h2>
      )}
    </div>
  );
};

export default TitleValue;
