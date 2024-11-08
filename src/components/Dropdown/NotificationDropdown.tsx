// src/components/NotificationDropdown.tsx
import React, { useEffect } from 'react';
import { Dropdown, Space, Badge, Avatar, Typography } from 'antd';
import { MenuProps } from 'antd/lib';
import { useGetListNotificationUserQuery, useMarkNotiReadMutation } from '../../services/notification.service';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import moment from 'moment';
const { Text } = Typography;

interface NotificationDropdownProps { }

const NotificationDropdown: React.FC<NotificationDropdownProps> = () => {
    const [markAsRead] = useMarkNotiReadMutation();
    const userId = Number(localStorage.getItem("userId"));
    const takingNew = useSelector<any, boolean>(s => s.notification.takingNew);
    const {
        data: notificaitionData,
        refetch: refetchNoti,
    } = useGetListNotificationUserQuery({
        userId: Number(userId)
    });

    useEffect(() => {
        if (notificaitionData?.length > 0 && takingNew) {
            toast("Bạn có thông báo mới");
            refetchNoti();
        }
    }, [takingNew, notificaitionData, refetchNoti]);

    const handleReadNotification = (id: string, isRead: boolean) => {
        console.log("Marked as read",isRead);
        if (!isRead) {
            markAsRead({ notificationUserId: Number(id) }).then(() => {
                refetchNoti();
            });
        }
    };

    const items: MenuProps['items'] = [];
    if (notificaitionData) {
        const reverseArray = [...notificaitionData].reverse().slice(0, 10);
        reverseArray.forEach((element, index) => {
            items.push({
                key: index,
                label: (
                    <div
                        key={index}
                        className="flex items-center p-3 border-b border-gray-200 cursor-pointer"
                        onClick={() => handleReadNotification(element.notificationUserID, element.readStatus)}
                    >
                        <Avatar src={element.senderAvatar} size="large" className="mr-3" />
                        <div className="flex-grow">
                            <Text strong className="block text-lg">{element.senderName}Oke oke</Text>
                            <Text className="block text-gray-500">{element.notification.title}</Text>
                            <Text type="secondary" className="block text-sm text-gray-600">{element.notification.content}</Text>
                            <Text type="secondary" className="block text-xs text-gray-400">
                                {moment(element.notification.sentDate).fromNow()}
                            </Text>
                        </div>
                    </div>
                ),
            });
        });
    }

    return (
        <Dropdown menu={{ items }} trigger={['click']} overlayClassName="pt-1">
            <a onClick={(e) => e.preventDefault()}>
                <Space>
                    <Badge count={10}>
                        <button><Avatar shape="circle" size="default" src="/src/assets/iconNoti.png" /></button>
                    </Badge>
                </Space>
            </a>
        </Dropdown>
    );
};

export default NotificationDropdown;