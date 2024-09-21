import { Layout, Button, Table, Tag, message, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

interface GateDataType {
  key: string;
  IDGate: string;
  location: string;
  createDate: string;
  status: string;
  gateType: string;
}

const GateManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  const [data, setData] = useState<GateDataType[]>([
    {
      key: "1",
      IDGate: "G001",
      location: "North Entrance",
      createDate: "2023-01-15",
      status: "Active",
      gateType: "Automatic",
    },
    {
      key: "2",
      IDGate: "G002",
      location: "South Entrance",
      createDate: "2022-11-23",
      status: "Inactive",
      gateType: "Manual",
    },
    {
      key: "3",
      IDGate: "G003",
      location: "East Entrance",
      createDate: "2021-09-10",
      status: "Active",
      gateType: "Automatic",
    },
  ]);

  const handleDeleteGate = (key: string) => {
    const updatedData = data.filter((gate) => gate.key !== key);
    setData(updatedData);
    message.success("Xóa cổng thành công!");
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Filter the data based on search text
  const filteredData = data.filter((gate) =>
    gate.IDGate.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "IDGate",
      dataIndex: "IDGate",
      key: "IDGate",
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createDate",
      key: "createDate",
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
      title: "Loại cổng",
      dataIndex: "gateType",
      key: "gateType",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: GateDataType) => (
        <>
          <Button
            type="primary"
            className="mr-2"
            onClick={() =>
              navigate("/detailGate", {
                state: record, // Pass the entire gate object
              })
            }
          >
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDeleteGate(record.key)}
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
            <h1 className="text-green-500 text-2xl font-bold">Quản lý cổng</h1>
          </div>
          <Button
            type="primary"
            className="mb-4 bg-blue-500 hover:bg-blue-600"
            onClick={() => navigate("/createGate")}
          >
            Tạo mới cổng
          </Button>

          <Input
            placeholder="Tìm kiếm theo ID cổng"
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

export default GateManager;
