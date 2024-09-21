import { Layout, Button, Table, Tag, message, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

interface CardDataType {
  key: string;
  IDCard: string;
  createDate: string;
  lastCancelDate: string;
  cardType: string;
  status: string;
}

const CardManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  const [data, setData] = useState<CardDataType[]>([
    {
      key: "1",
      IDCard: "123456789",
      createDate: "2022-01-01",
      lastCancelDate: "2022-06-01",
      cardType: "Gold",
      status: "Active",
    },
    {
      key: "2",
      IDCard: "987654321",
      createDate: "2021-12-01",
      lastCancelDate: "2023-03-15",
      cardType: "Platinum",
      status: "Inactive",
    },
    {
      key: "3",
      IDCard: "111222333",
      createDate: "2023-02-20",
      lastCancelDate: "2023-07-10",
      cardType: "Silver",
      status: "Active",
    },
  ]);

  const handleDeleteCard = (key: string) => {
    const updatedData = data.filter((card) => card.key !== key);
    setData(updatedData);
    message.success("Xóa thẻ thành công!");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredData = data.filter((card) =>
    card.IDCard.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "IDCard",
      dataIndex: "IDCard",
      key: "IDCard",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createDate",
      key: "createDate",
    },
    {
      title: "Ngày hủy lần cuối",
      dataIndex: "lastCancelDate",
      key: "lastCancelDate",
    },
    {
      title: "Loại thẻ",
      dataIndex: "cardType",
      key: "cardType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = status === "Active" ? "green" : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: CardDataType) => (
        <>
          <Button
            type="primary"
            className="mr-2"
            onClick={() =>
              navigate("/detailCard", {
                state: record, // Pass the entire card object
              })
            }
          >
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDeleteCard(record.key)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="p-6">
          <div className="flex justify-center mb-4">
            <h1 className="text-green-500 text-2xl font-bold">Quản lý thẻ</h1>
          </div>
          <Button
            type="primary"
            className="mb-4 bg-blue-500 hover:bg-blue-600"
            onClick={() => navigate("/createCard")}
          >
            Tạo mới thẻ
          </Button>

          <Input
            placeholder="Tìm kiếm theo ID thẻ"
            value={searchText}
            onChange={handleSearchChange}
            style={{ marginBottom: 16, width: 300 }}
          />

          <Table columns={columns} dataSource={filteredData} pagination={false} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CardManager;
