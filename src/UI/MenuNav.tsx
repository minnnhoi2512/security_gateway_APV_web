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
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MenuNav = () => {
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    return sessionStorage.getItem("selectedKey") || "";
  });

  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole"); 

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "") {
      localStorage.clear();
      navigate("/"); 
    } else {
      navigate(`/${key}`);
      setSelectedKey(key);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("selectedKey", selectedKey);
  }, [selectedKey]);

  const allMenuItems = [
    { key: "dashboard", icon: <HomeOutlined />, label: "Thông tin chung" },
    { key: "visitorManager", icon: <TeamOutlined />, label: "Nhóm khách" },
    { key: "customerVisit", icon: <ContactsOutlined />, label: "Danh sách khách" },
    { key: "staff", icon: <SolutionOutlined />, label: "Danh sách nhân viên" },
    { key: "schedule", icon: <FileTextOutlined />, label: "Tiến trình" },
    { key: "calendar", icon: <CalendarOutlined />, label: "Lịch trình" },
    { key: "history", icon: <HistoryOutlined />, label: "Lịch sử" },
    { key: "chat", icon: <MessageOutlined />, label: "Nhắn tin" },
    { key: "notification-test", icon: <NotificationOutlined />, label: "Thông báo - test" },
    { key: "", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const filteredMenuItems = allMenuItems.filter((item) => {
    if (userRole === "Security") {
      return !["dashboard", "manager", "departmentManager", "security", "card", "gate", "project", "history"].includes(item.key);
    } else if (userRole === "Staff" || userRole === "DepartmentManager") {
      return !["dashboard", "manager", "security", "departmentManager", "departManager", "project", "history", "card", "gate"].includes(item.key);
    } else if (userRole === "Manager") {
      return !["dashboard", "project", "history", "manager", "staff"].includes(item.key);
    }
    return true;
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
    </div>
  );
};

export default MenuNav;
