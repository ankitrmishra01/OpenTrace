import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        "1066171516184-vfjr7593li9t1kmppcpldv3kofano9v0.apps.googleusercontent.com"
      }
    >
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

