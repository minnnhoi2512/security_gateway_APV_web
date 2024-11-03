import { useState } from "react";
import { Button, Table, Input, Tag, Space, Modal, notification } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
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

const BanVisitorManager = () => {
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
  let visitors: Visitor[] = data ? data : [];

  // Filter visitors based on userRole after fetching
  if (userRole === "Staff" || userRole === "DepartmentManager") {
    visitors = visitors.filter(
      (visitor: Visitor) => visitor.status === "Active"
    );
  }

  const totalVisitors = visitors.length; // Total visitors after filtering
  const filteredData = visitors.filter((visitor: any) =>
    visitor.visitorName.toLowerCase().includes(searchText.toLowerCase())
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
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a: any, b: any) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Thẻ nhận dạng",
      dataIndex: "credentialsCard",
      key: "credentialsCard",
      sorter: (a: any, b: any) =>
        a.credentialsCard.localeCompare(b.credentialsCard),
    },
    {
      title: "Loại thẻ nhận dạng",
      dataIndex: ["credentialCardType", "credentialCardTypeName"],
      key: "credentialCardType",
    },
    {
      title: "Hình ảnh thẻ nhận dạng",
      dataIndex: "visitorCredentialImage",
      key: "visitorCredentialImage",
      render: (text: string) => (
        <img
          src={`data:image/*;base64,${text}`}
          alt="Credential"
          style={{ width: "50px" }}
        />
      ),
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
        const status = record.status; // Get the status of the current record

        return (
          <Space>
            <Button
              type="primary"
              onClick={() => showEditModal(record.visitorId)}
            >
              Chi tiết
            </Button>
            {userRole !== "Staff" && userRole !== "DepartmentManager" && (
              <>
                {status === "Active" ? (
                  <Button
                    danger
                    onClick={() => showDeleteConfirm(record.visitorId)}
                  >
                    Cấm
                  </Button>
                ) : (
                  <Button 
                    type="primary" // Set button type to primary for green color
                    onClick={() => showDeleteConfirm(record.visitorId)}
                  >
                    Mở khóa
                  </Button>
                )}
              </>
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
    <Content className="p-6">
      <div className="flex justify-center mb-4">
        <h1 className="text-green-500 text-2xl font-bold">Quản lý khách</h1>
      </div>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          placeholder="Tìm kiếm theo tên khách"
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
          onClick={showCreateModal}
          style={{ borderRadius: 5 }}
        >
          Tạo mới khách
        </Button>
      </Space>
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
        <p>Đã xảy ra lỗi khi tải dữ liệu!</p>
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
        />
      )}
    </Content>
  );
};

export default BanVisitorManager;
