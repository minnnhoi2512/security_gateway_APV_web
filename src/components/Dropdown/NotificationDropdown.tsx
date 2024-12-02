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

  const items: MenuProps["items"] = [];
  if (notificaitionData) {
    const reverseArray = [...notificaitionData].reverse().slice(0, 8);
    reverseArray.forEach((element, index) => {
      const isRead = element.readStatus;
      items.push({
        key: index,
        label: (
          <div
            key={index}
            className={`flex items-center p-3 border-b border-gray-200 cursor-pointer ${
              isRead ? "bg-gray-100" : "bg-blue-300"
            }`}
            onClick={() =>
              handleReadNotification(
                element,
                element.notificationUserID,
                element.readStatus
              )
            }
          >
            <Avatar src={element.senderAvatar} size="large" className="mr-3" />
            <div className="flex-grow">
              <Text
                strong
                className={`block text-lg ${
                  isRead ? "text-gray-500" : "text-black"
                }`}
              >
                {element.senderName}
              </Text>
              <Text
                className={`block ${isRead ? "text-gray-500" : "text-black"}`}
              >
                {element.notification.title}
              </Text>
              <Text
                type="secondary"
                className={`block text-sm ${
                  isRead ? "text-gray-600" : "text-black"
                }`}
              >
                {element.notification.content}
              </Text>
              <Text
                type="secondary"
                className={`block text-xs ${
                  isRead ? "text-gray-400" : "text-black"
                }`}
              >
                {moment(element.notification.sentDate).fromNow()}
              </Text>
            </div>
          </div>
        ),
      });
    });
  }
  return (
    <Dropdown menu={{ items }} trigger={["click"]} overlayClassName="pt-1">
    <a onClick={(e) => e.preventDefault()}>
      <Space>
        <Badge
          count={
            notificaitionData?.filter(
              (notification: any) => !notification.readStatus
            ).length
          }
          offset={[-5, -5]}  
          size="small"       
          style={{
            marginTop: 5,
            backgroundColor: '#ff4d4f',  
            color: 'white',
            fontSize: 10,
          }}
        >
          <button>
            <BellFilled
              style={{
                color: "#FFD700",  
                fontSize: 23,
  
              }}
            />
          </button>
        </Badge>
      </Space>
    </a>
  </Dropdown>
  );
};

export default NotificationDropdown;
