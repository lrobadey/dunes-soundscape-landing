import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { MotionProvider } from "@/motion/config/MotionProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <MotionProvider>
    <App />
  </MotionProvider>,
);
