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
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useDeleteScheduleMutation } from "../../services/schedule.service";
import { useAssignScheduleMutation, useGetSchedulesUserByStatusQuery } from "../../services/scheduleUser.service";
import { ScheduleUserType } from "../../types/ScheduleUserType";
import TableScheduleUser from "../../components/TableScheduleUser";
import { isEntityError, isFerchBaseQueryError } from "../../utils/helpers";

type FormError =
  |
  {
    [key in keyof ScheduleUserType]: string;
  }
  | null;


const { Content } = Layout;

const ScheduleAssignedManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScheduleUserType | null>(null);
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
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const navigate = useNavigate();
  //Nhật
  const {
    data: schedules,
    isLoading,
    isFetching,
    error,
  } = useGetSchedulesUserByStatusQuery({
    pageNumber: 1,
    pageSize: 10,
    userId: Number(userId),
    status: statusFilter,
  });
  console.log("scheduleUserData", schedules);

  const handleRowClick = (record: ScheduleUserType) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
    //console.log(record);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };
  // const errorForm: FormError = useMemo(() => {
  //   if (isEntityError(error)) {
  //     return error.data.error as FormError;
  //   }
  //   return null;
  // }, [error]);
  // console.log(errorForm);
  useEffect(() => {
    console.log(statusFilter);
    console.log(schedules);
  }, [statusFilter]);

  // const { data: users = [], isLoading: usersLoading } =
  //   useGetListUsersByDepartmentIdQuery({
  //     departmentId: departmentIdUser,
  //     pageNumber: 1,
  //     pageSize: 100,
  //   });
  // console.log(users);

  const [deleteSchedule] = useDeleteScheduleMutation();

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



  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-4">
          Danh sách Dự án Công ty
        </h1>
        <Row>
          <Col>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => { setStatusFilter("All"); }}
            >
              Tất cả
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => { setStatusFilter("Pendding"); }}
            >
              Đang chờ
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => { setStatusFilter("Approve"); }}
            >
              Đã chấp nhận
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => { setStatusFilter("Reject"); }}
            >
              Đã từ chối
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => { setStatusFilter("Cancel"); }}
            >
              Đã hủy
            </Button>
          </Col>
        </Row>
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

        <TableScheduleUser
          data={schedules}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          error={"fdsfas"}
        />
        <Modal
          title="Chi tiết lịch trình"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Đóng
            </Button>,
          ]}
        >
          {selectedRecord && (
            <div>
              <p><strong>Tiêu đề:</strong> {selectedRecord.title}</p>
              <p><strong>Mô tả:</strong> {selectedRecord.description}</p>
              <p><strong>Ghi chú:</strong> {selectedRecord.note}</p>
              <p><strong>Thời gian giao:</strong> {new Date(selectedRecord.assignTime).toLocaleString()}</p>
              <p><strong>Thời hạn hoàn thành:</strong> {new Date(selectedRecord.deadlineTime).toLocaleString()}</p>
              <p><strong>Trạng thái:</strong> {selectedRecord.status}</p>
              <p><strong>Người giao việc:</strong> {selectedRecord.assignFrom.userName}</p>
              <p><strong>Người nhận việc:</strong> {selectedRecord.assignTo.userName}</p>
              <p><strong>Tên lịch trình:</strong> {selectedRecord.schedule.scheduleName}</p>
              <p><strong>Loại lịch trình:</strong> {selectedRecord.schedule.scheduleType.scheduleTypeName}</p>
            </div>
          )}
        </Modal>


      </Content>
    </Layout>
  );
};

export default ScheduleAssignedManager;
