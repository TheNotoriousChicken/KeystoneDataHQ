import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Overview from "./pages/Overview";
import Revenue from "./pages/Revenue";
import Clients from "./pages/Clients";
import Consultants from "./pages/Consultants";
import Forecast from "./pages/Forecast";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="clients" element={<Clients />} />
          <Route path="consultants" element={<Consultants />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
