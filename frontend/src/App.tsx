import { Outlet, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import CatalogPage from "./pages/CatalogPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import OrganizationPage from "./pages/OrganizationPage";
import ProjectPage from "./pages/ProjectPage";
import CabinetPage from "./pages/CabinetPage";

function AppLayout() {
  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900">
      <Header />
      <main className="mx-auto max-w-[1560px] px-6 py-16 max-lg:px-5 max-lg:py-14">
        <Outlet />
      </main>
    </div>
  );
}

function NotFoundPage() {
  return (
    <section>
      <h1 className="text-4xl font-black tracking-tight">
        Страница не найдена
      </h1>
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
        <Route path="organizations/:id" element={<OrganizationPage />} />
        <Route path="cabinet" element={<CabinetPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
