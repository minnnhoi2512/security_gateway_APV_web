import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Button,
  Divider,
  Empty,
  Modal,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  scheduleStatusMap,
  ScheduleUserStatus,

} from "../../types/Enum/ScheduleUserStatus";
import { formatDate } from "../../utils/ultil";
import { ScheduleType, typeMap } from "../../types/Enum/ScheduleType";
import { ScheduleUserType } from "../../types/ScheduleUserType";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

interface DetailScheduleStaffProps {
  record: ScheduleUserType | null;
  isVisible: boolean;
  onClose: () => void;
}

const DetailScheduleStaff: React.FC<DetailScheduleStaffProps> = ({
  record,
  isVisible,
  onClose,
}) => {
  const getStatusTag = (status: ScheduleUserStatus) => {
    const { color, text } = scheduleStatusMap[status] || {
      color: "black",
      text: "Không xác định",
    };

    return <Tag color={color}>{text}</Tag>;
  };
  const navigate = useNavigate();
  const getScheduleTypeTag = (scheduleTypeName: ScheduleType) => {
    const { colorScheduleType, textScheduleType } = typeMap[scheduleTypeName] || {
      color: "black",
      text: "Theo ngày",
    };

    return <Tag color={colorScheduleType}>{textScheduleType}</Tag>;
  };

  const handleCreateNewVisit = () => {
    navigate("/createNewVisitList", { state: { from: record } });
  };

  return (
    <Modal
      visible={isVisible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={2} style={{ textAlign: "center", margin: 0 }}>
              Chi tiết lịch cần tạo chuyến thăm
            </Title>

            {record ? (
              <>
                <Card type="inner" title={`Tên lịch hẹn : ${record.title}`}>
                  <Descriptions
                    bordered
                    column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                  >
                    <Descriptions.Item label="Trạng thái">
                      {getStatusTag(record.status as ScheduleUserStatus)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại chuyến thăm">
                      {getScheduleTypeTag(
                        record.schedule?.scheduleType?.scheduleTypeId
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
                      {formatDate(record.assignTime)}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space>
                          <ClockCircleOutlined />
                          Deadline
                        </Space>
                      }
                    >
                      {formatDate(record.deadlineTime)}
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
                      {record?.assignFrom?.userName}
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
                      {record.description}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={
                        <Space>
                          <FileTextOutlined />
                          Ghi chú
                        </Space>
                      }
                    >
                      {record.note}
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
                  <Button onClick={onClose}>Trở lại</Button>
                  {record.status !== "Pending" && (
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
    </Modal>
  );
};

export default DetailScheduleStaff;