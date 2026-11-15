import { BrowserRouter, Route, Routes } from "react-router";
import { FeaturesProvider } from "./lib/features";
import { ThemeProvider } from "./lib/theme";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoadingPage from "./pages/LoadingPage";
import NatalFormPage from "./pages/NatalFormPage";
import OpenedFeaturePage from "./pages/OpenedFeaturePage";
import ReadingPage from "./pages/ReadingPage";

export default function App() {
  return (
    <ThemeProvider>
      <FeaturesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cuenta" element={<AccountPage />} />
            <Route path="/carta-natal" element={<NatalFormPage />} />
            <Route path="/carga" element={<LoadingPage />} />
            <Route path="/lectura" element={<ReadingPage />} />
            <Route path="/abrir/:featureId" element={<OpenedFeaturePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </FeaturesProvider>
    </ThemeProvider>
  );
}
