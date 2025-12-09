import "./index.css";
import React from "react";
import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import "./i18n.js";
import { BrowserRouter } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ThemeContextProvider } from "./context/GlobalContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  //  <React.StrictMode>
  // <BrowserRouter basename="/plannedforever-customer">
   <BrowserRouter>
    <ThemeContextProvider>
      <App />
    </ThemeContextProvider>
  </BrowserRouter>,
   {/* </React.StrictMode>, */}
);
