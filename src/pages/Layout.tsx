import React, { useEffect, useState } from "react";
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
import { ChevronRight } from "lucide-react";
import { getToken } from "../utils/jwtToken";

const { Sider, Content } = Layout;

const findRouteName = (url: string, routes: any): string => {
  if (url.startsWith("/profile/")) {
    return "Thông tin cá nhân";
  }

  // if (url.includes("/detailVisit")) {
  //   return "Chi tiết chuyến thăm";
  // }

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

  const uniqueItems: { path: string; name: string }[] = [];

  pathSnippets.forEach((snippet, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
    const routeName = findRouteName(url, routes);

    if (!isNaN(Number(snippet))) {
      return;
    }

    if (
      uniqueItems.length === 0 ||
      uniqueItems[uniqueItems.length - 1].name !== routeName
    ) {
      uniqueItems.push({ path: url, name: routeName || snippet });
    }
  });

  const breadcrumbItems = uniqueItems.map((item, index) => {
    const isLast = index === uniqueItems.length - 1;

    const baseStyles =
      "transition-all duration-200 rounded-md px-3 py-1.5 font-medium";
    const activeStyles = "text-blue-600 bg-blue-50 font-bold";
    const inactiveStyles = "text-gray-600 hover:text-blue-600 hover:bg-blue-50";

    return {
      title: isLast ? (
        <span className={`${baseStyles} ${activeStyles}`}>{item.name}</span>
      ) : (
        <Link to={item.path} className={`${baseStyles} ${inactiveStyles}`}>
          {item.name}
        </Link>
      ),
    };
  });

  return [
    {
      title: (
        <Link
          to="/dashboard"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-all duration-200
                     hover:bg-blue-50 p-2 rounded-md"
        >
          <HomeOutlined className="w-5 h-5" />
        </Link>
      ),
    },
    ...breadcrumbItems,
  ];
};

const StyledBreadcrumb = ({
  location,
  routes,
}: {
  location: any;
  routes: any;
}) => {
  const items = generateBreadcrumbItems(location, routes);

  return (
    <nav className="bg-white shadow-md px-4 py-3 mb-6">
      <div className="flex items-center flex-wrap gap-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-5 h-5 text-gray-400" />}
            <div className="flex items-center">{item.title}</div>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

const LayoutPage = ({ children }: { children: any }) => {
  const [collapsed, setCollapsed] = useState(false);

  const userId = Number(localStorage.getItem("userId"));
  const location = useLocation();
  const jwt = getToken();
  const navigate = useNavigate();
  useEffect(() => {
    if (!jwt) {
      navigate("/");
    }
  }, [jwt, navigate]);
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
  // const sharedBackgroundColor = "#1b347b";
  const sharedBackgroundColor = "#34495e";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <ToastContainer position="top-center" containerId="NotificationToast" />
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        style={{ backgroundColor: sharedBackgroundColor }}
        className="relative"
      >
        <div className="py-4 px-6 relative">
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined className="text-sm" />
              ) : (
                <MenuFoldOutlined className="text-sm" />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            className={`absolute -right-3 top-4 z-50 bg-white shadow-md hover:bg-gray-50 border border-gray-200
      ${collapsed ? "w-8 h-8 min-w-0 p-0" : "w-8 h-8 min-w-0 p-0"}`}
          />

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img
                className="w-10 h-10"
                src="https://vietnetco.vn/wp-content/uploads/2020/04/Secure-Web-Gateway-01-1024x844.png"
                alt="Logo"
              />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-white text-lg font-bold leading-tight">
                  SECURITY GATE
                </h1>
                <h2 className="text-gray-400 text-xs">APV System</h2>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="rounded-lg bg-[#2e4053] p-4 cursor-pointer hover:bg-slate-700/70 transition-colors shadow-xl relative">
              <div className="absolute -top-2 -right-2 z-10">
                <NotificationDropdown />
              </div>

              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                  src={userData?.image || DefaultUserImage}
                  alt="User"
                  onClick={handleProfileClick}
                />
                <div className="flex-1">
                  <h3 className="text-white text-sm font-medium">
                    {userData?.fullName}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {getRoleDisplayName(userData?.role.roleName)}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {userData?.department?.departmentName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <MenuNav />
      </Sider>

      {/* <Layout>
        <Content className="bg-white rounded shadow min-h-[80vh]">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <Breadcrumb items={breadcrumbItems} className="p-4  text-lg" />
          </div>
          {children}
        </Content>
      </Layout> */}
      <Layout>
        <Content className="bg-white rounded shadow min-h-[80vh]">
          <div className="sticky top-0 z-20 bg-white">
            <StyledBreadcrumb location={location} routes={routes} />
          </div>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
