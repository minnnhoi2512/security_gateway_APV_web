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
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Menu, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SignalR from "../utils/signalR";
import { useDispatch, useSelector } from "react-redux";
import { MenuProps } from "antd/lib";

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
  ];

  const part2: MenuItem[] = [
    {
      key: "schedule",
      icon: <FileTextOutlined />,
      label: "Lịch trình",
    },
  ];

  const part3: MenuItem[] = [
    {
      key: "historyManage",
      icon: <HistoryOutlined />,
      label: "Lịch sử",
      children: [{ key: "history", label: "Lượt ra vào" }],
    },
    {
      key: "facilityManage",
      icon: <DeploymentUnitOutlined />,
      label: "Cơ sở vật chất",
      children: [
        { key: "departManager", label: "Phòng ban", icon: <TeamOutlined /> },
        { key: "gate", label: "Cổng ra vào", icon: <SolutionOutlined /> },
        {
          key: "card",
          label: "Thẻ ra vào",
          icon: <SafetyCertificateOutlined />,
        },
      ],
    },
  ];

  const part4: MenuItem[] = [
    {
      key: "utility",
      icon: <AppstoreOutlined />,
      label: "Tiện ích",
      children: [
        {
          key: "calendar",
          label: "Lịch hẹn của tôi",
          icon: <FileTextOutlined />,
        },
        { key: "chat", label: "Nhắn tin", icon: <UserOutlined /> },
      ],
    },
    { key: "", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const renderMenuItems = (menuItems: MenuItem[]) =>
    menuItems.map((item: any) => {
      if (item?.children) {
        return (
          <Menu.SubMenu
            key={item.key}
            icon={<span style={iconStyle}>{item.icon}</span>}
            title={<span style={titleStyle}>{item.label}</span>}
          >
            {item.children.map((subItem: any) => (
              <Menu.Item
                key={subItem.key}
                icon={<span style={iconStyle}>{subItem.icon}</span>}
                style={subItemStyle}
                onClick={handleMenuClick}
              >
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
        {renderMenuItems(part1)}
        <Menu.Divider />
        <div className="border-t-4 border-gray-400"></div>
        {renderMenuItems(part2)}
        <Menu.Divider />
        <div className="border-t-4 border-gray-400"></div>
        {renderMenuItems(part3)}
        <Menu.Divider />
        <div className="border-t-4 border-gray-400"></div>
        {renderMenuItems(part4)}
      </Menu>

      <Modal
        title="Bạn có muốn hủy quá trình tạo mới chuyến thăm?"
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
