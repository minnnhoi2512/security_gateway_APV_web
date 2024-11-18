import { useState } from "react";
import { Button, Table, Input, Tag, Space, Modal, notification, Layout, Divider } from "antd";
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

  const {
    data,
    isLoading: isLoadingData,
    error,
    refetch,
  } = useGetAllVisitorsQuery({ pageNumber: -1, pageSize: -1 }); // Fetch all visitors
  let visitors: Visitor[] = data ? data.filter(
    (visitor: Visitor) => visitor.status === "Active"
  ): [];

  // Filter visitors based on userRole after fetching
  // if (userRole === "Staff" || userRole === "DepartmentManager") {
  //   visitors = visitors.filter(
  //     (visitor: Visitor) => visitor.status === "Active"
  //   );
  // }
  console.log(data);
  const totalVisitors = visitors.length; // Total visitors after filtering
  const filteredData = visitors.filter((visitor: any) =>
    visitor.credentialsCard.toLowerCase().includes(searchText.toLowerCase())
  );

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
      title: "CCCD/CMND",
      dataIndex: "credentialsCard",
      key: "credentialsCard",
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
            {status === "Active" ? (
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
            )}
          </Space>
        );
      },
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
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
      title: "Bạn có chắc chắn muốn xóa khách này?",
      icon: <ExclamationCircleOutlined />,
      content: "Việc xóa sẽ không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteVisitor({ id: visitorId }).unwrap();
          notification.success({
            message: `Xóa khách thành công!`,
          });
          refetch(); // Refetch data after deletion
        } catch (error) {
          notification.error({
            message: "Xóa khách thất bại, vui lòng thử lại.",
          });
        }
      },
      onCancel() {
        // console.log("Hủy xóa");
      },
    });
  };

  return (
<Layout className="min-h-screen bg-gray-50">
  <Content className="p-8 bg-white rounded-lg shadow-md">
    <div className="text-center mb-6">
    <h1 className="text-3xl font-bold text-center mb-6 text-titleMain">Danh sách khách</h1>
    </div>
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
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalVisitors,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          size: "small",
        }}
        onChange={handleTableChange}
        loading={isLoadingData}
        rowKey="visitorId"
        bordered
        className="bg-white shadow-md rounded-lg"
      />
    )}
  </Content>
</Layout>
  );
};

export default VisitorManager;
