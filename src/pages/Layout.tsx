import React, { useEffect, useState } from "react";
import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined } from "@ant-design/icons";
import { Avatar, Badge, Breadcrumb, Button, Dropdown, Layout, Space } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "@fontsource/inter"; 
import MenuNav, { routes } from "../UI/MenuNav";
import { useGetDetailUserQuery } from "../services/user.service";
import DefaultUserImage from "../assets/default-user-image.png";
import NotificationDropdown from "../components/Dropdown/NotificationDropdown";
import { toast, ToastContainer } from "react-toastify";
import { useGetListNotificationUserQuery, useMarkNotiReadMutation } from "../services/notification.service";
import { useDispatch, useSelector } from "react-redux";
import NotificationType from "../types/notificationType";
import { reloadNoti } from "../redux/slices/notification.slice";
import { MenuProps } from "antd/lib";
import {
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { chatDB,message } from "../api/firebase";

const { Header, Sider, Content } = Layout;

const findRouteName = (path: string) => {
  for (const route of routes) {
    if (route.path === path) {
      return route.breadcrumbName;
    }
    if (route.children) {
      for (const child of route.children) {
        if (child.path === path) {
          return `${route.breadcrumbName} / ${child.breadcrumbName}`;
        }
      }
    }
  }
  return "";
};

const generateBreadcrumbItems = (location: any) => {
  const pathSnippets = location.pathname.split("/").filter((i: string) => i);
  const breadcrumbItems = pathSnippets.map((_: any, index: any) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    return {
      title: <Link to={url}>{findRouteName(url)}</Link>,
    };
  });
  return [{ title: <HomeOutlined /> }, ...breadcrumbItems];
};

const LayoutPage = ({ children }: { children: any }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Toggle for dark/light theme
  const userId = Number(localStorage.getItem("userId"));
  const userRole = localStorage.getItem("userRole");
  const location = useLocation();
  const [breadcrumbItems, setBreadcrumbItems] = useState(
    generateBreadcrumbItems(location)
  );
  const { data: userData } = useGetDetailUserQuery(userId);
  const { data: notifications } = useGetListNotificationUserQuery({
    userId: Number(userId),
  });
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
  const [markAsRead] = useMarkNotiReadMutation();
  const takingNew = useSelector<any>((s) => s.notification.takingNew) as boolean;
  var data = [];

  const dispatch = useDispatch();
  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      console.error("User ID không tồn tại.");
    }
  };
  const {
    data: notificaitionData,
    refetch: refetchNoti,
  } = useGetListNotificationUserQuery({
    userId: Number(userId),
  });
  data = notificaitionData as NotificationType[];
  // console.log(notificaitionData as NotificationType[])

  var notiCount = data?.filter((s) => s.readStatus == false);

  useEffect(() => {
    if (data?.length > 0 && takingNew) {
      toast("Bạn có thông báo mới");
      refetchNoti();
    }
    // refetch();
    dispatch(reloadNoti());
  }, [takingNew]);

  useEffect(() => {
    setBreadcrumbItems(generateBreadcrumbItems(location));
  }, [location]);

  useEffect(() => {
    const q = query(
      collection(chatDB, "messages"),
      where("participants", "array-contains", userId),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const messageData = change.doc.data();
          if (messageData.userId !== userId && !messageData.read) {
            toast.info(`New message from ${messageData.userRole} (User ${messageData.userId})`);
            updateDoc(change.doc.ref, { read: true });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [userId]);

  const items: MenuProps["items"] = [];
  const handleReadNotification = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead({ notificationUserId: Number(id) }).then(() => {
        refetchNoti();
      });
      dispatch(reloadNoti());
    }
  };
  if (data) {
    var reverseArray = [...data];
    reverseArray
      .reverse()
      .slice(0, 10)
      .forEach((element, index) => {
        items.push({
          key: index,
          label: (
            <div className="inline-flex">
              <a
                style={{
                  fontWeight: `${
                    element.readStatus == true ? "lighter" : "bold"
                  }`,
                }}
                onClick={() =>
                  handleReadNotification(
                    element.notificationUserID,
                    element.readStatus
                  )
                }
                rel="noopener noreferrer"
                href="#"
              >
                {element.notification.title}
                <p style={{ fontWeight: "lighter" }}>
                  {element.notification.content}
                </p>
              </a>
            </div>
          ),
        });
      });
  }
  const sharedBackgroundColor = "#34495e";

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
        <div className="flex flex-col items-center p-4 ">
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
              <h2 className="text-white text-sm ">APV</h2>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="px-4 py-2">
            <div
              onClick={handleProfileClick}
              className="flex items-center mb-4 cursor-pointer"
            >
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
          {/* // button set thu phong navbar */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-white"
            style={{ fontSize: "18px" }}
          />
          {/* <div className="top-0 right-20 absolute ">
            <Dropdown menu={{ items }} trigger={["click"]} overlayClassName="pt-1">
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <Badge count={notiCount?.length}>
                    <button>
                      <Avatar
                        shape="circle"
                        size="default"
                        src="/src/assets/iconNoti.png"
                      />
                    </button>
                  </Badge>
                </Space>
              </a>
            </Dropdown>
          </div> */}

          <Space>
            {/* Dark/Light Mode Toggle Icon */}
            <Button
              type="text"
              icon={<BulbOutlined style={{ color: isDarkTheme ? "#ffc107" : "#fff" }} />}
              onClick={() => setIsDarkTheme(!isDarkTheme)}
            />

            {/* Notification Dropdown */}
            {/* <Badge count={notiCount?.length}> */}
              <NotificationDropdown />
            {/* </Badge> */}
          </Space>
        </Header>
        <Breadcrumb items={breadcrumbItems} style={{ margin: "16px" }} />

      

        <Content className="m-6 p-6 bg-white rounded shadow min-h-[80vh]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;