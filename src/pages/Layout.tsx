import React, { useEffect, useState } from "react";
import { DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SmileOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Layout, Space } from "antd";
import { useNavigate } from "react-router-dom";
import "@fontsource/inter"; 
import MenuNav from "../UI/MenuNav";
import { MenuProps } from "antd/lib";
import { useDispatch, useSelector } from "react-redux";
import NotificationType from "../types/notificationType";
import { el } from "date-fns/locale";
import { toast, ToastContainer } from "react-toastify";
import { markAsRead, reloadNoti } from "../redux/slices/notification.slice";

type Props = {
  children: React.ReactNode;
};

const { Header, Sider, Content } = Layout;

const LayoutPage = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "Role";
  const userId = localStorage.getItem("userId");
  const dispatch = useDispatch();
  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }else {
      console.error("User ID không tồn tại.");
    }
  };
  const notifications = useSelector<any>( s => s.notification.notification) as NotificationType[]
  var notiCount = notifications?.filter(s => s.isRead == false)
  var reload = useSelector<any>( s => s.notification.isnew) as boolean
  useEffect(()=>{
    if(notifications?.length > 0 && reload == true){
      toast("Bạn có thông báo mới")
    }
    dispatch(reloadNoti())
  },[notifications])
  const items: MenuProps['items'] = [
  ];
  const handleReadNotification = (id : string, isRead : boolean) =>{
    if(!isRead){
      dispatch(markAsRead(id))
    }

  } 
  if(notifications){
    var reverseArray = [...notifications]
    reverseArray.reverse().forEach((element, index )=> {
      items.push({
        key: index,
        label: (
          <div className="inline-flex">
            <a style={{fontWeight: `${element.isRead == true ? "lighter": "bold"}
              
              `}} onClick={() => handleReadNotification(element.id, element.isRead)} rel="noopener noreferrer" href="#">
            {element.title}
            <p style={{fontWeight: "lighter"}}>{element.discription}</p>
            </a>
          </div>
        ),
      },)
    });
  }
  const sharedBackgroundColor = "#34495e"; 

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <ToastContainer position="top-center" containerId="NotificationToast"  />
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
                src="https://thanhnien.mediacdn.vn/Uploaded/haoph/2021_10_21/jack-va-thien-an-5805.jpeg"
                alt="User"
              />
              <div className="ml-3">
                <h1 className="text-sm font-medium text-white">{userName}</h1>
                <h2 className="text-xs text-gray-300">{userRole}</h2>
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
          <div className="top-0 right-20 absolute ">
          <Dropdown menu={{ items }} trigger={['click']} overlayClassName="pt-1">
            <a onClick={(e) => e.preventDefault()}>
            <Space>
            <Badge count={notiCount?.length}>
            <button><Avatar shape="circle" size="default" src="/src/assets/iconNoti.png"/></button>
            </Badge>
            </Space>
            </a>
          </Dropdown>
          </div>
        </Header>

        <Content className="m-6 p-6 bg-white rounded shadow min-h-[80vh]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
