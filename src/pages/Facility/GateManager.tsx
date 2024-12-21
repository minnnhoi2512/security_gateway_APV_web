import { Layout, Button, Table, Tag, message, Input, Modal, Card } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetListGateQuery } from "../../services/gate.service";
import Gate from "../../types/gateType";
import { formatDateWithourHour } from "../../utils/ultil";
import { EditOutlined, VideoCameraOutlined } from "@ant-design/icons";
import StreamingModal from "../../components/Modal/StreamingModal";
import CreateGate from "../../form/CreateGate";
import GateDetail from "./GateDetail";
import { Plus } from "lucide-react";

const { Content } = Layout;

const GateManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const { data } = useGetListGateQuery({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createForm, setCreateForm] = useState(false);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [modalDetail, setModalDetail] = useState(false);
  const showVideoModal = (record: any) => {
    setSelectedGate(record);
    setIsModalVisible(true);
  };

  const handleVideoClose = () => {
    setIsModalVisible(false);
  };

  const handleCreateCancel = () => {
    setCreateForm(false);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const handleCloseDetail = () => {
    setModalDetail(false);
  };
  const editRecord = (record: Gate) => {
    setSelectedGate(record);
    setModalDetail(true);
  };
  const columns = [
    // {
    //   title: "ID",
    //   dataIndex: "gateId",
    //   key: "gateId",
    // },
    {
      title: "Tên cổng",
      dataIndex: "gateName",
      key: "gateName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createDate",
      key: "createDate",
      render: (createDate: string) => {
        return formatDateWithourHour(createDate);
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => {
        let color = status === true ? "green" : "volcano";
        return (
          <Tag color={color}>
            {status === true ? "Còn hoạt động" : "Đã vô hiệu hóa"}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Gate) => (
        <>
          <Button
            type="default"
            onClick={() =>
              navigate(`/gate/detailGate/${record.gateId}`, {
                state: { selectedGate: record },
              })
            }
          >
            <EditOutlined />
          </Button>
        </>
      ),
    },
  ];

  return (
    <Content className="p-2 max-w-[1200px] mx-auto mt-10">
      {
        <div className="flex gap-4 mb-4">
          <div className="flex flex-1 gap-2"></div>
          {userRole !== "Manager" && (
            <Button
              className="group relative px-6 py-4 bg-buttonColor hover:!bg-buttonColor hover:!border-buttonColor rounded-lg shadow-lg hover:!shadow-green-500/50 transition-all duration-300 transform hover:!scale-105"
              onClick={() => navigate("/gate/createGate")}
            >
              <div className="flex items-center gap-2 text-white">
                <Plus className="w-6 h-6 group-hover:!rotate-180 transition-transform duration-500" />
                <span className="font-medium text-lg">Tạo mới</span>
              </div>
            </Button>
          )}
        </div>
      }

      <StreamingModal
        selectedGate={selectedGate}
        isVisible={isModalVisible}
        onClose={handleVideoClose}
      />
      <Card className="shadow-lg rounded-xl border-0 mt-4">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="middle"
          bordered={false}
          className="w-full [&_thead_th]:!bg-[#34495e] [&_thead_th]:!text-white [&_thead_th]:!font-medium [&_thead_th]:!py-3 [&_thead_th]:!text-sm hover:[&_tbody_tr]:bg-blue-50/30 [&_table]:!rounded-none [&_table-container]:!rounded-none [&_thead>tr>th:first-child]:!rounded-tl-none [&_thead>tr>th:last-child]:!rounded-tr-none [&_thead_th]:!transition-none"
        />
      </Card>
    </Content>
  );
};

export default GateManager;
