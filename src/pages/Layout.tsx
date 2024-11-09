import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Breadcrumb,
  Button,
  Layout,
  Space,
  Badge,
} from "antd";
import { useNavigate } from "react-router-dom";
import "@fontsource/inter";
import MenuNav from "../UI/MenuNav";
import { useGetDetailUserQuery } from "../services/user.service";
import DefaultUserImage from "../assets/default-user-image.png";
import NotificationDropdown from "../components/Dropdown/NotificationDropdown";
import { ToastContainer } from "react-toastify";
import { useGetListNotificationUserQuery } from "../services/notification.service";

const { Header, Sider, Content } = Layout;

const LayoutPage = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Toggle for dark/light theme
  const userId = Number(localStorage.getItem("userId"));
  const { data: userData } = useGetDetailUserQuery(userId);
  const { data: notifications } = useGetListNotificationUserQuery({
    userId: Number(userId),
  });
  const notiCount = notifications?.filter((s) => !s.readStatus).length || 0;

  const navigate = useNavigate();
  const sharedBackgroundColor = "#34495e";

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      console.error("User ID không tồn tại.");
    }
  };

  const getRoleDisplayName = (roleName) => {
    switch (roleName) {
      case "Staff":
        return "Nhân viên";
      case "DepartmentManager":
        return "Quản lý phòng ban";
      case "Manager":
        return "Quản lý";
      case "Admin":
        return "ADMIN";
      default:
        return roleName;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <ToastContainer position="top-center" containerId="NotificationToast" />

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{ backgroundColor: sharedBackgroundColor }}
      >
        <div className="flex flex-col items-center p-4">
          <img
            className="w-[50px] h-[50px] mb-2"
            src="https://vietnetco.vn/wp-content/uploads/2020/04/Secure-Web-Gateway-01-1024x844.png"
            alt="Logo"
          />
          {!collapsed && (
            <div className="text-center">
              <h1 className="text-white text-lg font-bold leading-tight">
                SECURITY GATE
              </h1>
              <h2 className="text-white text-sm">APV</h2>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="px-4 py-2">
            <div onClick={handleProfileClick} className="flex items-center mb-4 cursor-pointer">
              <img
                className="w-[40px] h-[40px] rounded-full"
                src={userData?.image || DefaultUserImage}
                alt="User"
              />
              <div className="ml-3">
                <h1 className="text-sm font-medium text-white">
                  {userData?.fullName}
                </h1>
                <h2 className="text-xs text-gray-300">
                  {getRoleDisplayName(userData?.role.roleName)}
                </h2>
                <h2 className="text-xs text-gray-300">
                  {userData?.department?.departmentName}
                </h2>
              </div>
            </div>
            <div className="border-t border-gray-400"></div>
          </div>
        )}

        <MenuNav theme={isDarkTheme ? "dark" : "light"} />
      </Sider>

      <Layout>
        <Header
          className="flex items-center justify-between"
          style={{
            backgroundColor: sharedBackgroundColor,
            paddingLeft: 20,
          }}
        >
          {/* Button to toggle sidebar collapse */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-white"
            style={{ fontSize: "18px" }}
          />

          <Space>
            {/* Dark/Light Mode Toggle Icon */}
            <Button
              type="text"
              icon={<BulbOutlined style={{ color: isDarkTheme ? "#ffc107" : "#fff" }} />}
              onClick={() => setIsDarkTheme(!isDarkTheme)}
            />

            {/* Notification Dropdown */}
            <Badge count={notiCount}>
              <NotificationDropdown />
            </Badge>
          </Space>
        </Header>

        <Breadcrumb
          items={[{ title: 'Home' }, { title: 'List' }, { title: 'App' }]}
          style={{ margin: '16px' }}
        />

        <Content className="m-6 p-6 bg-white rounded shadow min-h-[80vh]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
