import React from "react";
import { Layout, Table, Button, Row, Col, Input } from "antd";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate(); // For navigating back
  const { id } = useParams<{ id: string }>(); // Extract id from params
  const visitId: number | null = id ? parseInt(id, 10) : null; // Convert id to a number

  // Fetch data using the id from params
  const { data = [], isLoading } = useGetListDetailVisitQuery({
    visitId: visitId,
  });

  // Format date to DD/MM/YYYY
  const formatDate = (date: string) =>
    moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
  // Format time to HH:mm

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
      title: "Ngày dự kiến bắt đầu",
      dataIndex: "expectedStartDate",
      key: "expectedStartDate",
      render: (text: string) => <span>{formatDate(text)}</span>,
    },
    {
      title: "Ngày dự kiến kết thúc",
      dataIndex: "expectedEndDate",
      key: "expectedEndDate",
      render: (text: string) => <span>{formatDate(text)}</span>,
    },
    {
      title: "Thời gian ra - vào",
      key: "expectedTime",
    },
    {
      title: "Trạng thái",
      key: "status",
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

  if (isLoading) {
    return <div>Loading...</div>; // Optionally handle loading state
  }

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <h1 className="text-green-500 text-2xl font-bold mb-4 text-center">
          Chi tiết chuyến thăm
        </h1>
        {/* Redesigned layout for visit details */}
        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm flex items-start space-x-4">
              <CalendarOutlined className="text-blue-500 text-2xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Ngày đăng ký:</p>
                <p className="text-base font-semibold text-gray-800">
                  {formatDate(data.dateRegister)}
                </p>
                <p className="text-sm text-gray-600">Lịch di chuyển:</p>
                <p className="text-base font-semibold text-gray-800">
                  {data.daysOfProcess}
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
                  {data.visitQuantity}
                </p>
              </div>
            </div>
          </Col>
        </Row>
        {/* Enhanced Search Input without border */}
        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm theo họ và tên"
            style={{
              width: 300,
              borderRadius: "5px",
              border: "none", // Removed border for a cleaner look
              boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)", // Optional shadow for subtle depth
            }}
            enterButton={<SearchOutlined />}
            size="large"
            className="shadow-sm"
          />
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          rowKey="visitorName"
          bordered
        />
        {/* Back button */}
        <div className="mt-6">
          <Button
            type="default"
            onClick={() => navigate(-1)} // Navigates back to the previous page
            className="bg-gray-200 text-black hover:bg-gray-300"
          >
            Quay lại
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default DetailCustomerVisit;
