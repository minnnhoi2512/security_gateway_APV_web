import { useState } from "react";
import { Button, Table, Input, Tag, Space } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import QRCardType from "../types/QRCardType";
import { useGetListQRCardQuery } from "../services/qrCard.service";

const CardManager = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Fetching data using the query
  const { data, isLoading, error } = useGetListQRCardQuery({
    pageNumber: currentPage,
    pageSize,
  });

  const qrCards = data?.qrCards || data || [];

  const filteredData = qrCards.filter((card: QRCardType) =>
    Object.values(card)
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Mã Thẻ",
      dataIndex: "qrCardId",
      key: "qrCardId",
      sorter: (a: QRCardType, b: QRCardType) => a.qrCardId - b.qrCardId,
    },
    {
      title: "Mã Xác Thực",
      dataIndex: "cardVerification",
      key: "cardVerification",
      sorter: (a: QRCardType, b: QRCardType) =>
        a.cardVerification.localeCompare(b.cardVerification),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createDate",
      key: "createDate",
      sorter: (a: QRCardType, b: QRCardType) =>
        new Date(a.createDate || "").getTime() - new Date(b.createDate || "").getTime(),
      render: (date: Date | undefined) =>
        date
          ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY")
          : "",
    },
    {
      title: "Ngày Hủy Lần Cuối",
      dataIndex: "lastCancelDate",
      key: "lastCancelDate",
      sorter: (a: QRCardType, b: QRCardType) =>
        new Date(a.lastCancelDate || "").getTime() - new Date(b.lastCancelDate || "").getTime(),
      render: (date: Date | undefined) =>
        date
          ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY")
          : "",
    },
    {
      title: "Loại Thẻ",
      dataIndex: "qrCardTypename",
      key: "qrCardTypename",
      sorter: (a: QRCardType, b: QRCardType) =>
        (a.qrCardTypename || "").localeCompare(b.qrCardTypename || ""),
    },
    {
      title: "Trạng Thái",
      dataIndex: "qrCardStatusName",
      key: "qrCardStatusName",
      render: (status: string | undefined) => {
        const color = status === "Active" ? "green" : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
      sorter: false,
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 5);
  };

  return (
    <Content className="p-6">
      <div className="flex justify-center mb-4">
        <h1 className="text-green-500 text-2xl font-bold">Quản lý thẻ</h1>
      </div>
      <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Input
          placeholder="Tìm kiếm theo từ khóa (Mã Thẻ, Mã Xác Thực, ...)"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{ marginBottom: 16, width: 300, borderColor: "#1890ff", borderRadius: 5 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/createCard")}
          style={{ borderRadius: 5 }}
        >
          Tạo mới thẻ
        </Button>
      </Space>

      {error ? (
        <p>Đã xảy ra lỗi khi tải dữ liệu!</p>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            size: "small",
          }}
          onChange={handleTableChange}
          loading={isLoading}
          rowKey="qrCardId"
          bordered
        />
      )}
    </Content>
  );
};

export default CardManager;
