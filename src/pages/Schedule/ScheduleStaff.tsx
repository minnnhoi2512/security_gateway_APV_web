import { Layout, Button, Table, Input, Tag, Row, Col, Divider } from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import { useGetListScheduleByStaffQuery } from "../../services/schedule.service";
const { Content } = Layout;

const ScheduleStaff = () => {
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  if (userRole !== "Staff") {
    return <div>This page is only for staff.</div>;
  }

  const [searchText, setSearchText] = useState<string>("");

  const navigate = useNavigate();
  const {
    data: schedules,
    isLoading,
  } = useGetListScheduleByStaffQuery({
    pageNumber: 1,
    pageSize: 10,
    staffId: Number(userId),
  });
  console.log(schedules);
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
      scheduleType : {
        scheduleTypeId : number,
        scheduleTypeName : string,
      }
    };
  }

  const columns: ColumnsType<ScheduleType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      align: "center",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Thời hạn hoàn thành",
      dataIndex: "deadlineTime",
      key: "deadlineTime",
      align: "center",
      render: (deadlineTime: string) => new Date(deadlineTime).toLocaleString(),
    },
    {
      title: "Loại chuyến thăm",
      dataIndex: "schedule",
      key: "schedule",
      align: "center",
      render: (schedule: any) => {
        // Check the schedule type and return the corresponding Tag
        switch (schedule.scheduleType.scheduleTypeName) {
          case "VisitDaily":
            return <Tag color="blue">Theo ngày</Tag>; // Blue tag for Daily Visit
          case "ProcessWeek":
            return <Tag color="green">Theo tuần</Tag>; // Green tag for Weekly Process
          case "ProcessMonth":
            return <Tag color="orange">Theo tháng</Tag>; // Orange tag for Monthly Process
          default:
            return <Tag color="red">Không xác định</Tag>; // Red tag for undefined
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
      render: (assignFrom: { fullName: string }) => assignFrom.fullName,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
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
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-4">
          Danh sách Dự án Công ty
        </h1>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Input
              placeholder="Tìm kiếm theo tiêu đề"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={schedules || []}
          rowKey="scheduleId"
          loading={isLoading}
          pagination={{
            total: schedules?.totalCount || 0,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          bordered
          className="bg-white shadow-md rounded-lg"
        />
      </Content>
    </Layout>
  );
};

export default ScheduleStaff;
