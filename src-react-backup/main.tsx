import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { LanguageProvider } from "./app/context/LanguageContext";
import { ThemeProvider } from "./app/context/ThemeContext";
import { MediaProvider } from "./app/context/MediaContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <ThemeProvider>
      <MediaProvider>
        <App />
      </MediaProvider>
    </ThemeProvider>
  </LanguageProvider>
);