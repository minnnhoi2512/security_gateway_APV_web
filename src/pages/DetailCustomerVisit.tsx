import React, { useState } from "react";
import { Layout, Table, Button, Row, Col, Tag, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, TeamOutlined, SearchOutlined } from "@ant-design/icons";
import moment from "moment-timezone";

const { Content } = Layout;
const { Search } = Input;

interface Visitor {
  visitorName: string;
  companyName: string;
}

interface VisitDetail {
  visitor: Visitor;
  expectedStartDate: string;
  expectedEndDate: string;
  expectedStartTime: string;
  expectedEndTime: string;
  status: string;
}

// Generate More Fake Data for Pagination
const generateFakeData = (count: number): VisitDetail[] => {
  const statuses = ["Còn hiệu lực", "Hết hiệu lực", "Hủy"];
  const companies = ["Công ty A", "Công ty B", "Công ty C"];
  const names = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"];
  const data: VisitDetail[] = [];

  for (let i = 0; i < count; i++) {
    data.push({
      visitor: {
        visitorName: `${names[i % names.length]} ${i}`,
        companyName: companies[i % companies.length],
      },
      expectedStartDate: `2024-09-${25 + (i % 5)}T08:00:00Z`,
      expectedEndDate: `2024-09-${25 + (i % 5)}T17:00:00Z`,
      expectedStartTime: "08:00:00",
      expectedEndTime: "17:00:00",
      status: statuses[i % statuses.length],
    });
  }

  return data;
};

const fakeData = {
  dateRegister: "2024-09-25T12:00:00Z",
  daysOfProcess: "Monday, Tuesday",
  visitType: "ProcessWeek",
  visitQuantity: 2,
  visitDetail: generateFakeData(30), // Generates 30 items for pagination demonstration
};

const DetailCustomerVisit: React.FC = () => {
  const navigate = useNavigate(); // For navigating back

  const [searchText, setSearchText] = useState<string>(""); // State for search input
  const [currentPage, setCurrentPage] = useState<number>(1); // State for pagination
  const [pageSize, setPageSize] = useState<number>(5); // State for items per page

  // Format date to DD/MM/YYYY
  const formatDate = (date: string) => moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

  // Format time to HH:mm
  const formatTime = (time: string) => moment(time, "HH:mm:ss").format("HH:mm");

  // Filter data by search input
  const filteredData = fakeData.visitDetail.filter((item: VisitDetail) =>
    item.visitor.visitorName.toLowerCase().includes(searchText.toLowerCase())
  );

  const statusTags: Record<string, JSX.Element> = {
    "Còn hiệu lực": <Tag color="green">Còn hiệu lực</Tag>,
    "Hết hiệu lực": <Tag color="red">Hết hiệu lực</Tag>,
    "Hủy": <Tag color="volcano">Hủy</Tag>,
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: ["visitor", "visitorName"],
      key: "visitorName",
      sorter: (a: VisitDetail, b: VisitDetail) => a.visitor.visitorName.localeCompare(b.visitor.visitorName),
    },
    {
      title: "Công ty",
      dataIndex: ["visitor", "companyName"],
      key: "companyName",
      sorter: (a: VisitDetail, b: VisitDetail) => a.visitor.companyName.localeCompare(b.visitor.companyName),
    },
    {
      title: "Ngày dự kiến bắt đầu",
      dataIndex: "expectedStartDate",
      key: "expectedStartDate",
      render: (text: string) => <span>{formatDate(text)}</span>,
      sorter: (a: VisitDetail, b: VisitDetail) => new Date(a.expectedStartDate).getTime() - new Date(b.expectedStartDate).getTime(),
    },
    {
      title: "Ngày dự kiến kết thúc",
      dataIndex: "expectedEndDate",
      key: "expectedEndDate",
      render: (text: string) => <span>{formatDate(text)}</span>,
      sorter: (a: VisitDetail, b: VisitDetail) => new Date(a.expectedEndDate).getTime() - new Date(b.expectedEndDate).getTime(),
    },
    {
      title: "Thời gian ra - vào",
      key: "expectedTime",
      render: (record: VisitDetail) => (
        <span>
          {formatTime(record.expectedStartTime)} - {formatTime(record.expectedEndTime)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record: VisitDetail) => statusTags[record.status] || <Tag color="default">{record.status}</Tag>,
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
        {/* Redesigned layout for visit details */}
        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm flex items-start space-x-4">
              <CalendarOutlined className="text-blue-500 text-2xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Ngày đăng ký:</p>
                <p className="text-base font-semibold text-gray-800">{formatDate(fakeData.dateRegister)}</p>
                <p className="text-sm text-gray-600">Lịch di chuyển:</p>
                <p className="text-base font-semibold text-gray-800">{fakeData.daysOfProcess}</p>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm flex items-start space-x-4">
              <TeamOutlined className="text-blue-500 text-2xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Loại chuyến thăm:</p>
                <p className="text-base font-semibold text-gray-800">{fakeData.visitType}</p>
                <p className="text-sm text-gray-600">Số lượng người tham gia:</p>
                <p className="text-base font-semibold text-gray-800">{fakeData.visitQuantity}</p>
              </div>
            </div>
          </Col>
        </Row>
        {/* Enhanced Search Input without border */}
        <div className="mb-4">
          <Search
            placeholder="Tìm kiếm theo họ và tên"
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: 300,
              borderRadius: '5px',
              border: 'none', // Removed border for a cleaner look
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)', // Optional shadow for subtle depth
            }}
            enterButton={<SearchOutlined />}
            size="large"
            className="shadow-sm"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 5);
            },
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
