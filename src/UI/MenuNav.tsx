import {
  CalendarOutlined,
  DashboardOutlined,
  HistoryOutlined,
  UserOutlined,
  WechatWorkOutlined,
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
  const userRole = localStorage.getItem("userRole"); // Get userRole from localStorage
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "") {
      // Handle logout logic (e.g., clear tokens, etc.)
      localStorage.clear();
      navigate("/"); // Redirect to login on logout
    } else {
      navigate(`/${key}`);
      setSelectedKey(key);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("selectedKey", selectedKey);
  }, [selectedKey]);

  // Define all menu items
  const allMenuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Thông tin chung",
    },
    {
      key: "manager",
      icon: <UserOutlined />,
      label: "Quản lý",
    },
    {
      key: "departmentManager",
      icon: <UserOutlined />,
      label: "Trợ lý phòng ban",
    },
    {
      key: "departManager",
      icon: <UserOutlined />,
      label: "Phòng ban",
    },
    {
      key: "security",
      icon: <UserOutlined />,
      label: "Bảo vệ",
    },
    {
      key: "customerVisit",
      icon: <UserOutlined />,
      label: "Danh sách khách có lịch hẹn",
    },
    {
      key: "staff",
      icon: <UserOutlined />,
      label: "Danh sách nhân viên",
    },
    {
      key: "card",
      icon: <UserOutlined />,
      label: "Danh sách thẻ",
    },
    {
      key: "gate",
      icon: <UserOutlined />,
      label: "Danh sách cổng",
    },
    {
      key: "schedule",
      icon: <UserOutlined />,
      label: "Tiến trình hằng ngày",
    },
    {
      key: "calendar",
      icon: <CalendarOutlined />,
      label: "Lịch trình",
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Lịch sử",
    },
    {
      key: "chat",
      icon: <WechatWorkOutlined />,
      label: "Nhắn tin",
    },
    {
      key: "notification-test",
      icon: <WechatWorkOutlined />,
      label: "Thoong baos -test",
    },
    {
      key: "",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  // Filter menu items based on the userRole
  const filteredMenuItems = allMenuItems.filter((item) => {
    // Exclude certain items if the userRole is 'Security'
    if (userRole === "Security") {
      return ![
        "dashboard",
        "manager",
        "departmentManager",
        "security",
        "card",
        "gate",
        "project",
        "history",
      ].includes(item.key);
    } else if (userRole === "Staff" || userRole === "DepartmentManager") {
      return ![
        "dashboard",
        "manager",
        "security",
        "departmentManager",
        "departManager",
        "project",
        "history",
      ].includes(item.key);
    } else if (userRole === "Manager") {
      return ![
        "dashboard",
        "departmentManager",
        "security",
        "project",
        "history",
      ].includes(item.key);
    }
    return true; // Include all items for other roles
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Menu
        className="mt-[8%]"
        theme="light"
        mode="inline"
        defaultSelectedKeys={["1"]}
        onClick={handleMenuClick}
        items={filteredMenuItems} // Use filtered items based on userRole
      />
    </div>
  );
};

export default MenuNav;
