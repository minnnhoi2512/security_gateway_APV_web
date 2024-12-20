  import {
    TeamOutlined,
    SolutionOutlined,
    FileTextOutlined,
    HistoryOutlined,
    LogoutOutlined,
    LineChartOutlined,
    BarsOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
    ScheduleOutlined,
    CalendarOutlined,
  } from "@ant-design/icons";
  import { Menu, Modal, Typography } from "antd";
  import { useEffect, useState } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  import SignalR from "../utils/signalR";
  import { useDispatch, useSelector } from "react-redux";
  import { MenuProps } from "antd/lib";
import { Calendar, CalendarSearch, ClipboardList, MessagesSquare, User, Users } from "lucide-react";

  type MenuItem = Required<MenuProps>["items"][number];

  const MenuNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedKey, setSelectedKey] = useState<string>(() => {
      return sessionStorage.getItem("selectedKey") || "";
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [nextLocation, setNextLocation] = useState<string | null>(null);

    const userRole = localStorage.getItem("userRole");
    const connection = useSelector<any>(
      (s) => s.hubConnection.connection
    ) as React.MutableRefObject<signalR.HubConnection | null>;
    const dispatch = useDispatch();

    const handleCancel = () => setIsModalVisible(true);

    const handleOk = () => {
      if (nextLocation) {
        setSelectedKey(nextLocation.split("/")[1]);
        navigate(nextLocation);
      }
      setIsModalVisible(false);
      setNextLocation(null);
    };

    const handleCancelNavigation = () => {
      setIsModalVisible(false);
      setNextLocation(null);
    };

    const handleMenuClick = ({ key }: { key: string }) => {
      if (key === "") {
        if (connection) {
          SignalR.DisconnectSignalR(connection, dispatch);
        }
        localStorage.clear();
        navigate("/");
      } else {
        if (location.pathname === "/createNewVisitList") {
          setNextLocation(`/${key}`);
          handleCancel();
        } else {
          setSelectedKey(key);
          sessionStorage.setItem("selectedKey", key);
          navigate(`/${key}`);
        }
      }
    };

    useEffect(() => {
      const path = location.pathname.split("/")[1];
      setSelectedKey(path);
      sessionStorage.setItem("selectedKey", path);
    }, [location.pathname]);

    const part1: MenuItem[] = [
      { key: "dashboard", icon: <LineChartOutlined className="text-lg" />, label: "Thông tin chung" },
      {
        key: "customerVisitStaff",
        icon: <ScheduleOutlined className="text-lg" />,
        label: "Chuyến thăm",
      },
      {
        key: "customerVisit",
        icon: <ScheduleOutlined className="text-lg" />,
        label: "Chuyến thăm",
      },
      {
        key: "schedule-staff",
        icon:  <ClipboardList size={17} />,
        label: "Nhiệm vụ",
      },
      {
        key: "schedule-assigned",
        icon: <ClipboardList size={17} />,
        label: "Nhiệm vụ",
      },
    ];

    const part2: MenuItem[] = [
      {
        key: "schedule",
        icon: <Calendar   size={17}/>,
        label: "Lịch trình",
      },
      {
        key: "history",
        icon: <HistoryOutlined className="text-lg" />,
        label: "Lịch sử",
      },
      {
        key: "user",
        label: "Người dùng",
        icon:  <User size={17} />,
      },
      {
        key: "visitorManager",
        label: "Khách",
        icon: <Users size={17} />,
      },
      {
        key: "departManager",
        label: "Phòng ban",
        icon: <TeamOutlined className="text-lg" />,
      },
     
      {
        key: "chat",
        label: "Nhắn tin",
        icon: <MessagesSquare size={17} />,
      },
    ];

    const part3: MenuItem[] = [
      {
        key: "gate",
        label: "Cổng ra vào",
        icon: <SolutionOutlined className="text-lg" />,
      },
      {
        key: "card",
        label: "Thẻ ra vào",
        icon: <SafetyCertificateOutlined className="text-lg" />,
      },
      { 
        key: "", 
        icon: <LogoutOutlined className="text-lg" />, 
        label: "Đăng xuất",
        className: "mt-4 !bg-transparent hover:!bg-white/10" 
      },
    ];

    const filterMenuItemsByRole = (menuItems: MenuItem[], role: string) => {
      if (role === "Staff") {
        return menuItems.filter(
          (item: any) =>
            item.key !== "customerVisit" &&
            item.key !== "user" &&
            item.key !== "departManager" &&
            item.key !== "schedule" &&
            item.key !== "gate" &&
            item.key !== "card" &&
            item.key !== "schedule-assigned"
        );
      } else if (role === "DepartmentManager") {
        return menuItems.filter(
          (item: any) =>
            item.key !== "customerVisitStaff" &&
            item.key !== "departManager" &&
            item.key !== "gate" &&
            item.key !== "card" &&
            item.key !== "schedule-staff"
        );
      } else {
        return menuItems.filter(
          (item: any) =>
            item.key !== "customerVisitStaff" && item.key !== "schedule-staff"
        );
      }
    };

    const mainMenuItems: MenuItem[] = [
      {
        type: 'group',
        label: <Typography.Text className="text-gray-400 text-xs font-medium px-4">MAIN</Typography.Text>,
        children: [
          { key: "dashboard", icon: <LineChartOutlined />, label: "Thông tin chung" },
          {
            key: "customerVisitStaff",
            icon: <BarsOutlined />,
            label: "Chuyến thăm",
          },
          {
            key: "customerVisit",
            icon: <BarsOutlined />,
            label: "Chuyến thăm",
          },
          {
            key: "schedule-staff",
            icon: <FileTextOutlined />,
            label: "Nhiệm vụ",
          },
          {
            key: "schedule-assigned",
            icon: <FileTextOutlined />,
            label: "Nhiệm vụ",
          },
        ],
      }
    ];

    const middleMenuItems: MenuItem[] = [
      {
        type: 'group',
        label: <Typography.Text className="text-gray-400 text-xs font-medium px-4">FEATURES</Typography.Text>,
        children: [
          {
            key: "schedule",
            icon: <FileTextOutlined />,
            label: "Lịch trình",
          },
          {
            key: "history",
            icon: <HistoryOutlined />,
            label: "Lịch sử",
          },
          {
            key: "user",
            label: "Người dùng",
            icon: <UserOutlined />,
          },
          {
            key: "visitorManager",
            label: "Khách",
            icon: <UserOutlined />,
          },
          {
            key: "departManager",
            label: "Phòng ban",
            icon: <TeamOutlined />,
          },
          {
            key: "calendar",
            label: "Lịch hẹn của tôi",
            icon: <FileTextOutlined />,
          },
          {
            key: "chat",
            label: "Nhắn tin",
            icon: <UserOutlined />,
          },
        ],
      }
    ];

    const settingItems: MenuItem[] = [
      {
        type: 'group',
        label: <Typography.Text className="text-gray-400 text-xs font-medium px-4">SETTINGS</Typography.Text>,
        children: [
          {
            key: "gate",
            label: "Cổng ra vào",
            icon: <SolutionOutlined />,
          },
          {
            key: "card",
            label: "Thẻ ra vào",
            icon: <SafetyCertificateOutlined />,
          },
          { 
            key: "", 
            icon: <LogoutOutlined />, 
            label: "Đăng xuất"
          },
        ],
      }
    ];

    return (
      <div className="relative">
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        className="h-full border-none bg-backgroundPage 
          [&_.ant-menu-item]:my-1 
          [&_.ant-menu-item]:mx-2 
          [&_.ant-menu-item]:rounded-lg
          [&_.ant-menu-item]:transition-all
          [&_.ant-menu-item]:duration-200
          [&_.ant-menu-item]:text-white
          [&_.ant-menu-item-selected]:bg-white/10
          [&_.ant-menu-item-selected]:text-white
          [&_.ant-menu-item-selected]:backdrop-blur-xl
          [&_.ant-menu-item-selected]:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.1)]
          [&_.ant-menu-item]:h-11
          [&_.ant-menu-item]:font-medium
          hover:[&_.ant-menu-item]:bg-white/5
          hover:[&_.ant-menu-item]:text-white
          [&_.ant-menu-item-icon]:opacity-70
          [&_.ant-menu-item-selected_.ant-menu-item-icon]:opacity-100"
        items={[
          ...filterMenuItemsByRole(part1, userRole || ""),
          { 
            type: 'divider',
            className: 'my-4 mx-4 border-t-[3px] !border-white/40 shadow' 
          },
          ...filterMenuItemsByRole(part2, userRole || ""),
          { 
            type: 'divider',
            className: 'my-4 mx-4 border-t-[3px] !border-white/40 shadow'
          },
          ...filterMenuItemsByRole(part3, userRole || ""),
        ]}
        onClick={handleMenuClick}
      />

      <Modal
        title={
          <span className="text-lg font-medium">
            Bạn có muốn hủy quá trình tạo mới chuyến thăm?
          </span>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancelNavigation}
        okText="Đồng ý"
        cancelText="Quay lại"
        okButtonProps={{ 
          className: 'bg-blue-500 hover:bg-blue-600 border-none' 
        }}
        className="p-0"
      >
        <p className="text-gray-600">Hành động này sẽ xóa hết dữ liệu.</p>
      </Modal>
    </div>

    );
  };

  export default MenuNav;