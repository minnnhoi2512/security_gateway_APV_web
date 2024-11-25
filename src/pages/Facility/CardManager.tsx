import { useState } from "react";
import { Button, Table, Input, Tag, Space } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import QRCardType from "../../types/QRCardType";
import { useGetListQRCardQuery } from "../../services/QRCard.service";
import LoadingState from "../../components/State/LoadingState";
import { CardStatusType, typeCardStatusMap } from "../../types/Enum/CardStatus";
import { CardType, typeCardMap } from "../../types/Enum/CardType";

const CardManager = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");

  // Fetching data using the query
  const { data, isLoading, error } = useGetListQRCardQuery({
    pageNumber: 1,
    pageSize: 100,
  });
  console.log(data);
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
      dataIndex: "cardId",
      key: "cardId",
      sorter: (a: QRCardType, b: QRCardType) => a.cardId - b.cardId,
    },
    {
      title: "Ảnh",
      dataIndex: "cardImage",
      key: "cardImage",
      render: (text: any) => (
        <div>
          <img
            src={`data:image/png;base64,${text}`}
            alt="Card Image"
            style={{ width: "100px", height: "auto" }}
          />
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => {
              const link = document.createElement("a");
              link.href = `data:image/png;base64,${text}`;
              link.download = "card_image.png";
              link.click();
            }}
          >
            Tải xuống thẻ
          </Button>
        </div>
      ),
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
        new Date(a.createDate || "").getTime() -
        new Date(b.createDate || "").getTime(),
      render: (date: Date | undefined) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Ngày Hủy",
      dataIndex: "lastCancelDate",
      key: "lastCancelDate",
      sorter: (a: QRCardType, b: QRCardType) =>
        new Date(a.lastCancelDate || "").getTime() -
        new Date(b.lastCancelDate || "").getTime(),
      render: (date: Date | undefined) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Loại Thẻ",
      dataIndex: "qrCardTypename",
      key: "qrCardTypename",
      sorter: (a: QRCardType, b: QRCardType) =>
        (a.qrCardTypename || "").localeCompare(b.qrCardTypename || ""),
      render: (text: CardType) => {
        const { colorCardType, textCardType } = typeCardMap[text] || {};
        return <Tag color={colorCardType}>{textCardType}</Tag>;
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "cardStatus",
      key: "cardStatus",
      render: (status: CardStatusType) => {
        const { colorCardStatusType, textCardStatusType } =
          typeCardStatusMap[status] || {};
        return <Tag color={colorCardStatusType}>{textCardStatusType}</Tag>;
      },
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  if (isLoading) {
    return (
      <div>
        <LoadingState></LoadingState>
      </div>
    );
  }
  return (
    <Content className="px-6">
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Tìm kiếm theo từ khóa (Mã Thẻ, Mã Xác Thực, ...)"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{
            marginBottom: 16,
            width: 300,
            borderColor: "#1890ff",
            borderRadius: 5,
          }}
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
            total: data?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["5"],
            defaultPageSize: 5, // Set default page size to 5
            size: "small",
          }}
          loading={isLoading}
          rowKey="qrCardId"
          bordered
        />
      )}
    </Content>
  );
};

export default CardManager;
