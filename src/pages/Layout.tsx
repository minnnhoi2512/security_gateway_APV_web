import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import "@fontsource/inter"; 
import MenuNav from "../UI/MenuNav";
import { useGetDetailUserQuery } from "../services/user.service";
import DefaultUserImage from "../assets/default-user-image.png";
type Props = {
  children: React.ReactNode;
};

const { Header, Sider, Content } = Layout;

const LayoutPage = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const userId = Number(localStorage.getItem("userId"));

  // Assuming getUserDetail is the type of the data returned from the query
  const { data } = useGetDetailUserQuery(userId);
  const getRoleDisplayName = (roleName: string) => {
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
  const sharedBackgroundColor = "#34495e";
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "Role";

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }else {
      console.error("User ID không tồn tại.");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
                src={data?.image || DefaultUserImage}
                alt="User"
              />
              <div className="ml-3">
                <h1 className="text-sm font-medium text-white">
                  {data?.fullName}
                </h1>
                <h2 className="text-xs text-gray-300">
                  {getRoleDisplayName(data?.role.roleName)}
                </h2>
                <h2 className="text-xs text-gray-300">
                  {data?.department.departmentName}
                </h2>
              </div>
            </div>
            <div className="border-t border-gray-400"></div>
          </div>
        )}

        <MenuNav />
      </Sider>

      <Layout>
        <Header
          className="flex items-center"
          style={{
            backgroundColor: sharedBackgroundColor,
            paddingLeft: 20,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-white"
            style={{ fontSize: "18px" }}
          />
        </Header>

        <Content className="m-6 p-6 bg-white rounded shadow min-h-[80vh]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
