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
import ScheduleUserDetailModal from "../../components/Modal/ScheduleUserDetailModal";

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

  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const navigate = useNavigate();
  //Nhật
  const {
    data: schedules,
    isLoading,
    isFetching,
    error,
    refetch   
  } = useGetSchedulesUserByStatusQuery({
    pageNumber: 1,
    pageSize: 100,
    userId: Number(userId),
    status: statusFilter,
  });
  

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
  // useEffect(() => {
  //   console.log(statusFilter);
  //   console.log(schedules);
  // }, [statusFilter]);

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
              onClick={() => { setStatusFilter("Assigned"); }}
            >
              Đang chờ xử lý
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => { setStatusFilter("Pending"); }}
            >
              Đang chờ duyệt
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => { setStatusFilter("Approved"); }}
            >
              Đã chấp nhận
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => { setStatusFilter("Rejected"); }}
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
          isLoading={isLoading || isFetching}
          onRowClick={handleRowClick}
          error={error}
        />
        <ScheduleUserDetailModal
          isVisible={isModalVisible}
          handleClose={handleModalClose}
          selectedRecord={selectedRecord}
          refetch={refetch}
        />


      </Content>
    </Layout>
  );
};

export default ScheduleAssignedManager;
