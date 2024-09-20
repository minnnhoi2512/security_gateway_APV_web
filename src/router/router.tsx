import { Route, Routes } from "react-router-dom";
import LayoutPage from "../pages/Layout";
import Dashboard from "../pages/Dashboard";
import CustomerVisit from "../pages/CustomerVisit";
import CustomerVisitSecurity from "../pages/CustomerVisitSecurity";
import CustomerVisitStaff from "../pages/CustomerVisitStaff";
import DetailCustomerVisit from "../pages/DetailCustomerVisit";
import CustomerVisitDP from "../pages/CustomerVisitDP";
import NewCustomerVisit from "../pages/NewCustomerVisit";
import ProjectManager from "../pages/ProjectManager";
import History from "../pages/History";
import Chat from "../pages/Chat";
import Login from "../pages/Login";
import CalendarPage from "../pages/Calendar";

const ContentRouter = () => {
  return (
    <Routes>
      <Route
        index
        path="/dashboard"
        element={
          <LayoutPage>
            <Dashboard />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/customerVisit"
        element={
          <LayoutPage>
            <CustomerVisit />
          </LayoutPage>
        }
      />
       <Route
        index
        path="/detailVisit"
        element={
          <LayoutPage>
            <DetailCustomerVisit />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/securityCustomerVisit"
        element={
          <LayoutPage>
            <CustomerVisitSecurity />
          </LayoutPage>
        }

      />
          <Route
        index
        path="/DPCustomerVisit"
        element={
          <LayoutPage>
            <CustomerVisitDP />
          </LayoutPage>
        }

      />
      <Route
        index
        path="/ProjectManager"
        element={
          <LayoutPage>
            <ProjectManager />
          </LayoutPage>
        }

      />
      <Route
      index
      path="/staffCustomerVisit"
      element={
        <LayoutPage>
          <CustomerVisitStaff />
        </LayoutPage>
      }
    />
      <Route
        index
        path="/newCustomerVisit"
        element={
          <LayoutPage>
            <NewCustomerVisit />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/calendar"
        element={
          <LayoutPage>
            <CalendarPage />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/history"
        element={
          <LayoutPage>
            <History />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/chat"
        element={
          <LayoutPage>
            <Chat />
          </LayoutPage>
        }
      />
      <Route index path="/" element={<Login />} />
    </Routes>
  );
};

export default ContentRouter;
