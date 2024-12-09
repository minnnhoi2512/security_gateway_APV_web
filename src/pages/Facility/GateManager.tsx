import { Layout, Button, Table, Tag, message, Input, Modal } from "antd";
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
    {
      title: "ID",
      dataIndex: "gateId",
      key: "gateId",
    },
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
    <Layout className="min-h-screen bg-white">
      <Content className="p-6">
        <Button
          // type="primary"
          className="group relative mb-2 px-6 py-4 bg-buttonColor hover:!bg-buttonColor hover:!border-buttonColor rounded-lg shadow-lg hover:!shadow-green-500/50 transition-all duration-300 transform hover:!scale-105"
          onClick={() => navigate("/gate/createGate")}
        >
          <div className="flex items-center gap-2 text-white">
            <Plus className="w-6 h-6 group-hover:!rotate-180 transition-transform duration-500" />
            <span className="font-medium text-lg">Tạo mới</span>
          </div>
        </Button>

        <StreamingModal
          selectedGate={selectedGate}
          isVisible={isModalVisible}
          onClose={handleVideoClose}
        />
        <Table columns={columns} dataSource={data} pagination={false} />
      </Content>
    </Layout>
  );
};

export default GateManager;
