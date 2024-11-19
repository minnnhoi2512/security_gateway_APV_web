import { useEffect, useState } from "react";
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Layout } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "@fontsource/inter";
import MenuNav from "../UI/MenuNav";
import { useGetDetailUserQuery } from "../services/user.service";
import DefaultUserImage from "../assets/default-user-image.png";
import NotificationDropdown from "../components/Dropdown/NotificationDropdown";
import { toast, ToastContainer } from "react-toastify";
import {
  useGetListNotificationUserQuery,
  useMarkNotiReadMutation,
} from "../services/notification.service";
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
import "./layout.css";
import { chatDB } from "../api/firebase";
import { routes } from "../UI/routeConstants";

const { Sider, Content } = Layout;

const findRouteName = (url: string, routes: any): string => {
  for (const route of routes) {
    const routePath = route.path.replace(/:\w+/g, "[^/]+"); // Replace dynamic segments with regex
    const regex = new RegExp(`^${routePath}$`);

    if (regex.test(url)) {
      const match = url.match(regex);
      if (match && match.length > 1) {
        return match[1]; // Return the dynamic segment value
      }
      return route.breadcrumbName;
    }
    if (route.children) {
      const childRoute = findRouteName(url, route.children);
      if (childRoute) {
        return childRoute;
      }
    }
  }
  return "";
};

const generateBreadcrumbItems = (location: any, routes: any) => {
  const pathSnippets = location.pathname.split("/").filter((i: string) => i);
  const breadcrumbItems = pathSnippets.map((snippet: string, index: number) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    const routeName = findRouteName(url, routes);
    const isLast = index === pathSnippets.length - 1;
    return {
      title: isLast ? (
        <span className="breadcrumb-link-last">{routeName || snippet}</span>
      ) : (
        <Link to={url} className="breadcrumb-link">
          {routeName || snippet}
        </Link>
      ),
    };
  });
  return [
    {
      title: (
        <Link to="/dashboard" className="breadcrumb-link">
          <HomeOutlined />
        </Link>
      ),
    },
    ...breadcrumbItems,
  ];
};
const LayoutPage = ({ children }: { children: any }) => {
  const [collapsed, setCollapsed] = useState(false);
  const userId = Number(localStorage.getItem("userId"));
  const location = useLocation();
  const [breadcrumbItems, setBreadcrumbItems] = useState(
    generateBreadcrumbItems(location, routes)
  );
  const { data: userData } = useGetDetailUserQuery(userId);
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
  const takingNew = useSelector<any>(
    (s) => s.notification.takingNew
  ) as boolean;
  var data = [];

  const dispatch = useDispatch();
  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      console.error("User ID không tồn tại.");
    }
  };
  const { data: notificaitionData, refetch: refetchNoti } =
    useGetListNotificationUserQuery({
      userId: Number(userId),
    });
  data = notificaitionData as NotificationType[];
  // console.log(notificaitionData as NotificationType[])

  useEffect(() => {
    if (data?.length > 0 && takingNew) {
      toast("Bạn có thông báo mới");
      refetchNoti();
    }
    // refetch();
    dispatch(reloadNoti());
  }, [takingNew]);

  useEffect(() => {
    setBreadcrumbItems(generateBreadcrumbItems(location, routes));
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
            toast.info(
              `New message from ${messageData.userRole} (User ${messageData.userId})`
            );
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
        <div className="relative"></div>
        <div className="flex flex-col items-center mt-7">
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-center">
              <img
                className="w-[75px] h-[75px] mt-2"
                src="https://vietnetco.vn/wp-content/uploads/2020/04/Secure-Web-Gateway-01-1024x844.png"
                alt="Logo"
              />
              <Button
                style={{ zIndex: 200 }}
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-1 -right-4 shadow-2xl bg-white border-r border-2 shadow-[1px_1px_0px_0.5px_gray]"
              />
            </div>
            <div className="absolute top-1 left-7 mt-2">
              <NotificationDropdown />
            </div>
          </div>

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
            <div className="flex items-center mb-4 cursor-pointer">
              <img
                className="w-[40px] h-[40px] rounded-full"
                src={userData?.image || DefaultUserImage}
                alt="User"
                onClick={handleProfileClick}
              />
              <div className="ml-3 flex items-center justify-between w-full">
                <div>
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
            </div>
            <div className="border-t border-gray-400"></div>
          </div>
        )}

        <MenuNav />
      </Sider>
      <Layout>
        <Content className="bg-white rounded shadow min-h-[80vh]">
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 100, // Giá trị cao hơn các component khác
              backgroundColor: "white", // Đảm bảo nền trong suốt
              borderBottom: "1px solid #e0e0e0",
              marginBottom: "16px",
            }}
          >
            <Breadcrumb
              items={breadcrumbItems}
              style={{ margin: "7px", fontSize: "18px", paddingLeft: "16px" }}
            />
          </div>

          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
