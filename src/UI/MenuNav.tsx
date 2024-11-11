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
import { MenuProps } from "antd/lib";

export const routes = [
  { path: "/", breadcrumbName: "Trang chủ" },
  { path: "/dashboard", breadcrumbName: "Thông tin chung" },
  {
    path: "/customerVisitList",
    breadcrumbName: "Chuyến thăm",
    children: [
      { path: "/customerVisit", breadcrumbName: "Tất cả" },
      { path: "/customerVisitStaff", breadcrumbName: "Chuyến thăm của tôi" },
    ],
  },
  {
    path: "/accountManage",
    breadcrumbName: "Người dùng",
    children: [
      { path: "/manager", breadcrumbName: "Quản lý" },
      { path: "/departmentManager", breadcrumbName: "Quản lý phòng ban" },
      { path: "/staff", breadcrumbName: "Nhân viên phòng ban" },
      { path: "/security", breadcrumbName: "Bảo vệ" },
    ],
  },
  {
    path: "/scheduleManage",
    breadcrumbName: "Lịch trình",
    children: [
      { path: "/schedule", breadcrumbName: "Tất cả lịch trình" },
      { path: "/schedule-staff", breadcrumbName: "Tạo lịch hẹn" },
      { path: "/schedule-staff-assigned", breadcrumbName: "Lịch trình được giao" },
      { path: "/schedule-staff-rejected", breadcrumbName: "Lịch trình bị hủy bỏ" },
      { path: "/schedule-assigned", breadcrumbName: "Lịch trình đã giao" },
    ],
  },
  {
    path: "/visitorManage",
    breadcrumbName: "Danh sách khách",
    children: [
      { path: "/visitorManager", breadcrumbName: "Khách" },
      { path: "/banVisitorManager", breadcrumbName: "Sổ đen" },
    ],
  },
  {
    path: "/historyManage",
    breadcrumbName: "Lịch sử",
    children: [
      { path: "/history", breadcrumbName: "Lượt ra vào" },
    ],
  },
  {
    path: "/facilityManage",
    breadcrumbName: "Cơ sở vật chất",
    children: [
      { path: "/departManager", breadcrumbName: "Phòng ban" },
      { path: "/gate", breadcrumbName: "Cổng ra vào" },
      { path: "/card", breadcrumbName: "Thẻ ra vào" },
    ],
  },
  {
    path: "/utility",
    breadcrumbName: "Tiện ích",
    children: [
      { path: "/calendar", breadcrumbName: "Lịch hẹn của tôi" },
      { path: "/chat", breadcrumbName: "Nhắn tin" },
    ],
  },
  { path: "/logout", breadcrumbName: "Đăng xuất" },
];


type MenuItem = Required<MenuProps>["items"][number];
const MenuNav = ({ theme }: any) => {
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

  const allMenuItems: MenuItem[] = [
    { key: "dashboard", icon: <LineChartOutlined />, label: "Thông tin chung" },
    {
      key: "customerVisitList",
      icon: <BarsOutlined />,
      label: "Chuyến thăm",
      children: [
        { key: "customerVisit", label: "Tất cả" },
        { key: "customerVisitStaff", label: "Chuyến thăm của tôi" },
      ],
    },
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
        { key: "schedule-staff", label: "Tạo lịch hẹn" },
        { key: "schedule-staff-assigned", label: "Lịch trình được giao" },
        { key: "schedule-staff-rejected", label: "Lịch trình bị hủy bỏ" },
        { key: "schedule-assigned", label: "Lịch trình đã giao" },
      ],
    },

    {
      key: "visitorManage",
      icon: <SolutionOutlined />,
      label: "Danh sách khách",
      children: [
        { key: "visitorManager", label: "Khách" },
        { key: "banVisitorManager", label: "Sổ đen" },
      ],
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
          "schedule-staff-rejected",
          "customerVisitStaff"
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
          "schedule-staff-rejected",
          "customerVisitStaff"
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
          "schedule-staff",
          "security",
          "schedule-staff-assigned",
          "schedule-staff-rejected",
          "customerVisitStaff"
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
          "security",
          "customerVisit"
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
            icon={<span style={iconStyle}>{item.icon}</span>}
            title={<span style={titleStyle}>{item.label}</span>}
          >
            {item.children.map((subItem: any) => (
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
    paddingLeft: "10px 20px",
  };

  const iconStyle = {
    color: "#87a2be",
    minWidth: "24px",
    marginRight: "10px",
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