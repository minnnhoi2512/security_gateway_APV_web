import {
  HomeOutlined,
  TeamOutlined,
  ContactsOutlined,
  SolutionOutlined,
  FileTextOutlined,
  CalendarOutlined,
  HistoryOutlined,
  MessageOutlined,
  NotificationOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Menu, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SignalR from '../utils/signalR';
import { useDispatch, useSelector } from "react-redux";

const MenuNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    return sessionStorage.getItem("selectedKey") || "";
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);

  const userRole = localStorage.getItem("userRole"); // Get userRole from localStorage
  const connection = useSelector<any>(s => s.hubConnection.connection) as React.MutableRefObject<signalR.HubConnection | null>
  const dispatch = useDispatch();
  const handleCancel = () => {
    setIsModalVisible(true); // Show the confirmation modal
  };

  const handleOk = () => {
    if (nextLocation) {
      setSelectedKey(nextLocation.split("/")[1]); // Update the selectedKey based on nextLocation
      navigate(nextLocation); // Navigate to the next location
    }
    setIsModalVisible(false); // Close the modal
    setNextLocation(null); // Reset nextLocation
  };

  const handleCancelNavigation = () => {
    setIsModalVisible(false); // Close the modal without navigation
    setNextLocation(null); // Reset nextLocation
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "") {
      if(connection){
        SignalR.DisconnectSignalR(connection,dispatch)
      }
      localStorage.clear();
      navigate("/");
    } else {
      if (location.pathname === "/createNewVisitList") {
        setNextLocation(`/${key}`); // Store the next location
        handleCancel(); // Show confirmation modal
      } else {
        setSelectedKey(key); // Update selected key directly
        navigate(`/${key}`);
      }
    }
  };

  useEffect(() => {
    sessionStorage.setItem("selectedKey", selectedKey);
  }, [selectedKey]);

  const allMenuItems = [
    { key: "dashboard", icon: <HomeOutlined />, label: "Thông tin chung" },
    { key: "visitorManager", icon: <TeamOutlined />, label: "Nhóm khách" },
    {
      key: "customerVisit",
      icon: <ContactsOutlined />,
      label: "Danh sách khách",
    },
    { key: "departManager", icon: <SolutionOutlined />, label: "Danh sách phòng ban" },
    { key: "staff", icon: <SolutionOutlined />, label: "Danh sách nhân viên" },
    { key: "schedule", icon: <FileTextOutlined />, label: "Tiến trình" },
    { key: "schedule-staff", icon: <FileTextOutlined />, label: "Tạo lịch tiến trình" },
    { key: "calendar", icon: <CalendarOutlined />, label: "Lịch trình" },
    { key: "history", icon: <HistoryOutlined />, label: "Lịch sử" },
    { key: "chat", icon: <MessageOutlined />, label: "Nhắn tin" },
    {
      key: "notification-test",
      icon: <NotificationOutlined />,
      label: "Thông báo - test",
    },
    { key: "", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const filteredMenuItems = allMenuItems.filter((item) => {
    if (userRole === "Staff") {
      return ![
        "dashboard",
        "manager",
        "security",
        "departmentManager",
        "departManager",
        "schedule",
        "history",
        "card",
        "gate",
      ].includes(item.key);
    } else if (userRole === "DepartmentManager") {
      return ![
        "dashboard",
        "manager",
        "security",
        "departmentManager",
        "departManager",
        "schedule-staff",
        "history",
        "card",
        "gate",
      ].includes(item.key);
    } else if (userRole === "Manager") {
      return ![
        "dashboard",
        "project",
        "history",
        "manager",
        "staff",
        "schedule-staff",
      ].includes(item.key);
    }
    return true; // Include all items for other roles
  });

  const menuStyle = {
    backgroundColor: "#34495e",
    color: "#ffffff",
  };

  const menuItemStyle = {
    transition: "background-color 0.3s ease-in-out",
    fontSize: "16px",
    borderRadius: "8px",
  };

  const menuItemSelectedStyle = {
    backgroundColor: "#5E84A2",
    fontWeight: "600",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        style={menuStyle}
      >
        {filteredMenuItems.map((item) => (
          <Menu.Item
            key={item.key}
            icon={item.icon}
            style={{
              ...menuItemStyle,
              ...(selectedKey === item.key ? menuItemSelectedStyle : {}),
            }}
            className={`menu-item ${
              selectedKey === item.key ? "selected" : ""
            }`}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu>

      <Modal
        title="Bạn có muốn hủy quá trình tạo mới lịch?"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancelNavigation}
        okText="Đồng ý"
        cancelText="Quay lại"
      >
        <p>Hành động này sẽ xóa hết dữ liệu.</p>
      </Modal>
    </div>
  );
};

export default MenuNav;
