import {
  CalendarOutlined,
  DashboardOutlined,
  HistoryOutlined,
  UserOutlined,
  WechatWorkOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Menu, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MenuNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    return sessionStorage.getItem("selectedKey") || "";
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);

  const userRole = localStorage.getItem("userRole"); // Get userRole from localStorage

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
      // Handle logout logic (e.g., clear tokens, etc.)
      localStorage.clear();
      navigate("/"); // Redirect to login on logout
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
      label: "Quản lý phòng ban",
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
      label: "Khách có lịch hẹn",
    },
    {
      key: "visitorManager",
      icon: <UserOutlined />,
      label: "Nhóm khách",
    },
    {
      key: "staff",
      icon: <UserOutlined />,
      label: "Nhân viên",
    },
    {
      key: "card",
      icon: <UserOutlined />,
      label: "Thẻ",
    },
    {
      key: "gate",
      icon: <UserOutlined />,
      label: "Cổng",
    },
    {
      key: "schedule",
      icon: <UserOutlined />,
      label: "Tiến trình",
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
      label: "Thông báo - test",
    },
    {
      key: "",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  // Filter menu items based on the userRole
  const filteredMenuItems = allMenuItems.filter((item) => {
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
      ].includes(item.key);
    }
    return true; // Include all items for other roles
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Menu
        className="mt-[10%]"
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]} // Set selected keys based on the state
        onClick={handleMenuClick}
        items={filteredMenuItems} // Use filtered items based on userRole
      />

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
