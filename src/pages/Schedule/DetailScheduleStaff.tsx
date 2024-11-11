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
import {
  ScheduleUserStatus,
  statusMap,
} from "../../types/Enum/ScheduleUserStatus";
import { useGetDetailScheduleStaffQuery } from "../../services/scheduleStaff.service";
import { formatDate } from "../../utils/ultil";
import { ScheduleType, typeMap } from "../../types/Enum/ScheduleType";

const { Title } = Typography;

const DetailScheduleStaff = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const { data } = useGetDetailScheduleStaffQuery(Number(state));
  const getStatusTag = (status: ScheduleUserStatus) => {
    const { color, text } = statusMap[status] || {
      color: "black",
      text: "Không xác định",
    };

    return <Tag color={color}>{text}</Tag>;
  };
  const getScheduleTypeTag = (scheduleTypeName: ScheduleType) => {
    const { colorScheduleType, textScheduleType } = typeMap[
      scheduleTypeName
    ] || { color: "black", text: "Theo ngày" };

    return <Tag color={colorScheduleType}>{textScheduleType}</Tag>;
  };
  const handleCreateNewVisit = () => {
    navigate("/createNewVisitList", { state: { from: data } });
  };
  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2} style={{ textAlign: "center", margin: 0 }}>
            Chi tiết lịch cần tạo chuyến thăm
          </Title>

          {data ? (
            <>
              <Card type="inner" title={`Tên lịch hẹn : ${data.title}`}>
                <Descriptions
                  bordered
                  column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="Trạng thái">
                    {getStatusTag(data.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại chuyến thăm">
                    {getScheduleTypeTag(
                      data.schedule?.scheduleType?.scheduleTypeId
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
                    {formatDate(data.assignTime)}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <ClockCircleOutlined />
                        Deadline
                      </Space>
                    }
                  >
                    {formatDate(data.deadlineTime)}
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
                    {data?.assignFrom?.userName}
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
                    {data.description}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <FileTextOutlined />
                        Ghi chú
                      </Space>
                    }
                  >
                    {data.note}
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
                {data.status != "Pending" && (
                  <Button type="primary" onClick={handleCreateNewVisit}>
                    Tạo lịch hẹn
                  </Button>
                )}
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
