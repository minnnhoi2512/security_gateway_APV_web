import { Route, Routes } from "react-router-dom";
import LayoutPage from "../pages/Layout";
import Dashboard from "../pages/Dashboard";
import CustomerVisit from "../pages/CustomerVisit";
import DetailCustomerVisit from "../pages/DetailCustomerVisit";
import Project from "../pages/Project";
import Manager from "../pages/Manager";
import DetailProject from "../pages/DetailProject";
import HistoryDetail from "../pages/HistoryDetail";
import History from "../pages/History";
import Chat from "../pages/Chat";
import Login from "../pages/Login";
import CalendarPage from "../pages/Calendar";
import Security from "../pages/Security";
import DepartmentManager from "../pages/DepartManager";
import DetailUser from "../pages/DetailUser";
import CreateUser from "../pages/CreateUser";
import CreateNewVisitList from "../pages/CreateNewVisitList";
// import CreateNewGuest from "../pages/CreateNewGuest";
import CardManager from "../pages/CardManager";
import GateManager from "../pages/GateManager";

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
        path="/manager"
        element={
          <LayoutPage>
            <Manager />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/departmentManager"
        element={
          <LayoutPage>
            <DepartmentManager />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/security"
        element={
          <LayoutPage>
            <Security />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/detailUser"
        element={
          <LayoutPage>
            <DetailUser />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/createUser"
        element={
          <LayoutPage>
            <CreateUser />
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
        path="/createNewVisitList"
        element={
          <LayoutPage>
            <CreateNewVisitList />
          </LayoutPage>
        }
      />
      {/* <Route
        index
        path="/createNewGuest"
        element={
          <LayoutPage>
            <CreateNewGuest />
          </LayoutPage>
        }
      /> */}
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
        path="/project"
        element={
          <LayoutPage>
            <Project />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/card"
        element={
          <LayoutPage>
            <CardManager />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/gate"
        element={
          <LayoutPage>
            <GateManager />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/detailProject"
        element={
          <LayoutPage>
            <DetailProject />
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
        path="/historyDetail"
        element={
          <LayoutPage>
            <HistoryDetail />
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
