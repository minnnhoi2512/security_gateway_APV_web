import { Route, Routes } from "react-router-dom";
import LayoutPage from "../pages/Layout";
import Dashboard from "../pages/Dashboard";
import CustomerVisit from "../pages/CustomerVisit";
import DetailCustomerVisit from "../pages/DetailCustomerVisit";
import Schedule from "../pages/Schedule";
import Manager from "../pages/Manager";
import DetailProject from "../pages/DetailProject";
import HistoryDetail from "../pages/HistoryDetail";
import History from "../pages/History";
import Chat from "../pages/Chat";
import Login from "../pages/Login";
import CalendarPage from "../pages/Calendar";
import Security from "../pages/Security";
import DepartManager from "../pages/DepartManager";
import DepartmentManager from "../pages/DepartmentManager";
import DetailUser from "../pages/DetailUser";
import CreateUser from "../pages/CreateUser";
import CreateNewVisitList from "../pages/CreateNewVisitList";
import CardManager from "../pages/CardManager";
import CreateQRCard from "../pages/CreateQRCard";
import GateManager from "../pages/GateManager";
import Notification from "../pages/NotificationTest";
import Staff from "../pages/Staff";
import ChatRoom from "../pages/ChatRoom";
import VisitorManager from "../pages/VisitorManager";
import CreateNewSchedule from "../pages/CreateNewSchedule";
import DetailSchedule from "../pages/DetailSchedule";


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
        path="/departManager"
        element={
          <LayoutPage>
            <DepartManager />
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
        path="/staff"
        element={
          <LayoutPage>
            <Staff />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/detailUser/:id"
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
        path="/customerVisit/"
        element={
          <LayoutPage>
            <CustomerVisit />
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
        path="/visitorManager"
        element={
          <LayoutPage>
            <VisitorManager />
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
        path="/detailVisit/:id"
        element={
          <LayoutPage>
            <DetailCustomerVisit />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/notification-test"
        element={
          <LayoutPage>
            <Notification />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/schedule"
        element={
          <LayoutPage>
            <Schedule />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/detailSchedule/:id"
        element={
          <LayoutPage>
            <DetailSchedule  />
          </LayoutPage>
        }
      />
       <Route
        index
        path="/createNewSchedule"
        element={
          <LayoutPage>
            <CreateNewSchedule />
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
        path="/createCard"
        element={
          <LayoutPage>
            <CreateQRCard />
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
      <Route
        index
        path="/chat/:id"
        element={
          <LayoutPage>
            <ChatRoom />
          </LayoutPage>
        }
      />
      <Route index path="/" element={<Login />} />
    </Routes>
  );
};

export default ContentRouter;
