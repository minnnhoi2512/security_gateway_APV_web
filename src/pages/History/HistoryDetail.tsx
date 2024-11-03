import { Layout, Tag } from "antd";
import { formatDate } from "../../utils/ultil";

const { Content } = Layout;

const HistoryDetail = ({ data }: { data: any }) => {
  return (
    <Content className="p-6 bg-gray-100 ">
    {data && (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Thông tin lượt ra vào
        </h2>
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Visitor Information */}
          <div className="flex-1">
            <p className="text-lg">
              <strong>Tên khách:</strong> {data.visitor.visitorName}
            </p>
            <p className="text-lg">
              <strong>Công ty:</strong> {data.visitor.companyName}
            </p>
            <p className="text-lg mt-2">
              <strong>Trạng thái:</strong>{" "}
              <Tag color={data.status === "CheckOut" ? "green" : "red"}>
                {data.status === "CheckOut" ? "Đã ra" : "Đã vào"}
              </Tag>
            </p>
            <img
              src={data.imageSrc}
              alt="Visitor"
              className="w-full max-w-xs mt-4 rounded-lg shadow-sm"
            />
          </div>
  
          {/* Divider */}
          <div className="hidden md:block border-l border-gray-300 mx-4"></div>
  
          {/* Check-In Information */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Thông tin vào
            </h3>
            <p className="text-lg">
              <strong>Giờ vào:</strong> {formatDate(data.checkInTime)}
            </p>
            <p className="text-lg mt-2">
              <strong>Cổng vào:</strong> {data.gateIn}
            </p>
            <p className="text-lg mt-2">
              <strong>Cho phép bởi:</strong> {data.securityGateIn}
            </p>
          </div>
  
          {/* Divider */}
          <div className="hidden md:block border-l border-gray-300 mx-4"></div>
  
          {/* Check-Out Information */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Thông tin ra
            </h3>
            <p className="text-lg">
              <strong>Giờ ra:</strong> {data.checkOutTime ? formatDate(data.checkOutTime) : "Chưa có thông tin"}
            </p>
            <p className="text-lg mt-2">
              <strong>Cổng ra:</strong> {data.gateOut || "Chưa có thông tin"}
            </p>
            <p className="text-lg mt-2">
              <strong>Cho phép bởi:</strong> {data.securityGateOut || "Chưa có thông tin"}
            </p>
          </div>
        </div>
      </div>
    )}
  </Content>
  );
};

export default HistoryDetail;
