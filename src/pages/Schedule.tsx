import { Layout, Button, Table, Input, Tag, Modal, message } from "antd";
import { useState } from "react";
import {
  useGetListScheduleQuery,
  useDeleteScheduleMutation,
} from "../services/schedule.service";
import ScheduleType from "../types/scheduleType";
import { useNavigate } from "react-router-dom";
const { Content } = Layout;

const ScheduleManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  if (userId === null) return;

  const { data, refetch } = useGetListScheduleQuery({
    pageNumber: -1,
    pageSize: -1,
  });
  console.log(data);
  const [deleteSchedule] = useDeleteScheduleMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCreateSchedule = () => {
    navigate("/createNewSchedule");
  };

  const handleEditSchedule = (record: ScheduleType) => {
    navigate("/detailSchedule", { state: { selectedSchedule: record } });
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa dự án này?",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await deleteSchedule(scheduleId).unwrap();
          message.success("Dự án đã được xóa thành công!");
          refetch();
        } catch (error) {
          message.error("Đã xảy ra lỗi khi xóa dự án.");
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "scheduleName",
      key: "scheduleName",
      sorter: (a: ScheduleType, b: ScheduleType) =>
        a.scheduleName.localeCompare(b.scheduleName),
      render: (text: any) => <div className="flex items-center">{text}</div>,
    },
    {
      title: "Kéo dài",
      dataIndex: "duration",
      key: "duration",
      render: (text: any) => (
        <div className="flex items-center">{text} ngày</div>
      ),
    },
    {
      title: "Miêu tả",
      dataIndex: "description",
      key: "description",
      render: (text: any) => <div className="flex items-center">{text}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ScheduleType) => (
        <>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600 mr-2"
            onClick={() => handleEditSchedule(record)}
          >
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDeleteSchedule(record.scheduleId || 0)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="p-6">
          <div className="flex justify-center mb-4">
            <h1 className="text-green-500 text-2xl font-bold">
              Danh sách dự án công ty
            </h1>
          </div>
          <Button
            type="primary"
            className="mb-4 bg-blue-500 hover:bg-blue-600"
            onClick={handleCreateSchedule}
          >
            Tạo mới dự án
          </Button>
          <Input
            placeholder="Tìm kiếm theo tiêu đề"
            value={searchText}
            onChange={handleSearchChange}
            style={{ marginBottom: 16, width: 300 }}
          />
          <Table
            columns={columns}
            dataSource={data} // Assuming data contains schedules
            pagination={{
              total: data?.totalCount, // Assuming totalCount is provided in the response
            }}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ScheduleManager;
