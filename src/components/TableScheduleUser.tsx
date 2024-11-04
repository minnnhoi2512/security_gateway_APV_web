import React from "react";
import { Table, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/ultil";

interface ScheduleType {
    title: string;
    description: string;
    note: string;
    assignTime: string;
    deadlineTime: string;
    status: string;
    assignFrom: {
        userId: number;
        userName: string;
    };
    assignTo: {
        userId: number;
        userName: string;
    };
    schedule: {
        scheduleId: number;
        scheduleType: {
            scheduleTypeId: number;
            scheduleTypeName: string;
        };
    };
}

interface ScheduleTableProps {
    schedules: ScheduleType[];
    isLoading: boolean;
    totalCount: number;
    scheduleUserStatus: string;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedules, isLoading, totalCount, scheduleUserStatus }) => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole");
    console.log(scheduleUserStatus);
    const columns: ColumnsType<ScheduleType> = [
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
            align: "center",
        },
        {
            title: "Thời hạn hoàn thành",
            dataIndex: "deadlineTime",
            key: "deadlineTime",
            align: "center",
            render: (deadlineTime: string) => formatDate(deadlineTime),
        },
        {
            title: "Loại chuyến thăm",
            dataIndex: "schedule",
            key: "schedule",
            align: "center",
            render: (schedule: any) => {
                switch (schedule.scheduleType.scheduleTypeName) {
                    case "ProcessWeek":
                        return <Tag color="green">Theo tuần</Tag>;
                    case "ProcessMonth":
                        return <Tag color="orange">Theo tháng</Tag>;
                    default:
                        return <Tag color="red">Không xác định</Tag>;
                }
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status: string) => (
                <Tag color={status === "Assigned" ? "red" : "green"}>
                    {status === "Assigned" ? "Cần tạo danh sách" : "Đã tạo danh sách"}
                </Tag>
            ),
        },
        {
            title: "Người giao việc",
            dataIndex: "assignFrom",
            key: "assignFrom",
            align: "center",
            render: (assignFrom: any) => assignFrom.userName,
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => {
                if (userRole === "Staff") {
                    if (scheduleUserStatus === "All") {
                        if (record.status === "Assigned") {
                            return (
                                <div className="flex justify-center space-x-2">
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        className="text-green-600 hover:text-green-800"
                                        onClick={() =>
                                            navigate(`/detail-schedule-staff/${record.schedule.scheduleId}`, { state: record })
                                        }
                                    >
                                        Xem chi tiết
                                    </Button>
                                </div>
                            );
                        }else{
                            return null;
                        }
                    } else if (scheduleUserStatus === "Assigned" ) {
                        return (
                            <div className="flex justify-center space-x-2">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() =>
                                        navigate(`/detail-schedule-staff/${record.schedule.scheduleId}`, { state: record })
                                    }
                                />
                            </div>
                        );
                    } else if (scheduleUserStatus === "Rejected" ) {
                        return (
                           null
                        );
                    } else {
                        return null;
                    }
                } else {
                    return <text> Xu ly cua DM</text>;
                }
            },
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={schedules}
            rowKey={(record) => record.schedule.scheduleId}
            loading={isLoading}
            pagination={{
                total: totalCount,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10"],
            }}
            bordered
            className="bg-white shadow-md rounded-lg"
        />
    );
};

export default ScheduleTable;