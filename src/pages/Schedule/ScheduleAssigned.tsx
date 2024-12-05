import { Layout, Button, Input, Space, Card, Popover } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSchedulesUserByStatusQuery } from "../../services/scheduleUser.service";
import TableScheduleUser from "../../components/TableScheduleUser";
import ScheduleUserDetailModal from "../../components/Modal/ScheduleUserDetailModal";
import NotFoundState from "../../components/State/NotFoundState";
import { VisitStatus, visitStatusMap } from "../../types/Enum/VisitStatus";
import { TaskStatus, taskStatusMap } from "../../types/Enum/TaskStatus";

const { Content } = Layout;

type StatusType =
  | "All"
  | "Assigned"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancel";

interface StatusOption {
  label: string;
  value: StatusType;
}

interface Filters {
  taskStatus: TaskStatus[];
  scheduleTypeId: any[];
}

const ScheduleAssignedManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("All");
  const [actionType, setActionType] = useState<string | null>(null);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const userRole = localStorage.getItem("userRole");
  const [filters, setFilters] = useState<Filters>({
    taskStatus: [],
    scheduleTypeId: [],
  });
  const {
    data: schedules,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSchedulesUserByStatusQuery({
    pageNumber: 1,
    pageSize: 100,
    userId: Number(localStorage.getItem("userId")),
    status: statusFilter,
  });

  const handleClearFilters = () => {
    setFilters({
      taskStatus: [],
      scheduleTypeId: [],
    });
  };

  // useEffect(() => {
  //   if (schedules) {
  //     setFilteredSchedules(
  //       schedules.filter((schedule: any) =>
  //         schedule.title.toLowerCase().includes(searchText.toLowerCase())
  //       )
  //     );
  //   }
  // }, [schedules, searchText]);

  const handleRowClick = useCallback(
    (record: any) => {
      if (actionType === "view") {
        setSelectedRecord(record);
        setIsModalVisible(true);
      }
    },
    [actionType]
  );
  useEffect(() => {
    if (schedules) {
      const filtered = schedules.filter((schedule: any) => {
        const matchesSearch = schedule.title
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const matchesStatus =
          filters.taskStatus.length === 0 ||
          filters.taskStatus.includes(schedule.status);

        return matchesSearch && matchesStatus;
      });

      setFilteredSchedules(filtered);
    }
  }, [schedules, searchText, filters.taskStatus]);

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
    setActionType(null);
  };

  const getCountByStatus = (status: TaskStatus) => {
    return schedules?.filter((item: any) => item.status === status).length || 0;
  };
  const handleStatusFilter = (status: TaskStatus | null) => {
    setFilters((prev) => ({
      ...prev,
      taskStatus: status === null ? [] : [status],
    }));
  };

  const handleEditOrView = (record: any) => {
    setActionType("view");
    handleRowClick(record);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  if (userRole === "Staff") {
    return (
      <div>
        <NotFoundState></NotFoundState>
      </div>
    );
  }
  return (
    <Layout className="min-h-screen bg-white">
      <Content className="p-4  mt-10">
        <Space
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Tìm kiếm tên nhiệm vụ"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={handleSearchChange}
              className="ml-4 w-[120%] max-w-[120%]"
            />
            <Popover
              content={
                <Space direction="vertical" className="w-64">
                  {/* Bộ lọc trạng thái */}
                  <div className="mt-4">
                    <small className="text-gray-500 block mb-2">
                      Trạng thái
                    </small>
                    <div className="flex flex-wrap items-center gap-2">
                      {Object.values(TaskStatus).map((status) => {
                        const { colorVisitStatus, textVisitStatus } =
                          taskStatusMap[status];
                        const count = getCountByStatus(status);
                        const isSelected = filters.taskStatus.includes(status);

                        return (
                          <Button
                            key={status}
                            onClick={() => handleStatusFilter(status)}
                            className={`
                  relative 
                  rounded-full 
                  px-3 
                  py-1 
                  h-auto 
                  text-xs 
                  transition-all 
                  duration-200 
                  ${
                    isSelected
                      ? "bg-[#34495e] text-white hover:bg-primary/90"
                      : "bg-[white] text-primary border-primary hover:bg-primary/10"
                  }
                `}
                          >
                            <span className="relative z-10">
                              {textVisitStatus}
                            </span>
                            {count > 0 && (
                              <span
                                className="
                      absolute 
                      -top-1 
                      -right-1 
                      z-20 
                      bg-red-500 
                      text-white 
                      text-[10px] 
                      rounded-full 
                      min-w-[16px] 
                      h-[16px] 
                      flex 
                      items-center 
                      justify-center 
                      px-1
                    "
                              >
                                {count}
                              </span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Nút xóa bộ lọc */}
                  <Button
                    type="default"
                    block
                    onClick={handleClearFilters}
                    size="small"
                    className="mt-4"
                  >
                    Xóa bộ lọc
                  </Button>
                </Space>
              }
              trigger="click"
              placement="bottomRight"
            >
              <Button icon={<FilterOutlined />} />
            </Popover>
          </div>

          <Button
            type="primary"
            size="large"
            className="invisible"
            style={{ borderRadius: 12 }}
          >
            Tạo mới
          </Button>
        </Space>

        {/* <div className="bg-white shadow-lg rounded-md overflow-hidden">
          <TableScheduleUser
            data={filteredSchedules}
            isLoading={isLoading || isFetching}
            onRowClick={handleEditOrView}
            error={error}
          />
        </div> */}

        <TableScheduleUser
          data={filteredSchedules}
          isLoading={isLoading || isFetching}
          onRowClick={handleEditOrView}
          error={error}
        />
        {isModalVisible && (
          <ScheduleUserDetailModal
            isVisible={isModalVisible}
            handleClose={handleModalClose}
            selectedRecord={selectedRecord}
            refetch={refetch}
          />
        )}
      </Content>
    </Layout>
  );
};

export default ScheduleAssignedManager;
