import { Layout, Button, Table, Input, Tag } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetListProcessQuery } from "../services/process.service";
import ProcessType from "../types/processType";
const { Content } = Layout;

const ProcessManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  // console.log(userId);
  if (userId === null) return;
  const departmentManagerId = parseInt(userId);

  const { data, isLoading, error } = useGetListProcessQuery({
    departmentManagerId, // Pass departmentManagerId only if it's valid
  });
  console.log(data);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Filter the data based on search text
  // const filteredData = data.filter((Process: ProcessType) =>
  //   Process.processName.toLowerCase().includes(searchText.toLowerCase())
  // );

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "processName",
      key: "processName",
      sorter: (a: ProcessType, b: ProcessType) =>
        a.processName.localeCompare(b.processName),
      render: (text: any) => <div className="flex items-center">{text}</div>,
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createTime",
      key: "createTime",

      render: (text: any) => <div className="flex items-center">{text}</div>,
    },
    {
      title: "Miêu tả",
      dataIndex: "description",
      key: "description",

      render: (text: any) => <div className="flex items-center">{text}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",

      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Còn hiệu lực" : "Hết hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ProcessType) => (
        <>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600 mr-2"
            onClick={() => navigate("/detailProcess")}
          >
            Chỉnh sửa
          </Button>
          <Button type="primary" danger onClick={() => console.log("kakaa")}>
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
            <h1 className="text-green-500 text-2xl font-bold">
              Danh sách dự án công ty
            </h1>
          </div>
          <Button
            type="primary"
            className="mb-4 bg-blue-500 hover:bg-blue-600"
            onClick={() => console.log("haha")}
          >
            Tạo mới dự án
          </Button>

          <Input
            placeholder="Tìm kiếm theo tiêu đề"
            value={searchText}
            onChange={handleSearchChange}
            style={{ marginBottom: 16, width: 300 }}
          />

          <Table columns={columns} dataSource={data} pagination={false} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProcessManager;
