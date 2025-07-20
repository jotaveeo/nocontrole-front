import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { setupGlobalErrorHandler, filterConsoleErrors } from "./utils/errorHandler";
import "./utils/debugControl"; // Sistema de debug controlado
import "./utils/cleanTokens"; // Limpeza de tokens inválidos
// import "./utils/apiDebug"; // Desabilitado temporariamente
// import "./utils/tokenChecker"; // Desabilitado temporariamente
// import "./utils/debugToken"; // Desabilitado temporariamente
// import "./utils/testApiRequest"; // Desabilitado temporariamente
// import "./utils/validateToken"; // Desabilitado temporariamente
// import "./utils/testLogin"; // Desabilitado temporariamente
// import "./utils/finalTest"; // Desabilitado temporariamente

// Configurar filtros de erro para reduzir ruído no console
setupGlobalErrorHandler();
filterConsoleErrors();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
