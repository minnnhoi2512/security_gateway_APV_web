import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import "@fontsource/inter";

import { Button, Layout, theme } from "antd";
import MenuNav from "../UI/MenuNav";
type Props = {
  children: React.ReactNode;
};
const { Header, Sider, Content } = Layout;

const LayoutPage = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");
  return (
    <div>
      <Layout className="min-h-screen">
        <Sider
          theme={"light"}
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ width: 500 }} // Set the desired width for the Sider
        >
          {collapsed ? (
            <div className="flex justify-center items-center p-2">
              <img
                className="w-[60px] h-[50px]"
                src="https://vietnetco.vn/wp-content/uploads/2020/04/Secure-Web-Gateway-01-1024x844.png"
                alt="Logo"
              />
            </div>
          ) : null}

          {/* Content that will be shown when not collapsed */}
          <div
            className={`${
              collapsed ? "hidden" : "block"
            } transition-all duration-300`}
          >
            <div className="grid grid-cols-3 mt-6 p-1 justify-center gap-1">
              <div className="col-span-1">
                <img
                  className="w-[60px] h-[50px]"
                  src="https://vietnetco.vn/wp-content/uploads/2020/04/Secure-Web-Gateway-01-1024x844.png"
                  alt="Secure Web Gateway"
                />
              </div>
              <div className="col-span-2 mt-[6px]">
                <h1 className="text-[#184DD1] font-bold font-inter">
                  SECURITY GATE
                </h1>
                <h1 className="text-[#184DD1] font-bold font-inter">APV</h1>
              </div>
            </div>

            <div className="flex items-center mt-4 p-1">
              <div className="flex-shrink-0">
                <img
                  className="w-[30px] h-[30px] rounded-full ml-4"
                  src="https://thanhnien.mediacdn.vn/Uploaded/haoph/2021_10_21/jack-va-thien-an-5805.jpeg"
                  alt="Thien An"
                />
              </div>
              <div className="ml-2">
                <div>
                  <h1 className="text-[#000000] text-sm font-inter">
                    {userName}
                  </h1>
                </div>
                <h2 className="text-[#C2C2C2] text-xs font-inter">
                  {userRole}
                </h2>
              </div>
            </div>
            <div className="border-b-[1.5px] border-[#D0D0D0] mt-2 w-[80%] ml-3"></div>
          </div>
          <MenuNav />
        </Sider>
        <Layout>
          <Header
            className="h-[100px]"
            style={{ background: colorBgContainer }}
          >
            <Button
              className="justify-start"
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "14px",
                width: 40,
                height: 40,
              }}
            />
          </Header>
          <Content
            className="m-3"
            // style={{
            //   margin: "24px 16px",
            //   padding: 24,
            //   minHeight: 280,
            //   background: colorBgContainer,
            //   borderRadius: borderRadiusLG,
            // }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default LayoutPage;
