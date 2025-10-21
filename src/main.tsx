import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import notification scheduler to start it
import "./utils/notificationScheduler";

createRoot(document.getElementById("root")!).render(<App />);
