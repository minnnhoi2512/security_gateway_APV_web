// import {
//   Layout,
//   Button,
//   Table,
//   Input,
//   Tag,
//   Modal,
//   Form,
//   Select,
//   DatePicker,
//   message,
//   Row,
//   Col,
//   Divider,
// } from "antd";
// import {
//   SearchOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   UserAddOutlined,
//   PlusOutlined,
// } from "@ant-design/icons";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import moment from "moment";
// import type { ColumnsType } from "antd/es/table";

// import {
//   useGetListScheduleQuery,
//   useDeleteScheduleMutation,
//   useAssignScheduleMutation,
// } from "../services/schedule.service";
// import { useGetListUsersByDepartmentIdQuery } from "../services/user.service";
// import ScheduleType from "../types/scheduleType";
// import UserType from "../types/userType";

// const { Content } = Layout;
// const { Option } = Select;

// const ScheduleManager = () => {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const location = useLocation();
//   const userRole = localStorage.getItem("userRole");
//   const departmentId = Number(localStorage.getItem("departmentId"));
//   const { statusCreate } = location.state || {};
//   const [assignData, setAssignData] = useState({
//     title: "",
//     description: "",
//     note: "",
//     deadlineTime: "",
//     scheduleId: 0,
//     assignToId: 0,
//     assignFromId: parseInt(localStorage.getItem("userId") || "0"),
//   });

//   const [searchText, setSearchText] = useState<string>("");

//   const navigate = useNavigate();

//   let data = null; // Initialize data to null
//   let refetch = null; // Initialize refetch to null

//   // Fetch users if the role is 'DepartmentManager'
//   if (userRole === "DepartmentManager") {
//     const { data: users = [], isLoading: usersLoading } =
//       useGetListUsersByDepartmentIdQuery({
//         departmentId: departmentId,
//         pageNumber: -1,
//         pageSize: -1,
//       });

//     // You can use users here if needed
//     data = users; // Assign fetched users to data
//   } else {
//     // Fetch schedules for other roles
//     const {
//       data: schedules,
//       refetch: scheduleRefetch,
//     } = useGetListScheduleQuery({
//       pageNumber: -1,
//       pageSize: -1,
//     });

//     data = schedules; // Assign fetched schedules to data
//     refetch = scheduleRefetch; // Assign refetch function to refetch
//   }

//   useEffect(() => {
//     if (statusCreate) {
//       // Refetch data based on the statusCreate value
//       refetch();
//     }
//   }, [statusCreate, refetch]);
//   const [deleteSchedule] = useDeleteScheduleMutation();
//   const [assignSchedule] = useAssignScheduleMutation();

//   const handleDeleteSchedule = (scheduleId: number) => {
//     Modal.confirm({
//       title: "Xác nhận xóa",
//       content: "Bạn có chắc chắn muốn xóa dự án này?",
//       okText: "Có",
//       cancelText: "Không",
//       okType: "danger",
//       onOk: async () => {
//         try {
//           await deleteSchedule(scheduleId).unwrap();
//           message.success("Dự án đã được xóa thành công!");
//           refetch();
//         } catch (error) {
//           message.error("Có lỗi xảy ra khi xóa dự án.");
//         }
//       },
//     });
//   };

//   const handleAssignUser = (scheduleId?: number) => {
//     if (!scheduleId) {
//       message.error("Lỗi: Không tìm thấy ID dự án.");
//       return;
//     }
//     setAssignData((prev) => ({ ...prev, scheduleId }));
//     setIsModalVisible(true);
//   };

//   const handleDateChange = (date: moment.Moment | null) => {
//     setAssignData((prev) => ({
//       ...prev,
//       deadlineTime: date ? date.toISOString() : "",
//     }));
//   };

//   const handleAssignSubmit = async () => {
//     try {
//       const payload = { ...assignData };
//       console.log("Payload gửi:", payload); // Kiểm tra payload
//       await assignSchedule(payload).unwrap();
//       message.success("Phân công thành công!");
//       setIsModalVisible(false);
//       refetch();
//     } catch (error) {
//       message.error("Có lỗi xảy ra khi phân công.");
//     }
//   };

//   const columns: ColumnsType<ScheduleType> = [
//     {
//       title: "Tiêu đề",
//       dataIndex: "scheduleName",
//       key: "scheduleName",
//       align: "center",
//       sorter: (a, b) => a.scheduleName.localeCompare(b.scheduleName),
//     },
//     {
//       title: "Kéo dài (ngày)",
//       dataIndex: "duration",
//       key: "duration",
//       align: "center",
//       sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
//       render: (duration: number) => `${duration} ngày`,
//     },
//     {
//       title: "Loại",
//       dataIndex: "scheduleType",
//       key: "scheduleType",
//       align: "center",
//       render: (text) => {
//         const scheduleTypeName = text.scheduleTypeName;
//         let tagColor = "default"; // Default color

//         switch (scheduleTypeName) {
//           case "DailyVisit":
//             return <Tag color="blue">Theo ngày</Tag>;
//           case "ProcessWeek":
//             return <Tag color="green">Theo tuần</Tag>;
//           case "ProcessMonth":
//             return <Tag color="orange">Theo tháng</Tag>;
//           default:
//             return <Tag color={tagColor}>{scheduleTypeName}</Tag>; // Fallback if needed
//         }
//       },
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "status",
//       key: "status",
//       align: "center",
//       render: (status: boolean) => (
//         <Tag color={status ? "green" : "red"}>
//           {status ? "Còn hiệu lực" : "Hết hiệu lực"}
//         </Tag>
//       ),
//     },
//     {
//       title: "Hành động",
//       key: "action",
//       align: "center",
//       render: (_, record) => (
//         <div className="flex justify-center space-x-2">
//           <Button
//             type="text"
//             icon={<EditOutlined />}
//             className="text-green-600 hover:text-green-800"
//             onClick={() => navigate(`/detailSchedule/${record.scheduleId}`)}
//           />
//           <Button
//             type="text"
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => handleDeleteSchedule(record.scheduleId!)}
//           />
//           <Button
//             type="text"
//             icon={<UserAddOutlined />}
//             className="text-blue-500 hover:text-blue-700"
//             onClick={() => handleAssignUser(record.scheduleId)}
//           />
//         </div>
//       ),
//     },
//   ];

//   return (
//     <Layout className="min-h-screen bg-gray-50">
//       <Content className="p-8">
//         <h1 className="text-3xl font-bold text-green-600 text-center mb-4">
//           Danh sách Dự án Công ty
//         </h1>
//         <Row justify="space-between" align="middle" className="mb-4">
//           <Col>
//             <Input
//               placeholder="Tìm kiếm theo tiêu đề"
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               prefix={<SearchOutlined />}
//               style={{ width: 300 }}
//             />
//           </Col>
//           <Col>
//             <Button
//               type="primary"
//               icon={<PlusOutlined />}
//               className="bg-blue-500"
//               onClick={() => navigate("/createNewSchedule")}
//             >
//               Tạo mới dự án
//             </Button>
//           </Col>
//         </Row>

//         <Divider />

//         <Table
//           columns={columns}
//           dataSource={schedules || []}
//           rowKey="scheduleId"
//           loading={isLoading}
//           pagination={{
//             total: schedules?.totalCount || 0,
//             showSizeChanger: true,
//             pageSizeOptions: ["5", "10", "20"],
//           }}
//           bordered
//           className="bg-white shadow-md rounded-lg"
//         />

//         <Modal
//           title="Phân công nhân viên"
//           visible={isModalVisible}
//           onCancel={() => setIsModalVisible(false)}
//           footer={[
//             <Button key="cancel" onClick={() => setIsModalVisible(false)}>
//               Hủy
//             </Button>,
//             <Button key="submit" type="primary" onClick={handleAssignSubmit}>
//               Phân công
//             </Button>,
//           ]}
//         >
//           <Form layout="vertical">
//             <Form.Item label="Tiêu đề">
//               <Input
//                 value={assignData.title}
//                 onChange={(e) =>
//                   setAssignData((prev) => ({ ...prev, title: e.target.value }))
//                 }
//               />
//             </Form.Item>
//             <Form.Item label="Miêu tả">
//               <Input
//                 value={assignData.description}
//                 onChange={(e) =>
//                   setAssignData((prev) => ({
//                     ...prev,
//                     description: e.target.value,
//                   }))
//                 }
//               />
//             </Form.Item>
//             <Form.Item label="Ghi chú">
//               <Input
//                 value={assignData.note}
//                 onChange={(e) =>
//                   setAssignData((prev) => ({ ...prev, note: e.target.value }))
//                 }
//               />
//             </Form.Item>
//             <Form.Item label="Thời hạn">
//               <DatePicker
//                 onChange={handleDateChange}
//                 style={{ width: "100%" }}
//                 format="DD/MM/YYYY"
//               />
//             </Form.Item>
//             <Form.Item label="Chọn nhân viên">
//               <Select
//                 placeholder="Chọn nhân viên"
//                 onChange={(value) =>
//                   setAssignData((prev) => ({ ...prev, assignToId: value }))
//                 }
//                 loading={usersLoading}
//               >
//                 {users.map((user: UserType) => (
//                   <Option key={user.userId} value={user.userId}>
//                     {user.fullName}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           </Form>
//         </Modal>
//       </Content>
//     </Layout>
//   );
// };

// export default ScheduleManager;
