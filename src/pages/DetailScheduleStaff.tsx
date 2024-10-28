import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Button,
  Divider,
  Empty,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const DetailScheduleStaff = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  useEffect(() => {
    // console.log(state.schedule.daysOfSchedule);
  }, [state]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  const getStatusTag = (status: string) => {
    return (
      <Tag color={status === "Assigned" ? "red" : "green"}>
        {status === "Assigned" ? "Cần tạo danh sách" : "Đã tạo danh sách"}
      </Tag>
    );
  };
  const getScheduleTypeTag = (scheduleTypeName: string) => {
    switch (scheduleTypeName) {
      case "VisitDaily":
        return <Tag color="blue">Vãng lai</Tag>;
      case "ProcessWeek":
        return <Tag color="green">Theo tuần</Tag>;
      case "ProcessMonth":
        return <Tag color="orange">Theo tháng</Tag>;
      default:
        return <Tag color="red">Không xác định</Tag>;
    }
  };
  const handleCreateNewVisit = () => {
    navigate("/createNewVisitList", { state: { from: state } });
  };
  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2} style={{ textAlign: "center", margin: 0 }}>
            Chi tiết lịch cần tạo chuyến thăm
          </Title>

          {state ? (
            <>
              <Card type="inner" title={`Tên lịch hẹn : ${state.title}`}>
                <Descriptions
                  bordered
                  column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="Trạng thái">
                    {getStatusTag(state.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại chuyến thăm">
                    {getScheduleTypeTag(
                      state.schedule.scheduleType.scheduleTypeName
                    )}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions
                  bordered
                  column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item
                    label={
                      <Space>
                        <ClockCircleOutlined />
                        Ngày tạo
                      </Space>
                    }
                  >
                    {formatDate(state.assignTime)}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <ClockCircleOutlined />
                        Deadline
                      </Space>
                    }
                  >
                    {formatDate(state.deadlineTime)}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions
                  bordered
                  column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item
                    label={
                      <Space>
                        <UserOutlined />
                        Người giao
                      </Space>
                    }
                  >
                    {state.assignFrom.userName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <UserOutlined />
                        Người nhận
                      </Space>
                    }
                  >
                    {state.assignTo.userName}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions bordered column={1}>
                  <Descriptions.Item
                    label={
                      <Space>
                        <FileTextOutlined />
                        Mô tả
                      </Space>
                    }
                  >
                    {state.description}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <FileTextOutlined />
                        Ghi chú
                      </Space>
                    }
                  >
                    {state.note}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <Button onClick={() => navigate(-1)}>Trở lại</Button>
                <Button type="primary" onClick={handleCreateNewVisit}>
                  Tạo lịch hẹn
                </Button>
            
              </div>
            </>
          ) : (
            <Card>
              <Empty description="Không có lịch hẹn nào." />
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default DetailScheduleStaff;
