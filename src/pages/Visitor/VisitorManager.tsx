import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Input,
  Tag,
  Space,
  Modal,
  notification,
  Layout,
  Divider,
  Card,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  StopOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import moment from "moment-timezone";
import { Content } from "antd/es/layout/layout";
import {
  useGetAllVisitorsQuery,
  useDeleteVisitorMutation,
} from "../../services/visitor.service";
import CreateNewVisitor from "../../form/CreateNewVisitor";
import DetailVisitor from "./DetailVisitor";
import Visitor from "../../types/visitorType";
import LoadingState from "../../components/State/LoadingState";

const { confirm } = Modal;

const VisitorManager = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [deleteVisitor] = useDeleteVisitorMutation();
  const [idVisitor, setIdVisitor] = useState<number>(0);
  const userRole = localStorage.getItem("userRole");
  const [filteredData, setFilteredData] = useState<Visitor[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>('Active'); // 'all', 'active', 'inactive'
  const {
    data,
    isLoading: isLoadingData,
    error,
    refetch,
  } = useGetAllVisitorsQuery({ pageNumber: -1, pageSize: -1 }); // Fetch all visitors

  useEffect(() => {
    let result = data || [];
  
    // First filter by status
    // if (activeStatus !== 'all') {
    //   result = result.filter((visitor: Visitor) => 
    //     visitor.status === (activeStatus === 'Active')
    //   );
    // }
    if (activeStatus){
      result = result.filter((visitor: Visitor) => visitor.status === activeStatus);
    }
    // Then filter by search text
    if (searchText) {
      result = result.filter((visitor: Visitor) =>
        visitor.visitorName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  
    setFilteredData(result);
  }, [data, searchText, activeStatus]);
  
  const handleFilterStatus = (status: string) => {
    setActiveStatus(status);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const columns = [
    {
      title: "Tên khách",
      dataIndex: "visitorName",
      key: "visitorName",
      sorter: (a: any, b: any) => a.visitorName.localeCompare(b.visitorName),
    },
    {
      title: "Công ty",
      dataIndex: "companyName",
      key: "companyName",
      sorter: (a: any, b: any) => a.companyName.localeCompare(b.companyName),
    },
    {
      title: "Số thẻ",
      dataIndex: "credentialsCard",
      key: "credentialsCard",
    },
    {
      title: "Loại thẻ",
      dataIndex: "credentialCardType",
      key: "credentialCardType",
      render: (credentialCardType: any) => {
        return credentialCardType.credentialCardTypeName;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createDate",
      key: "createDate",
      sorter: (a: any, b: any) =>
        new Date(a.createDate || "").getTime() -
        new Date(b.createDate || "").getTime(),
      render: (date: string) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updateDate",
      key: "updateDate",
      render: (date: string) =>
        date ? moment.tz(date, "Asia/Ho_Chi_Minh").format("DD/MM/YYYY") : "",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusText = status === "Active" ? "Hợp lệ" : "Bị cấm";
        const tagColor = status === "Active" ? "green" : "red";

        return <Tag color={tagColor}>{statusText}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: any) => {
        const status = record.status;
        return (
          <Space size="middle">
            {/* Detail Icon */}
            <EyeOutlined
              className="text-blue-500 hover:text-blue-700 cursor-pointer text-lg"
              onClick={() => showEditModal(record.visitorId)}
            />
            {userRole !== "Staff" &&
              (status === "Active" ? (
                /* Ban Icon */
                <StopOutlined
                  className="text-red-500 hover:text-red-700 cursor-pointer text-lg"
                  onClick={() => showDeleteConfirm(record.visitorId)}
                />
              ) : (
                /* Unlock Icon */
                <UnlockOutlined
                  className="text-green-500 hover:text-green-700 cursor-pointer text-lg"
                  onClick={() => showDeleteConfirm(record.visitorId)}
                />
              ))}
          </Space>
        );
      },
    },
  ];

  const handleVisitorCreated = () => {
    refetch(); // Call refetch after creating a visitor
  };
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 5);
  };

  const showEditModal = (id: number) => {
    setIdVisitor(id);
    setIsEditModalVisible(true);
  };
  const closeEditModal = () => {
    refetch();
    setIsEditModalVisible(false);
  };

  const showCreateModal = () => {
    setIsModalVisible(true);
  };
  const closeCreateModal = () => {
    setIsModalVisible(false);
  };

  const showDeleteConfirm = (visitorId: number) => {
    confirm({
      title: "Bạn có chắc chắn muốn thay đổi khách này?",
      icon: <ExclamationCircleOutlined />,
      content: "Việc không thể hoàn tác.",
      okText: "Thay đổi",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteVisitor({ id: visitorId }).unwrap();
          notification.success({
            message: `Thay đổi trạng thái thành công!`,
          });
          refetch(); // Refetch data after deletion
        } catch (error) {
          notification.error({
            message: "Thay đổi trạng thái thất bại, vui lòng thử lại.",
          });
        }
      },
      onCancel() {
        // console.log("Hủy xóa");
      },
    });
  };
  if (isLoadingData) {
    return <LoadingState />;
  }
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center bg-white rounded-full shadow-sm p-2 border border-gray-300 focus-within:border-blue-500 transition-all duration-200 ease-in-out">
            <SearchOutlined className="text-gray-500 ml-2" />
            <Input
              placeholder="Tìm kiếm theo CCCD/CMND khách"
              value={searchText}
              onChange={handleSearchChange}
              className="ml-2 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
              style={{ width: 300 }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-sm"
            onClick={showCreateModal}
          >
            Tạo mới khách
          </Button>
          <div>
            <Button
              type="default"
              className="ml-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 shadow-sm"
              onClick={() => handleFilterStatus("Active")}
            >
              Hợp lệ
            </Button>
            <Button
              type="default"
              className="ml-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 py-2 shadow-sm"
              onClick={() => handleFilterStatus("Unactive")}
            >
              Bị cấm
            </Button>
          </div>
        </div>

        <Divider />

        {isModalVisible && (
          <CreateNewVisitor
            isModalVisible={isModalVisible}
            setIsModalVisible={closeCreateModal}
            onVisitorCreated={handleVisitorCreated}
          />
        )}
        {isEditModalVisible && (
          <DetailVisitor
            isEditModalVisible={isEditModalVisible}
            setIsEditModalVisible={closeEditModal}
            id={idVisitor}
          />
        )}

        {error ? (
          <p className="text-red-500 text-center">
            Đã xảy ra lỗi khi tải dữ liệu!
          </p>
        ) : (
          <Card className="shadow-sm">
          <div className="rounded-lg bg-white mx-auto" style={{ width: "100%" }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredData.length,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10"],
              size: "small",
            }}
            onChange={handleTableChange}
            loading={isLoadingData}
            rowKey="visitorId"
            bordered
            className="w-full [&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white [&_.ant-table-thead_th]:!py-2 [&_.ant-table-thead_th]:!text-sm"
          />
          </div>
        </Card>
  
        )}
      </Content>
    </Layout>
  );
};

export default VisitorManager;
