import { Table, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
interface Visitor {
  name: string;
  area: string;
}

const DetailCustomerVisit = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const visitors: Visitor[] = [
    { name: "Tú Thảo", area: "Sản xuất" },
    { name: "Tú Thảo", area: "Sản xuất" },
    { name: "Tú Thảo", area: "Sản xuất" },
    { name: "Tú Thảo", area: "Sản xuất" },
    { name: "Tú Thảo", area: "Sản xuất" },
    { name: "Tú Thảo", area: "Sản xuất" },
  ];

  const columns: ColumnsType<Visitor> = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (name) => <span>{name}</span>,
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      render: () => (
        <div className="flex space-x-1">
          <div className="w-6 h-6 bg-gray-200"></div>
          <div className="w-6 h-6 bg-gray-200"></div>
        </div>
      ),
    },
    {
      title: "Khu vực",
      dataIndex: "area",
      key: "area",
      render: (area) => <Tag color="green">{area}</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: () => <Button type="link">Chỉnh sửa</Button>,
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="flex-1">
        <Button type="default" onClick={() => navigate(-1)} className="m-5">
          Quay lại
        </Button>
        <div className="bg-blue-600 text-white p-4 rounded-lg mb-6">
          <h2 className="font-bold">Số kế hoạch: 1</h2>
          <p>Ngày tạo: 6/8/2024 9:00:13</p>
          <p>Số lượng: 6</p>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Button type="primary">Xuất</Button>
          </div>

          <Table
            columns={columns}
            dataSource={visitors.map((visitor, index) => ({
              key: index,
              ...visitor,
            }))}
          />
        </div>
      </main>
    </div>
  );
};

export default DetailCustomerVisit;
