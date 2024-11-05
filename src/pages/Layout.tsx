import React, { useEffect, useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Badge, Breadcrumb, Button, Dropdown, Layout, Space } from "antd";
import { useNavigate } from "react-router-dom";
import "@fontsource/inter"; 
import MenuNav from "../UI/MenuNav";
import { useGetDetailUserQuery } from "../services/user.service";
import DefaultUserImage from "../assets/default-user-image.png";
import { MenuProps } from "antd/lib";
import { useDispatch, useSelector } from "react-redux";
import NotificationType from "../types/notificationType";
import { toast, ToastContainer } from "react-toastify";
import { reloadNoti } from "../redux/slices/notification.slice";
import { useGetListNotificationUserQuery, useMarkNotiReadMutation } from "../services/notification.service";

type Props = {
  children: React.ReactNode;
};

const { Header, Sider, Content } = Layout;

const LayoutPage = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const userId = Number(localStorage.getItem("userId"));

  // Assuming getUserDetail is the type of the data returned from the query
  const { data: data1,refetch } = useGetDetailUserQuery(userId);
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
  const navigate = useNavigate();
  const [markAsRead] = useMarkNotiReadMutation()
  const takingNew = useSelector<any>(s => s.notification.takingNew) as boolean
  var data = []

  const dispatch = useDispatch();
  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }else {
      console.error("User ID không tồn tại.");
    }
  };
  const {
    data: notificaitionData,
    refetch: refetchNoti,
  } = useGetListNotificationUserQuery({
    userId : Number(userId)
  });
  data = notificaitionData as NotificationType[];
  // console.log(notificaitionData as NotificationType[])

  
  var notiCount = data?.filter(s => s.readStatus == false)
  
  useEffect(()=>{
    if(data?.length > 0 && takingNew){
      toast("Bạn có thông báo mới")
      refetchNoti()
    }
    refetch();
    dispatch(reloadNoti())
  },[takingNew])
  const items: MenuProps['items'] = [
  ];
  const handleReadNotification = (id : string, isRead : boolean) =>{
    if(!isRead){
      markAsRead({notificationUserId : Number(id)}).then(() => {
        refetchNoti()
      })
      dispatch(reloadNoti())
    }

  } 
  if(data){
    var reverseArray = [...data]
    reverseArray.reverse().slice(0,10).forEach((element, index )=> {
      items.push({
        key: index,
        label: (
          <div className="inline-flex">
            <a style={{fontWeight: `${element.readStatus == true ? "lighter": "bold"}
              
              `}} onClick={() => handleReadNotification(element.notificationUserID, element.readStatus)} rel="noopener noreferrer" href="#">
            {element.notification.title}
            <p style={{fontWeight: "lighter"}}>{element.notification.content}</p>
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
                src={data1?.image || DefaultUserImage}
                alt="User"
              />
              <div className="ml-3">
                <h1 className="text-sm font-medium text-white">
                  {data1?.fullName}
                </h1>
                <h2 className="text-xs text-gray-300">
                  {getRoleDisplayName(data1?.role.roleName)}
                </h2>
                <h2 className="text-xs text-gray-300">
                  {data1?.department?.departmentName}
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

          {/* // button set thu phong navbar */}
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
