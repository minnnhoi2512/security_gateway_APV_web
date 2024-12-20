import React from "react";
import { Modal, Card, Table } from "antd";
import { useGetListUsersByDepartmentIdQuery } from "../../services/user.service";

interface DepartmentUserProps {
  isUserListModalVisible: boolean;
  setIsUserListModalVisible: (visible: boolean) => void;
  departmentId: number;
  isUserListLoading: boolean;
}

const DepartmentUser: React.FC<DepartmentUserProps> = ({
  isUserListModalVisible,
  setIsUserListModalVisible,
  departmentId,
}) => {
  const {
    data: userListData,
    isLoading,
    refetch: refetchUserList,
    isError,
  } = useGetListUsersByDepartmentIdQuery(
    {
      departmentId: departmentId,
      pageNumber: 1,
      pageSize: 100,
    },
    {
      skip: departmentId === 0,
    }
  );
  return (
    <Modal
      title={<h2 className="text-lg font-semibold">Danh sách người dùng</h2>}
      open={isUserListModalVisible}
      onCancel={() => setIsUserListModalVisible(false)}
      footer={null}
      width={800}
      className="rounded-lg"
    >
      {isError ? (
        <p className="text-red-500">
          Hiện tại phòng ban này không có người dùng nào
        </p>
      ) : (
        <Card className="shadow-lg rounded-xl border-0">
          <Table
            columns={[
              {
                title: "Tên đầy đủ",
                dataIndex: "fullName",
                key: "fullName",
              },
              { title: "Email", dataIndex: "email", key: "email" },
              {
                title: "Số điện thoại",
                dataIndex: "phoneNumber",
                key: "phoneNumber",
              },
              {
                title: "Vai trò",
                dataIndex: ["role", "roleName"],
                key: "roleName",
              },
              { title: "Trạng thái", dataIndex: "status", key: "status" },
            ]}
            dataSource={userListData}
            loading={isLoading}
            pagination={{ pageSize: 5 }}
            rowKey="userId"
            size="middle"
            bordered={false}
            className="w-full [&_thead_th]:!bg-[#34495e] [&_thead_th]:!text-white [&_thead_th]:!font-medium [&_thead_th]:!py-3 [&_thead_th]:!text-sm hover:[&_tbody_tr]:bg-blue-50/30 [&_table]:!rounded-none [&_table-container]:!rounded-none [&_thead>tr>th:first-child]:!rounded-tl-none [&_thead>tr>th:last-child]:!rounded-tr-none [&_thead_th]:!transition-none"
          />
        </Card>
      )}
    </Modal>
  );
};

export default DepartmentUser;
