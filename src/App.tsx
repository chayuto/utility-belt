import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./layout/DashboardLayout";
import { HomePage } from "./pages/HomePage";
import { Loading } from "./components/Loading";
import { toolsRegistry } from "./config/tools-registry";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          {toolsRegistry.map((tool) => (
            <Route
              key={tool.slug}
              path={`tools/${tool.slug}`}
              element={
                <Suspense fallback={<Loading />}>
                  <tool.component />
                </Suspense>
              }
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
