const GET_CONTACT_DETAILS = "/get-contact-details";
const CONTACT_DETAILS_VIEW = "/contact-details-view";

import React, { useEffect } from "react";
import Auth from "./layout/Auth";
import Dashboard from "./layout/Dashboard";
import PublicRoutes from "./routes/Public";
import PrivateRoutes from "./routes/Private";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { publicRoutes, protectedRoutes } from "./routes";
import "react-quill/dist/quill.snow.css";
import { useThemeContext } from "./context/GlobalContext";
import { useTranslation } from "react-i18next";
import { GET_INVITATION_CARD_VIEW, INVITATION_CARD_VIEW, LOGIN } from "./routes/Names";
import InvitationCardView from "./pages/InvitationCardView";
import GetInvitationCardView from "./pages/GetInvitationCardView";
import ContactDetailView from "./pages/ContactDetailView";
import GetContactDetails from "./pages/GetContactDetails";

function App() {
  const { userData } = useThemeContext();
  const { i18n } = useTranslation();
  const location = useLocation();
  
  useEffect(() => {
    // Get saved language
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
    // Update direction
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
    localStorage.setItem("language-direction", i18n.dir());
  }, [i18n.language]);
  
  const filteredRoutes = protectedRoutes?.filter((route) => {
    if (userData?.role === "superAdmin") {
      return true;
    } else if (userData?.role?.permissions) {
      return userData?.role?.permissions?.includes(route?.label);
    }
    return false;
  });
  
  // Function to check if the current path is an invitation card route
  const isInvitationCardRoute = () => {
    const path = location.pathname;
    return path.includes('get-invitation-card') || path.includes('invitation-card-view');
  };
  
  // Function to check if the current path is a contact details route
  const isContactDetailsRoute = () => {
    const path = location.pathname;
    return path.includes('get-contact-details') || path.includes('contact-details-view');
  };
  
  // Function to check if the current path is any public route
  const isPublicRoute = () => {
    return isInvitationCardRoute() || isContactDetailsRoute();
  };
  
  return (
    <>
      <Routes>
        {/* IMPORTANT: Always place these fully public routes FIRST */}
        <Route path={GET_INVITATION_CARD_VIEW} element={<GetInvitationCardView />} />
        <Route path={INVITATION_CARD_VIEW} element={<InvitationCardView />} />
        <Route path={GET_CONTACT_DETAILS} element={<GetContactDetails />} />
        <Route path={CONTACT_DETAILS_VIEW} element={<ContactDetailView />} />
        
        {/* Handle base domain with invitation card paths */}
        <Route path="/get-invitation-card/*" element={<GetInvitationCardView />} />
        <Route path="/invitation-card-view/*" element={<InvitationCardView />} />
        
        {/* Handle base domain with contact details paths */}
        <Route path="/get-contact-details/*" element={<GetContactDetails />} />
        <Route path="/contact-details-view/*" element={<ContactDetailView />} />
        
        {/* Authentication-related routes */}
        <Route element={<PublicRoutes />}>
          <Route element={<Auth />}>
            {publicRoutes.map((route) => (
              <Route key={route.id} path={route.path} element={<route.screen />} />
            ))}
          </Route>
        </Route>
        
        {/* Protected routes requiring login */}
        <Route element={<PrivateRoutes />}>
          <Route element={<Dashboard />}>
            {protectedRoutes.map((route) => (
              <Route key={route.id} path={route.path} element={<route.screen />} />
            ))}
          </Route>
        </Route>
        
        {/* Catch-all route - don't redirect public routes */}
        <Route path="*" element={
          isPublicRoute() ? 
            (isInvitationCardRoute() ? 
              (location.pathname.includes('get-invitation-card') ? 
                <GetInvitationCardView /> : 
                <InvitationCardView />) :
              (location.pathname.includes('get-contact-details') ? 
                <GetContactDetails /> : 
                <ContactDetailView />)
            ) : 
            <Navigate to={LOGIN} replace />
        } />
      </Routes>
    </>
  );
}

export default App;