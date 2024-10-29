import React, { useState } from "react";
import { Layout, Table, Button, Row, Col, Input, Tag } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CalendarOutlined,
  TeamOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment-timezone";
import { useGetListDetailVisitQuery } from "../services/visitDetailList.service";

const { Content } = Layout;
const { Search } = Input;

const DetailCustomerVisit: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false); // Toggle view/edit mode
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const visitId: number | null = id ? parseInt(id, 10) : null;
  const location = useLocation();
  const visit = location.state.record;

  const { data = [], isLoading } = useGetListDetailVisitQuery({
    visitId: visitId,
  });

  const formatDate = (date: string) =>
    moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

  const handleToggleMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const handleAddGuest = () => {
    console.log("Add guest functionality triggered");
    // Implement the add guest logic here
  };

  const handleUpdate = () => {
    console.log("Update functionality triggered");
    // Implement the update logic here
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: ["visitor", "visitorName"],
      key: "visitorName",
    },
    {
      title: "Công ty",
      dataIndex: ["visitor", "companyName"],
      key: "companyName",
    },
    {
      title: "Giờ vào dự kiến",
      dataIndex: "expectedStartHour",
      key: "expectedStartHour",
    },
    {
      title: "Giờ ra dự kiến",
      dataIndex: "expectedEndHour",
      key: "expectedEndHour",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Button
          size="middle"
          onClick={() => console.log("Kiểm tra người dùng")}
        >
          Kiểm tra người dùng
        </Button>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <h1 className="text-green-500 text-2xl font-bold mb-4 text-center">
          Chi tiết chuyến thăm
        </h1>
        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm flex items-start space-x-4">
              <CalendarOutlined className="text-blue-500 text-2xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Ngày đăng ký:</p>
                <p className="text-base font-semibold text-gray-800">
                  {formatDate(visit.createTime)}
                </p>
                <p className="text-sm text-gray-600">Lịch di chuyển:</p>
                <p className="text-base font-semibold text-gray-800">
                  {formatDate(visit.expectedStartTime)} -{" "}
                  {formatDate(visit.expectedEndTime)}
                </p>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm flex items-start space-x-4">
              <TeamOutlined className="text-blue-500 text-2xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Loại chuyến thăm:</p>
                <p className="text-base font-semibold text-gray-800">
                  {data.visitType}
                </p>
                <p className="text-sm text-gray-600">
                  Số lượng người tham gia:
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {visit.visitQuantity}
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm theo họ và tên"
            style={{
              width: 300,
              borderRadius: "5px",
              border: "none",
              boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
            }}
            enterButton={<SearchOutlined />}
            size="large"
            className="shadow-sm"
          />
          {/* Mode Toggle Button */}
          <Button
            type="primary"
            onClick={handleToggleMode}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            {isEditMode ? "Xem" : "Chỉnh sửa"}
          </Button>

          {isEditMode && (
            <div className="flex space-x-4">
              {/* Add Guest Button */}
              <Button
                type="default"
                onClick={handleAddGuest}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Thêm khách
              </Button>

              {/* Update Button */}
            </div>
          )}
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          rowKey="visitDetailId"
          bordered
          loading={isLoading}
        />
        <div className="mt-6 flex justify-between">
          {/* Back button */}
          <Button
            type="default"
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-black hover:bg-gray-300"
          >
            Quay lại
          </Button>
          {isEditMode && (
            <Button
              type="default"
              onClick={handleUpdate}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Cập nhập
            </Button>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default DetailCustomerVisit;
