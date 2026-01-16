import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/globals.css";

// MSW disabled - now using real backend API
// async function enableMocking() {
//   if (import.meta.env.DEV) {
//     const { worker } = await import("./mocks/browser.js");
//     return worker.start({
//       onUnhandledRequest: "bypass",
//     });
//   }
// }

// enableMocking().then(() => {
//   createRoot(document.getElementById("root")).render(
//     <StrictMode>
//       <App />
//     </StrictMode>
//   );
// });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
