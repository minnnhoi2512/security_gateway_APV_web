import {
  Layout,
  Button,
  Table,
  Input,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Row,
  Col,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import moment from "moment";
import type { ColumnsType } from "antd/es/table";

import {
  useDeleteScheduleMutation,
  useAssignScheduleMutation,
} from "../services/schedule.service";
//import { useGetListUsersByDepartmentIdQuery } from "../services/user.service";
import ScheduleType from "../types/scheduleType";
//import UserType from "../types/userType";
import { useGetSchedulesUserByStatusQuery } from "../services/scheduleUser.service";


const { Content } = Layout;

const ScheduleAssignedManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userId = Number(localStorage.getItem("userId"));
  const [assignData, setAssignData] = useState({
    title: "",
    description: "",
    note: "",
    deadlineTime: "",
    scheduleId: 0,
    assignToId: 0,
    assignFromId: parseInt(localStorage.getItem("userId") || "0"),
  });

  const [searchText, setSearchText] = useState<string>("");

  const navigate = useNavigate();

  const { data: scheduleUser, } = useGetSchedulesUserByStatusQuery({
    status: "assigned",
    userId: userId,
    pageNumber: -1,
    pageSize: -1,
  });
  console.log("Scheduleuser test: ", scheduleUser);

  // const { data: users = [], isLoading: usersLoading } =
  //   useGetListUsersByDepartmentIdQuery({
  //     departmentId: departmentIdUser,
  //     pageNumber: 1,
  //     pageSize: 100,
  //   });
  // console.log(users);
  const [deleteSchedule] = useDeleteScheduleMutation();
  const [assignSchedule] = useAssignScheduleMutation();

  const handleDeleteSchedule = (scheduleId: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa dự án này?",
      okText: "Có",
      cancelText: "Không",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteSchedule(scheduleId).unwrap();
          message.success("Dự án đã được xóa thành công!");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa dự án.");
        }
      },
    });
  };

  const handleAssignUser = (scheduleId?: number) => {
    if (!scheduleId) {
      message.error("Lỗi: Không tìm thấy ID dự án.");
      return;
    }
    setAssignData((prev) => ({ ...prev, scheduleId }));
    setIsModalVisible(true);
  };

  // const handleDateChange = (date: moment.Moment | null) => {
  //   setAssignData((prev) => ({
  //     ...prev,
  //     deadlineTime: date ? date.toISOString() : "",
  //   }));
  // };

  // const handleAssignSubmit = async () => {
  //   try {
  //     const payload = { ...assignData };
  //     // console.log("Payload gửi:", payload); // Kiểm tra payload
  //     await assignSchedule(payload).unwrap();
  //     message.success("Phân công thành công!");
  //     setIsModalVisible(false);
  //   } catch (error) {
  //     message.error("Có lỗi xảy ra khi phân công.");
  //   }
  // };

  const columns: ColumnsType<ScheduleType> = [
    {
      title: "Tiêu đề",
      dataIndex: "scheduleName",
      key: "scheduleName",
      align: "center",
      sorter: (a, b) => a.scheduleName?.localeCompare(b.scheduleName),
    },
    {
      title: "Loại",
      dataIndex: "scheduleType",
      key: "scheduleType",
      align: "center",
      render: (text) => {
        const scheduleTypeName = text.scheduleTypeName;
        let tagColor = "default"; // Default color

        switch (scheduleTypeName) {
          case "VisitDaily":
            return <Tag color="blue">Theo ngày</Tag>;
          case "ProcessWeek":
            return <Tag color="green">Theo tuần</Tag>;
          case "ProcessMonth":
            return <Tag color="orange">Theo tháng</Tag>;
          default:
            return <Tag color={tagColor}>{scheduleTypeName}</Tag>; // Fallback if needed
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
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
            onClick={() => navigate(`/detailSchedule/${record.scheduleId}`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSchedule(record.scheduleId!)}
          />
          <Button
            type="text"
            icon={<UserAddOutlined />}
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleAssignUser(record.scheduleId)}
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
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-500"
              onClick={() => navigate("/createNewSchedule")}
            >
              Tạo mới dự án
            </Button>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={scheduleUser || []}
          rowKey="scheduleId"
          //loading={isLoading}
          pagination={{
            //total: schedules?.totalCount || 0,
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

export default ScheduleAssignedManager;

// <Modal
//   title="Phân công nhân viên"
//   visible={isModalVisible}
//   onCancel={() => setIsModalVisible(false)}
//   footer={[
//     <Button key="cancel" onClick={() => setIsModalVisible(false)}>
//       Hủy
//     </Button>,
//     <Button key="submit" type="primary" onClick={handleAssignSubmit}>
//       Phân công
//     </Button>,
//   ]}
// >
//   <Form layout="vertical">
//     <Form.Item label="Tiêu đề">
//       <Input
//         value={assignData.title}
//         onChange={(e) =>
//           setAssignData((prev) => ({ ...prev, title: e.target.value }))
//         }
//       />
//     </Form.Item>
//     <Form.Item label="Miêu tả">
//       <Input
//         value={assignData.description}
//         onChange={(e) =>
//           setAssignData((prev) => ({
//             ...prev,
//             description: e.target.value,
//           }))
//         }
//       />
//     </Form.Item>
//     <Form.Item label="Ghi chú">
//       <Input
//         value={assignData.note}
//         onChange={(e) =>
//           setAssignData((prev) => ({ ...prev, note: e.target.value }))
//         }
//       />
//     </Form.Item>
//     <Form.Item label="Thời hạn">
//       <DatePicker
//         onChange={handleDateChange}
//         style={{ width: "100%" }}
//         format="DD/MM/YYYY"
//       />
//     </Form.Item>
//     <Form.Item label="Chọn nhân viên">
//       <Select
//         placeholder="Chọn nhân viên"
//         onChange={(value) =>
//           setAssignData((prev) => ({ ...prev, assignToId: value }))
//         }
//         //loading={usersLoading}
//       >
//         {/* {users.map((user: UserType) => (
//           <Option key={user.userId} value={user.userId}>
//             {user.fullName}
//           </Option>
//         ))} */}
//       </Select>
//     </Form.Item>
//   </Form>
// </Modal>