import React from "react";
import { Layout, Table, Spin, Button } from "antd";
import { useParams } from "react-router-dom";

import { useGetListDetailVisitQuery } from "../services/visitDetailList.service"; // Import the hook
import Visitor from "../types/visitorType";
const { Content } = Layout;

const DetailCustomerVisit: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get visitId from URL params
  // Fetch data using the hook
  const { data, error, isLoading } = useGetListDetailVisitQuery({
    visitId: Number(id),
  });
  console.log(data);

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "visitor",
      key: "visitorName",
      render: (visitor: Visitor) => <span>{visitor.visitorName}</span>,
    },
    {
      title: "Công ty",
      dataIndex: "visitor",
      key: "companyName",
      render: (visitor: Visitor) => <span>{visitor.companyName}</span>,
    },
    {
      title: "Ngày dự kiến bắt đầu",
      dataIndex: "expectedStartDate",
      key: "expectedStartDate",
      render: (text: any) => <span>{text}</span>,
    },
    {
      title: "Ngày dự kiến kết thúc",
      dataIndex: "expectedEndDate",
      key: "expectedEndDate",
      render: (text: any) => <span>{text}</span>,
    },
    {
      title: "Thời gian ra - vào",
      key: "expectedTime",
      render: (record: any) => (
        <span>
          {record.expectedStartTime} - {record.expectedEndTime}
        </span>
      ),
    },   
    {
      title: "Trạng thái",
      key: "status",
      render: (record: any) => (
        <span>
          {record.status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </span>
      ),
    },
      
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Button
          size="middle"
          onClick={() => 
            console.log("ok chua")
          } // Navigate with ID
        >
          Kiểm tra người dùng
        </Button>
      ),
    }, 
  ];

  // Display loading or error states
  if (isLoading) {
    return <Spin size="large" className="flex justify-center" />;
  }

  if (error) {
    return <p>Đã xảy ra lỗi khi tải dữ liệu!</p>;
  }

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <div className="flex justify-center mb-4">
          <h1 className="text-green-500 text-2xl font-bold">
            Chi tiết chuyến thăm
          </h1>
          <br></br>
          Ngay : {data.dateRegister}
          <br></br>
          Lich di Chuyen : {data.daysOfProcess}
          <br></br>
          Loai chuyen tham : {data.visitType}
          <br></br>
          So luong nguoi tham gia : {data.visitQuantity}
        </div>
        <Table
          columns={columns}
          dataSource={data.visitDetail}
          pagination={false}
          rowKey="visitDetailId"
        />
      </Content>
    </Layout>
  );
};

export default DetailCustomerVisit;
