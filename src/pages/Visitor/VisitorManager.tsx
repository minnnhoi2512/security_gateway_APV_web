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
import { Plus } from "lucide-react";

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
  const [activeStatus, setActiveStatus] = useState<string>("");
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
    if (activeStatus) {
      result = result.filter(
        (visitor: Visitor) => visitor.status === activeStatus
      );
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
    setActiveStatus((prevStatus) => (prevStatus === status ? "" : status));
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
    refetch();
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

  const getButtonStyles = (status) => {
    if (status === "Active") {
      return activeStatus === "Active"
        ? "border-[#138d75] text-white bg-[#138d75] hover:!bg-[#138d75]/90 hover:!text-white hover:!bg-[#138d75]"
        : "border-[#34495e] text-[#34495e] hover:!bg-white hover:!text-[#34495e] hover:!border-[#34495e]";
    }
    return activeStatus === "Unactive"
      ? "border-[#c0392b] text-white bg-[#c0392b]  hover:!border-[#c0392b] hover:!text-white hover:!bg-[#c0392b]"
      : "border-[#34495e] text-[#34495e] hover:!bg-white hover:!text-[#34495e] hover:!border-[#34495e]";
  };

  const getTableHeaderStyle = () => {
    if (!activeStatus)
      return "[&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white";
    return activeStatus === "Active"
      ? "[&_.ant-table-thead_th]:!bg-[#138d75]/10 [&_.ant-table-thead_th]:!text-[#138d75]"
      : "[&_.ant-table-thead_th]:!bg-[#c0392b]/10 [&_.ant-table-thead_th]:!text-[#c0392b]";
  };

  if (isLoadingData) {
    return <LoadingState />;
  }
  return (
    <Content className="p-2 max-w-[1200px] mx-auto mt-7">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Tìm kiếm theo tên khách"
          value={searchText}
          onChange={handleSearchChange}
          prefix={<SearchOutlined />}
          style={{
            width: 300,
         
            borderRadius: 5,
          }}
        />

        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-sm"
          onClick={showCreateModal}
        >
          Tạo mới khách
        </Button> */}
        <Button
          onClick={showCreateModal}
          className="group relative px-6 py-4 bg-buttonColor hover:!bg-buttonColor hover:!border-buttonColor rounded-lg shadow-lg hover:!shadow-green-500/50 transition-all duration-300 transform hover:!scale-105"
        >
          <div className="flex items-center gap-2 text-white">
            <Plus className="w-6 h-6 group-hover:!rotate-180 transition-transform duration-500" />
            <span className="font-medium text-lg">Tạo mới</span>
          </div>
        </Button>
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
        <Card className="shadow-lg rounded-xl border-0">
          <div
            className="rounded-lg bg-white mx-auto"
            style={{ width: "100%" }}
          >
            <div className="flex gap-1">
              <Button
                type="default"
                className={`rounded-t-[140px] min-w-[120px] border-b-0 transition-colors duration-200 ${getButtonStyles(
                  "Active"
                )}`}
                onClick={() => handleFilterStatus("Active")}
              >
                Hợp lệ
              </Button>
              <Button
                type="default"
                className={`rounded-t-[140px] min-w-[120px] border-b-0 transition-colors duration-200 ${getButtonStyles(
                  "Unactive"
                )}`}
                onClick={() => handleFilterStatus("Unactive")}
              >
                Bị cấm
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={filteredData}
              showSorterTooltip={false}
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
              bordered={false}
              className={`w-full ${getTableHeaderStyle()} [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-thead_th]:!text-sm hover:[&_.ant-table-tbody_tr]:bg-blue-50/30 [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-none [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-none [&_.ant-table-thead_th]:!transition-all`}
              size="middle"
            />
          </div>
        </Card>
      )}
    </Content>
  );
};

export default VisitorManager;
