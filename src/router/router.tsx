import { Route, Routes } from "react-router-dom";
import LayoutPage from "../pages/Layout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import SignalR from '../utils/signalR';
import UserConnectionHubType from "../types/userConnectionHubType";
import Manager from "../pages/User/Manager";
import DepartManager from "../pages/Facility/DepartManager";
import DepartmentManager from "../pages/User/DepartmentManager";
import Security from "../pages/User/Security";
import ScheduleStaff from "../pages/Schedule/ScheduleStaff";
import ScheduleAssignedManager from "../pages/Schedule/ScheduleAssigned";
import DetailScheduleStaff from "../pages/Schedule/DetailScheduleStaff";
import DetailUser from "../pages/User/DetailUser";
import CreateUser from "../form/CreateUser";
import CustomerVisit from "../pages/Visit/CustomerVisit";
import VisitorManager from "../pages/Visitor/VisitorManager";
import BanVisitorManager from "../pages/Visitor/BanVisitorManager";
import CreateNewVisitList from "../form/CreateNewVisitList";
import DetailCustomerVisit from "../pages/Visit/DetailCustomerVisit";
import Schedule from "../pages/Schedule/Schedule";
import DetailSchedule from "../pages/Schedule/DetailSchedule";
import CreateNewSchedule from "../form/CreateNewSchedule";
import CardManager from "../pages/Facility/CardManager";
import CreateQRCard from "../form/CreateQRCard";
import GateManager from "../pages/Facility/GateManager";
import CalendarPage from "../pages/Utility/Calendar";
import History from "../pages/History/History";
import Chat from "../pages/Utility/Chat/Chat";
import Profile from "../pages/User/Profile";
import CustomerVisitStaff from "../pages/Visit/CustomerVisitStaff";
import ChatDetail from "../pages/Utility/Chat/ChatDetail";
import NotFoundState from "../components/State/NotFoundState";
import User from "../pages/User/User";
import CreateGate from "../form/CreateGate";
import GateDetail from "../pages/Facility/GateDetail";
import { Simulation } from "../pages/Simulation";
import HistoryDetail from "../pages/History/HistoryDetail";




const ContentRouter = () => {

  const userRole = localStorage.getItem("userRole"); // Get user role from local storage
  const userId = Number(localStorage.getItem("userId"));
  const connection = useRef<signalR.HubConnection | null>(null);
  const dispatch = useDispatch()
  useEffect(() => {
    if (userRole) {
      const user: UserConnectionHubType = {
        userId: userId,
        role: userRole
      }
      SignalR.SetSignalR(user, connection, dispatch)
    }
  }, [])
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
        path="/user"
        element={
          <LayoutPage>
            <User />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/schedule-staff"
        element={
          <LayoutPage>
            <ScheduleStaff status="All" />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/schedule-staff-assigned"
        element={
          <LayoutPage>
            <ScheduleStaff status="Assigned" />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/schedule-staff-rejected"
        element={
          <LayoutPage>
            <ScheduleStaff status="Rejected" />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/schedule-assigned"
        element={
          <LayoutPage>
            <ScheduleAssignedManager />
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
        path="/visitorManager"
        element={
          <LayoutPage>
            <VisitorManager />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/banVisitorManager"
        element={
          <LayoutPage>
            <BanVisitorManager />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/customerVisitStaff/createNewVisitList"
        element={
          <LayoutPage>
            <CreateNewVisitList />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/schedule-staff/createNewVisitList"
        element={
          <LayoutPage>
            <CreateNewVisitList />
          </LayoutPage>
        }
      />
       <Route
        index
        path="/customerVisit/createNewVisitList"
        element={
          <LayoutPage>
            <CreateNewVisitList />
          </LayoutPage>
        }
      />
       <Route
        index
        path="/customerVisitStaff/detailVisit"
        element={
          <LayoutPage>
            <NotFoundState />
          </LayoutPage>
        }
      />
       <Route
        index
        path="/customerVisit/detailVisit"
        element={
          <LayoutPage>
            <NotFoundState />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/customerVisit/detailVisit/:id"
        element={
          <LayoutPage>
            <DetailCustomerVisit />
          </LayoutPage>
        }
      />
      <Route
        index
        path="customerVisitStaff/detailVisit/:id"
        element={
          <LayoutPage>
            <DetailCustomerVisit />
          </LayoutPage>
        }
      />
<Route
        index
        path="/customerVisitStaff"
        element={
          <LayoutPage>
            <CustomerVisitStaff />
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
            <DetailSchedule />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/schedule/createNewSchedule"
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
        path="/gate/createGate"
        element={
          <LayoutPage>
            <CreateGate />
          </LayoutPage>
        }
      />
       <Route
        index
        path="/gate/detailGate/:id"
        element={
          <LayoutPage>
            <GateDetail />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/gate/detailGate"
        element={
          <LayoutPage>
            <NotFoundState />
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
        path="/sessionDetail/:id"
        element={
          <LayoutPage>
            <HistoryDetail />
          </LayoutPage>
        }
      />
      <Route
        index
        path="/simulation"
        element={

            <Simulation />

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
     
      <Route
        index
        path="/profile/:idUser"
        element={
          <LayoutPage>
            <Profile />
          </LayoutPage>} />
      <Route index path="/" element={<Login />} />
    </Routes>
  );
};

export default ContentRouter;
