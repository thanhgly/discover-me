import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.tsx";
import { profile } from "./lib/profile";

document.title = `${profile.firstName} ${profile.lastName} · ${profile.title}`;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
