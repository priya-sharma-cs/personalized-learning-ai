
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Analytics from "./pages/Analytics";
import RiskAlerts from "./pages/RiskAlerts";
import Settings from "./pages/Settings";

/* Protected Route */
function PrivateRoute({ children }) {

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  return isLoggedIn ? children : <Navigate to="/login" replace />;

}

function App() {

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  return (

    <BrowserRouter>

      <Routes>

        {/* Default Route */}
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Pages */}

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/students"
          element={
            <PrivateRoute>
              <Students />
            </PrivateRoute>
          }
        />

        <Route
          path="/student/:id"
          element={
            <PrivateRoute>
              <StudentDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <PrivateRoute>
              <RiskAlerts />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;



