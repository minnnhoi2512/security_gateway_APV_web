// src/components/NotificationDropdown.tsx
import React, { useEffect } from "react";
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

  useEffect(() => {
    if (notificaitionData?.length > 0 && takingNew) {
      toast("Bạn có thông báo mới");
      refetchNoti();
    }
  }, [takingNew, notificaitionData, refetchNoti]);
  

  

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
              Tất cả <span className="ml-1 text-xs text-gray-500">{notificaitionData.length}</span>
            </button>
            <button className="text-sm px-2 py-1 rounded hover:bg-gray-100 text-gray-500"><Users size={16}/></button>
            <button className="text-sm px-2 py-1 rounded hover:bg-gray-100 text-gray-500"><Expand size={16}/></button>
          </div>
        </div>
      </div>
  
      <div className="overflow-y-auto max-h-[480px] py-2">
        {[...notificaitionData].reverse().slice(0, 8).map((element, index) => (
          <div
            key={index}
            onClick={() => handleReadNotification(element, element.notificationUserID, element.readStatus)}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer group"
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
                  <span className="text-sm text-gray-900">{element.notification.title}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {element.notification.content}
                </p>
                {/* <div className="flex items-center gap-2">
                  {element.notification.notificationType?.name === 'Visit' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">Visit</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {moment(element.notification.sentDate).fromNow()}
                  </span>
                </div> */}
              </div>
            </div>
  
            {['Q3 Financials', 'Performance Reviews'].includes(element.notification?.title) && (
              <div className="mt-3 flex gap-2 pl-14">
                <button className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700">
                  Approve
                </button>
                <button className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                  Deny
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  ) : null;
  
  return (
    <Dropdown 
      menu={{ items: [{ key: 'notifications', label: notificationItems }] }}
      trigger={["click"]} 
      placement="bottomRight"
    >
      <Badge count={notificaitionData?.filter(n => !n.readStatus).length}>
        <BellFilled className="text-2xl text-yellow-400 cursor-pointer" />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
