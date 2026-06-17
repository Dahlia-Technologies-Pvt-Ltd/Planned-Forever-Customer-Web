import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import Input from "./common/Input";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 31.5204,
  lng: 74.3587,
};

const getAddressComponent = (components = [], type) =>
  components.find((component) => component.types?.includes(type))?.long_name || "";

const buildLocationData = (place) => {
  const components = place?.address_components || [];
  const postalCode = getAddressComponent(components, "postal_code");
  const country = getAddressComponent(components, "country");
  const address2 =
    getAddressComponent(components, "sublocality_level_1") ||
    getAddressComponent(components, "sublocality") ||
    getAddressComponent(components, "neighborhood");
  const city =
    getAddressComponent(components, "locality") ||
    getAddressComponent(components, "administrative_area_level_2");
  const state = getAddressComponent(components, "administrative_area_level_1");
  const address1 = String(place?.formatted_address || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (postalCode ? part.replace(postalCode, "").trim() : part))
    .filter((part) => part && part !== country)
    .join(", ");

  return {
    address: place?.formatted_address || "",
    address1,
    address2,
    city,
    state,
    country,
    postalCode,
  };
};

const MapPickervenue = ({ setLocation, onLocationSelect, location, venueAddressError, label, placeholder, autoResolveAddress = false }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [visibleAddress, setVisibleAddress] = useState(""); // For visible input
  const [hiddenAddress, setHiddenAddress] = useState(""); // For hidden input
  const mapRef = useRef(null);
  const resolvedLocationKeyRef = useRef("");
  const GOOGLE_MAP_KEY = "AIzaSyDnf3ISxKtpcBw12BJfX6zOFmFdrc-nA5U";
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script-view-venue",
    googleMapsApiKey: "AIzaSyDnf3ISxKtpcBw12BJfX6zOFmFdrc-nA5U",  // Replace with your API key
    libraries: ["places"], // Ensure places library is loaded
  });

  useEffect(() => {
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    const address = location?.displayAddress || location?.address || "";

    setVisibleAddress(address);
    setHiddenAddress(address);

    if (location?.lat !== "" && location?.lat != null && location?.lng !== "" && location?.lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      setMarkerPosition({ lat, lng });
    } else {
      setMarkerPosition(null);
    }
  }, [location]);

  useEffect(() => {
    if (!isLoaded || !autoResolveAddress || !location?.address || !window.google?.maps) return;

    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    const hasCoordinates =
      location?.lat !== "" &&
      location?.lat != null &&
      location?.lng !== "" &&
      location?.lng != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng);
    const locationKey = `${location.address}|${hasCoordinates ? `${lat},${lng}` : ""}`;

    if (resolvedLocationKeyRef.current === locationKey) return;
    resolvedLocationKeyRef.current = locationKey;

    const geocoder = new window.google.maps.Geocoder();
    const request = hasCoordinates ? { location: { lat, lng } } : { address: location.address };

    geocoder.geocode(request, async (results, status) => {
      if (status !== "OK" || !results?.[0]) return;

      const result = results[0];
      const resolvedLat = result.geometry.location.lat();
      const resolvedLng = result.geometry.location.lng();
      const locationData = {
        ...buildLocationData(result),
        lat: resolvedLat,
        lng: resolvedLng,
      };

      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/timezone/json?location=${resolvedLat},${resolvedLng}&timestamp=${timestamp}&key=${GOOGLE_MAP_KEY}`
        );
        const timezoneData = await response.json();

        if (timezoneData?.timeZoneId) {
          locationData.timeZone = {
            value: timezoneData.timeZoneId,
            label: timezoneData.timeZoneName,
          };
        }
      } catch (error) {
        console.error("Unable to resolve venue time zone", error);
      }

      const resolvedKey = `${locationData.address}|${resolvedLat},${resolvedLng}`;
      resolvedLocationKeyRef.current = resolvedKey;
      setMarkerPosition({ lat: resolvedLat, lng: resolvedLng });
      setVisibleAddress(locationData.address1 || locationData.address);
      setHiddenAddress(locationData.address);
      onLocationSelect?.(locationData);
    });
  }, [autoResolveAddress, isLoaded, location, onLocationSelect]);

  const updateAddress = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        setVisibleAddress(address);
        setHiddenAddress(address);
        onLocationSelect?.({ lat, lng, address });
      } else {
        const fallbackAddress = "Address not found";
        setVisibleAddress(fallbackAddress);
        setHiddenAddress(fallbackAddress);
        onLocationSelect?.({ lat, lng, address: fallbackAddress });
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

  // const onPlaceChanged = useCallback(() => {
  //   if (autocomplete !== null) {
  //     const place = autocomplete.getPlace();
  //     if (place.geometry) {
  //       const lat = place.geometry.location.lat();
  //       const lng = place.geometry.location.lng();
  //       const address = place.formatted_address;

  //       setMarkerPosition({ lat, lng });
  //       setVisibleAddress(address);
  //       setHiddenAddress(address);

  //       if (mapRef.current) {
  //         mapRef.current.panTo({ lat, lng });
  //       }

  //       onLocationSelect?.({ lat, lng, address });
  //     }
  //   }
  // }, [autocomplete, onLocationSelect]);
  const onPlaceChanged = useCallback(async () => {
  if (!autocomplete) return;

  const place = autocomplete.getPlace();

  if (!place?.geometry) return;

  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();

  const locationData = {
    ...buildLocationData(place),
    lat,
    lng,
  };

  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_MAP_KEY}`
    );

    const timezoneData = await response.json();

    locationData.timeZone = {
      value: timezoneData.timeZoneId,
      label: timezoneData.timeZoneName,
    };
  } catch (err) {
    console.error(err);
  }

  setMarkerPosition({ lat, lng });
  setVisibleAddress(place.formatted_address);
  setHiddenAddress(place.formatted_address);

  if (mapRef.current) {
    mapRef.current.panTo({ lat, lng });
  }

  onLocationSelect?.(locationData);
}, [autocomplete, onLocationSelect]);

  const mapCenter =
  typeof markerPosition?.lat === "number" &&
  typeof markerPosition?.lng === "number"
    ? markerPosition
    : defaultCenter;

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
      {/* <GoogleMap
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
      </GoogleMap> */}
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default MapPickervenue;



