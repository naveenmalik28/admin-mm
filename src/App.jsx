import { BrowserRouter, Route, Routes } from "react-router-dom"

import Header from "./components/layout/Header.jsx"
import Sidebar from "./components/layout/Sidebar.jsx"
import ProtectedRoute from "./routes/ProtectedRoute.jsx"
import ArticleFormPage from "./pages/ArticleFormPage.jsx"
import ArticlesPage from "./pages/ArticlesPage.jsx"
import CommentsPage from "./pages/CommentsPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import OverviewPage from "./pages/OverviewPage.jsx"
import RevenuePage from "./pages/RevenuePage.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"
import UsersPage from "./pages/UsersPage.jsx"

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream text-slatex">
      <Header />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <main>{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <OverviewPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UsersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ArticlesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ArticleFormPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ArticleFormPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/comments"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <CommentsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/revenue"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <RevenuePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SettingsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
