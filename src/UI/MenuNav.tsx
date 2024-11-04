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
} from "@ant-design/icons";
import { Menu, MenuProps, Modal, MenuTheme, Switch } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SignalR from "../utils/signalR";
import { useDispatch, useSelector } from "react-redux";
type MenuItem = Required<MenuProps>["items"][number];

const MenuNav = () => {
  const [theme, setTheme] = useState<MenuTheme>("dark");
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    return sessionStorage.getItem("selectedKey") || "";
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);

  const userRole = localStorage.getItem("userRole");
  const changeTheme = (value: boolean) => {
    setTheme(value ? "dark" : "light");
  };
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
  const allMenuItems: MenuItem[] = [
    { key: "dashboard", icon: <LineChartOutlined />, label: "Thông tin chung" },
    {
      key: "accountManage",
      icon: <TeamOutlined />,
      label: "Người dùng",
      children: [
        { key: "manager", label: "Quản lý" },
        { key: "departmentManager", label: "Quản lý phòng ban" },
        { key: "staff", label: "Nhân viên phòng ban" },
        { key: "security", label: "Bảo vệ" },
      ],
    },
    {
      key: "scheduleManage",
      icon: <FileTextOutlined />,
      label: "Lịch trình",
      children: [
        { key: "schedule", label: "Tất cả lịch trình" },
        { key: "schedule-assigned", label: "Lịch trình đã giao" },
        { key: "schedule-staff", label: "Tạo lịch hẹn" },
        { key: "schedule-staff-assigned", label: "Lịch trình được giao" },
        { key: "schedule-staff-rejected", label: "Lịch trình bị hủy bỏ" },
      ],
    },

    {
      key: "visitorManage",
      icon: <SolutionOutlined />,
      label: "Danh sách khách",
      children: [
        { key: "visitorManager", label: "Khách tiêu chuẩn" },
        { key: "banVisitorManager", label: "Sổ đen" },
      ],
    },
    {
      key: "customerVisit",
      icon: <BarsOutlined />,
      label: "Chuyến thăm",
      // children: [
      //   { key: "customerVisit", label: "Theo ngày" },
      //   { key: "customerVisitWeekly", label: "Theo tuần" },
      //   { key: "customerVisitMonthly", label: "Theo tháng" },
      // ],
    },
    {
      key: "historyManage",
      icon: <HistoryOutlined />,
      label: "Lịch sử",
      children: [
        { key: "history", label: "Lượt ra vào" },
      ],
    },
    {
      key: "facilityManage",
      icon: <DeploymentUnitOutlined />,
      label: "Cơ sở vật chất",
      children: [
        { key: "departManager", label: "Phòng ban" },
        { key: "gate", label: "Cổng ra vào" },
        { key: "card", label: "Thẻ ra vào" },
      ],
    },
    {
      key: "utility",
      icon: <AppstoreOutlined />,
      label: "Tiện ích",
      children: [
        { key: "calendar", label: "Lịch hẹn của tôi" },
        { key: "chat", label: "Nhắn tin" },
      ],
    },

    { key: "", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];
  // Filter out "manager" item if userRole is "Manager"
  const filteredMenuItems = allMenuItems
    .map((item: any) => {
      if (userRole === "Admin") {
        const excludedKeys = [
          "schedule-staff",
          "schedule-staff-assigned",
          "schedule-staff-rejected"
        ];

        // Exclude top-level items and children based on excluded keys
        if (excludedKeys.includes(item.key)) {
          return null;
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.filter(
              (child: any) => !excludedKeys.includes(child.key)
            ),
          };
        }
      }
      if (userRole === "Manager") {
        const excludedKeys = [
          "manager",
          "schedule-staff",
          "schedule-staff-assigned",
          "schedule-staff-rejected"
        ];

        // Exclude top-level items and children based on excluded keys
        if (excludedKeys.includes(item.key)) {
          return null;
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.filter(
              (child: any) => !excludedKeys.includes(child.key)
            ),
          };
        }
      }

      // Exclude specific items for DepartmentManager role
      if (userRole === "DepartmentManager") {
        const excludedKeys = [
          "dashboard",
          "manager",
          "departmentManager",
          "facilityManage",
          "banVisitorManager",
          "schedule-staff",
          "security",
        ];

        // Exclude top-level items and children based on excluded keys
        if (excludedKeys.includes(item.key)) {
          return null;
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.filter(
              (child: any) => !excludedKeys.includes(child.key)
            ),
          };
        }
      }
      if (userRole === "Staff") {
        const excludedKeys = [
          "dashboard",
          "accountManage",
          "schedule-assigned",
          "schedule",
          "facilityManage",
          "banVisitorManager",
          "security",
        ];

        // Exclude top-level items and children based on excluded keys
        if (excludedKeys.includes(item.key)) {
          return null;
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.filter(
              (child: any) => !excludedKeys.includes(child.key)
            ),
          };
        }
      }

      return item;
    })
    .filter(Boolean); // Remove any null values from the filtered array

  const renderMenuItems = (menuItems: any) =>
    menuItems.map((item: any) => {
      if (item.children) {
        return (
          <Menu.SubMenu
            key={item.key}
            icon={item.icon}
            title={item.label}
            style={menuItemStyle}
          >
            {item.children.map((subItem: any) => (
              <Menu.Item key={subItem.key} style={menuItemStyle}>
                {subItem.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item
          key={item.key}
          icon={item.icon}
          style={{
            ...menuItemStyle,
            ...(selectedKey === item.key ? menuItemSelectedStyle : {}),
          }}
        >
          {item.label}
        </Menu.Item>
      );
    });

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
    <div className="">
      <Switch checked={theme === "dark"} onChange={changeTheme} />
      <br />
      <br />
      <Menu
        theme={theme}
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
      >
        {renderMenuItems(filteredMenuItems)}
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
