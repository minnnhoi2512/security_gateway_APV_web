// src/components/NotificationDropdown.tsx
import React, { useEffect, useRef, useState } from "react";
import { Dropdown, Space, Badge, Avatar, Typography, Button } from "antd";
import { MenuProps } from "antd/lib";
import {
  useGetListNotificationUserQuery,
  useMarkNotiReadMutation,
} from "../../services/notification.service";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router";
import { BellFilled } from "@ant-design/icons";
import { Expand, Users } from "lucide-react";
const { Text } = Typography;

interface NotificationDropdownProps {}

const NotificationDropdown: React.FC<NotificationDropdownProps> = () => {
  const navigate = useNavigate();
  const [markAsRead] = useMarkNotiReadMutation();
  const userId = Number(localStorage.getItem("userId"));
  const takingNew = useSelector<any, boolean>((s) => s.notification.takingNew);
  const { data: notificaitionData, refetch: refetchNoti } =
    useGetListNotificationUserQuery({
      userId: Number(userId),
    });
  const [visibleNotifications, setVisibleNotifications] = useState(7);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const notificationListRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setVisibleNotifications(7);
  }, [notificaitionData]);

  useEffect(() => {
    if (notificaitionData?.length > 0 && takingNew) {
      toast("Bạn có thông báo mới");
      refetchNoti();
    }
  }, [takingNew, notificaitionData, refetchNoti]);

  useEffect(() => {
    if (notificaitionData?.length > 0 && takingNew) {
      toast("Bạn có thông báo mới");
      refetchNoti();
    }
  }, [takingNew, notificaitionData, refetchNoti]);

  // const handleViewMore = () => {
  //   setVisibleNotifications((prev) =>
  //     Math.min(prev + 7, notificaitionData?.length || 0)
  //   );
  //   setDropdownVisible(false);
  // };


  
 const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();  
    const prevHeight = notificationListRef.current?.scrollHeight || 0;
    setVisibleNotifications((prev) => Math.min(prev + 30, notificaitionData?.length || 0));
    
    setTimeout(() => {
      const newHeight = notificationListRef.current?.scrollHeight || 0;
      notificationListRef.current?.scrollTo({
        top: prevHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleReadNotification = (
    element: any,
    id: string,
    isRead: boolean
  ) => {
    if (!isRead) {
      markAsRead({ notificationUserId: Number(id) }).then(() => {
        refetchNoti();
      });
    }
    if (element.notification.notificationType.name === "Visit") {
      navigate(
        `/customerVisitStaff/detailVisit/${element.notification.action}`
      );
    }
    if (element.notification.notificationType.name === "ScheduleUser") {
      navigate(`/schedule-staff`);
    }
  };

  const notificationItems = notificaitionData ? (
    <div className="w-[400px] bg-white rounded-lg shadow-lg">
      <div className="border-b">
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="flex-1 flex gap-3">
            <button className="font-medium text-sm px-2 py-1 rounded hover:bg-gray-100 text-gray-900 bg-gray-50">
              Tất cả{" "}
              <span className="ml-1 text-xs text-gray-500">
                {notificaitionData.length}
              </span>
            </button>
            <button className="text-sm px-2 py-1 rounded hover:bg-gray-100 text-gray-500">
              <Users size={16} />
            </button>
            <button className="text-sm px-2 py-1 rounded hover:bg-gray-100 text-gray-500">
              <Expand size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[480px] py-2">
        {[...notificaitionData]
          .reverse()
          .slice(0, visibleNotifications)
          .map((element, index) => (
            <div
              key={index}
              onClick={() =>
                handleReadNotification(
                  element,
                  element.notificationUserID,
                  element.readStatus
                )
              }
              className={`
              px-4 py-3 
              cursor-pointer 
              group 
              ${
                !element.readStatus
                  ? "bg-blue-50 hover:bg-blue-100"
                  : "hover:bg-gray-50"
              }
            `}
            >
              <div className="flex gap-4">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className="relative">
                    <Avatar src={element.sender.image} size={40} />
                    {!element.readStatus && (
                      <span className="absolute -right-0.5 -top-0.5 w-3 h-3 bg-blue-600 rounded-full ring-2 ring-white" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-900 mt-1 text-center truncate w-full">
                    {element.sender.fullName}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-1">
                    <span className="text-sm text-gray-900 font-bold">
                      {element.notification.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {element.notification.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {moment(element.notification.sentDate).fromNow()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {visibleNotifications < (notificaitionData?.length || 0) && (
          <div className="text-center py-2 border-t">
            <button
              onClick={handleViewMore}
              className="text-sm text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full"
            >
              Xem thêm ({visibleNotifications}/{notificaitionData.length})
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <Dropdown
      menu={{ items: [{ key: "notifications", label: notificationItems }] }}
      trigger={["click"]}
      open={dropdownVisible}  
      onOpenChange={setDropdownVisible}  
      placement="bottomRight"
    >
      <Badge count={notificaitionData?.filter((n) => !n.readStatus).length || null}>
        <BellFilled className="text-2xl text-yellow-400 cursor-pointer" />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
