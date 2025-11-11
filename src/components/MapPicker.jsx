import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import Input from "../components/common/Input";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 31.5204,
  lng: 74.3587,
};

const MapPicker = ({ setLocation , onLocationSelect, location, venueAddressError , label , placeholder }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [visibleAddress, setVisibleAddress] = useState(""); // For visible input
  const [hiddenAddress, setHiddenAddress] = useState(""); // For hidden input
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDnf3ISxKtpcBw12BJfX6zOFmFdrc-nA5U",  // Replace with your API key
    libraries: ["places"], // Ensure places library is loaded
  });

  useEffect(() => {
    if (location?.lat && location?.lng) {
      setMarkerPosition({ lat: location.lat, lng: location.lng });
      setVisibleAddress(location.address || "");
      setHiddenAddress(location.address || "");
    }
  }, [location]);

  const updateAddress = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        setVisibleAddress(address);
        setHiddenAddress(address);
        onLocationSelect({ lat, lng, address });
      } else {
        const fallbackAddress = "Address not found";
        setVisibleAddress(fallbackAddress);
        setHiddenAddress(fallbackAddress);
        onLocationSelect({ lat, lng, address: fallbackAddress });
      }
    });
  };

  const onMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      updateAddress(lat, lng);
    },
    [onLocationSelect]
  );

  const onMarkerDragEnd = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      updateAddress(lat, lng);
    },
    [onLocationSelect]
  );

  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;

        setMarkerPosition({ lat, lng });
        setVisibleAddress(address);
        setHiddenAddress(address);

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
        }

        onLocationSelect({ lat, lng, address });
      }
    }
  }, [autocomplete, onLocationSelect]);

  const mapCenter = markerPosition || defaultCenter;

  return isLoaded ? (
    <div style={{ position: "relative" }}>
      <div className="mb-3">
        {/* Visible Input Field */}
        <Autocomplete onLoad={(autoC) => setAutocomplete(autoC)} onPlaceChanged={onPlaceChanged}>
          <Input
            isRequired
            labelOnTop
            error={venueAddressError}
            label={label}
            placeholder={placeholder}
            value={visibleAddress}
            onChange={(e) => {
              setVisibleAddress(e.target.value);
              setHiddenAddress(e.target.value); 
              if(e.target.value === ""){
                setLocation( {address:"" , lat:"" , lng: ""})
              }
            }}
          />
        </Autocomplete>

        {/* Hidden Input Field */}
        <input
          type="hidden"
          name="venueAddress"
          value={hiddenAddress}
          readOnly 
        />
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={20}
        onClick={onMapClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        )}
      </GoogleMap>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default MapPicker;




