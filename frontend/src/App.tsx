import { Outlet, Route, Routes } from "react-router-dom";
import Header from "./components/Header";

import CatalogPage from "./pages/CatalogPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import ProjectPage from "./pages/ProjectPage";
import CabinetPage from "./pages/CabinetPage";

import "./App.css";

function AppLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function NotFoundPage() {
  return (
    <section>
      <h1>Страница не найдена</h1>
    </section>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CatalogPage />} />
        <Route path="projects/:id" element={<ProjectPage />} />
        <Route path="organizations" element={<OrganizationsPage />} />
        <Route path="cabinet" element={<CabinetPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
