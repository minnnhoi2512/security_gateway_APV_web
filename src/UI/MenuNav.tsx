import {
  TeamOutlined,
  SolutionOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LogoutOutlined,
  LineChartOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DeploymentUnitOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Menu, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SignalR from "../utils/signalR";
import { useDispatch, useSelector } from "react-redux";

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
    sessionStorage.setItem("selectedKey", selectedKey);
  }, [selectedKey]);

  const menuItems = [
    {
      key: "dashboard",
      icon: <LineChartOutlined />,
      label: "Thông tin chung",
    },
    {
      key: "accountManage",
      icon: <TeamOutlined />,
      label: "Người dùng",
      children: [
        { key: "departmentManager", label: "Quản lý phòng ban", icon: <UsergroupAddOutlined /> },
        { key: "staff", label: "Nhân viên phòng ban", icon: <UserOutlined /> },
        { key: "security", label: "Bảo vệ", icon: <SafetyCertificateOutlined /> },
      ],
    },
    {
      key: "scheduleManage",
      icon: <FileTextOutlined />,
      label: "Lịch trình",
      children: [
        { key: "schedule", label: "Tất cả lịch trình", icon: <FileTextOutlined /> },
        { key: "schedule-assigned", label: "Lịch trình đã giao", icon: <FileTextOutlined /> },
      ],
    },
    {
      key: "visitorManage",
      icon: <SolutionOutlined />,
      label: "Danh sách khách",
      children: [
        { key: "visitorManager", label: "Khách tiêu chuẩn", icon: <UserOutlined /> },
        { key: "banVisitorManager", label: "Sổ đen", icon: <SafetyCertificateOutlined /> },
      ],
    },
    {
      key: "customerVisit",
      icon: <BarsOutlined />,
      label: "Chuyến thăm",
    },
    {
      key: "historyManage",
      icon: <HistoryOutlined />,
      label: "Lịch sử",
      children: [{ key: "history", label: "Lượt ra vào", icon: <HistoryOutlined /> }],
    },
    {
      key: "facilityManage",
      icon: <DeploymentUnitOutlined />,
      label: "Cơ sở vật chất",
      children: [
        { key: "departManager", label: "Phòng ban", icon: <TeamOutlined /> },
        { key: "gate", label: "Cổng ra vào", icon: <SolutionOutlined /> },
        { key: "card", label: "Thẻ ra vào", icon: <SafetyCertificateOutlined /> },
      ],
    },
    {
      key: "utility",
      icon: <AppstoreOutlined />,
      label: "Tiện ích",
      children: [
        { key: "calendar", label: "Lịch hẹn của tôi", icon: <FileTextOutlined /> },
        { key: "chat", label: "Nhắn tin", icon: <UserOutlined /> },
      ],
    },
    {
      key: "",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  const getFilteredMenuItems = () => {
    const roleBasedExclusions = {
      Admin: ["schedule-staff", "schedule-staff-assigned", "schedule-staff-rejected"],
      Manager: ["manager", "schedule-staff", "schedule-staff-assigned", "schedule-staff-rejected"],
      DepartmentManager: [
        "dashboard",
        "manager",
        "facilityManage",
        "schedule-staff",
        "schedule-staff-assigned",
        "schedule-staff-rejected",
      ],
      Staff: [
        "dashboard",
        "accountManage",
        "schedule-assigned",
        "schedule",
        "facilityManage",
        "security",
      ],
    };

    const excludedKeys = roleBasedExclusions[userRole as keyof typeof roleBasedExclusions] || [];

    return menuItems
      .map((item) => {
        if (excludedKeys.includes(item.key)) {
          return null;
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => !excludedKeys.includes(child.key)),
          };
        }
        return item;
      })
      .filter(Boolean);
  };

  const renderMenuItems = (menuItems) =>
    menuItems.map((item) => {
      if (item.children) {
        return (
          <Menu.SubMenu
            key={item.key}
            icon={<span style={iconStyle}>{item.icon}</span>}
            title={<span style={titleStyle}>{item.label}</span>}
          >
            {item.children.map((subItem) => (
              <Menu.Item key={subItem.key} icon={<span style={iconStyle}>{subItem.icon}</span>} style={subItemStyle} onClick={handleMenuClick}>
                {subItem.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item
          key={item.key}
          icon={<span style={iconStyle}>{item.icon}</span>}
          style={itemStyle}
          onClick={handleMenuClick}
        >
          {item.label}
        </Menu.Item>
      );
    });

  const itemStyle = {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#34495e",
    padding: "10px 20px",
    borderRadius: "8px",
    marginBottom: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    paddingLeft: "10px 20px", // Đảm bảo padding giống nhau cho cả cha và con
  };

  const iconStyle = {
    color: "#87a2be",
    minWidth: "24px",
    marginRight: "10px", // Đảm bảo khoảng cách giữa icon và text
    display: "flex",
    alignItems: "center",
  };

  const subItemStyle = {
    fontSize: "14px",
    backgroundColor: "#2c3e50",
    color: "#d1d1d1",
    padding: "8px 20px",
    display: "flex",
    alignItems: "center",
    borderRadius: "8px",
    marginBottom: "3px",
  };

  return (
    <div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ backgroundColor: "#34495e", borderRight: "none" }}
      >
        {renderMenuItems(getFilteredMenuItems())}
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
