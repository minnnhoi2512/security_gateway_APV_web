import { Layout, Tag, Spin, Descriptions, Card, Row, Col, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { useGetVisitGraphqlMutation } from "../../services/visitGraphql.service";
import VisitorSessionType from "../../types/visitorSessionType";
import { setListOfVisitorSession } from "../../redux/slices/visitorSession.slice";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import dayjs from "dayjs";
import { formatDateLocal } from "../../utils/ultil";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  LogIn,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { EyeOutlined } from "@ant-design/icons";
import {
  useGetImageVehicleSessionByVisitorQuery,
  useGetImageVehicleSessionQuery,
} from "../../services/sessionImage.service";

const { Content } = Layout;

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center"
    style={{ backgroundColor: "#34495e" }}
  >
    {React.cloneElement(children as React.ReactElement, {
      size: 16,
      className: "text-white",
    })}
  </div>
);

const HistoryCard: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-medium">{value || "N/A"}</span>
  </div>
);

const getStatusBadge = (status: String) => {
  const statusStr = String(status).valueOf().toLowerCase();

  if (statusStr === "checkin") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full">
        <LogIn size={16} />
        <span>Đã vào</span>
      </div>
    );
  }
  if (statusStr === "checkout") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full">
        <LogOut size={16} />
        <span>Đã ra</span>
      </div>
    );
  }
  return <div className="px-3 py-1.5 bg-gray-200 rounded-full">{status}</div>;
};

const convertImageType = (type: String): string => {
  const typeStr = String(type).valueOf();
  const typeMap: Record<string, string> = {
    CheckIn_Body: "Ảnh toàn thân lúc vào",
    CheckOut_Body: "Ảnh toàn thân lúc ra",
    CheckIn_Shoe: "Ảnh giày lúc vào",
    CheckOut_Shoe: "Ảnh giày lúc ra",
    CheckIn_Vehicle: "Ảnh xe lúc vào",
    LicensePlate_Out: "Ảnh xe lúc ra",
  };
  return typeMap[typeStr] || typeStr;
};

const renderSession = (session: VisitorSessionType) => (
  <Card key={session.visitorSessionId.toString()} className="mb-4">
    <Descriptions title="Chi tiết lịch sử" bordered>
      <Descriptions.Item label="ID phiên">
        {session.visitorSessionId.toString()}
      </Descriptions.Item>
      <Descriptions.Item label="Tên khách">
        {session.visitor.visitorName}
      </Descriptions.Item>
      <Descriptions.Item label="Công ty">
        {session.visitor.companyName}
      </Descriptions.Item>
      <Descriptions.Item label="Tên chuyến thăm">
        {session.visit.visitName}
      </Descriptions.Item>
      <Descriptions.Item label="Thời gian vào">
        {formatDateLocal(session.checkinTime)}
      </Descriptions.Item>
      <Descriptions.Item label="Thời gian ra">
        {session.checkoutTime ? formatDateLocal(session.checkoutTime) : "N/A"}
      </Descriptions.Item>
      <Descriptions.Item label="Cổng vào">
        {session.gateIn?.gateName}
      </Descriptions.Item>
      <Descriptions.Item label="Cổng ra">
        {session.gateOut?.gateName}
      </Descriptions.Item>
      <Descriptions.Item label="Bảo vệ vào">
        {session.securityIn?.fullName}
      </Descriptions.Item>
      <Descriptions.Item label="Bảo vệ ra">
        {session.securityOut?.fullName}
      </Descriptions.Item>
      <Descriptions.Item label="Trạng thái">{session.status}</Descriptions.Item>
      <Descriptions.Item label="QR Card ID">
        {session.qrCardId.toString()}
      </Descriptions.Item>
    </Descriptions>

    <Card title="Hình ảnh" className="mt-4">
      <Row gutter={16}>
        {session.images.map((image, index) => (
          <Col key={index} span={6}>
            <img
              src={image.imageURL}
              alt={`Image ${index + 1}`}
              style={{ width: "100%" }}
            />
            <div style={{ textAlign: "center", marginTop: "8px" }}>
              {image.imageType}
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  </Card>
);

const ListHistorySessionVisitor = () => {
  const dispatch = useDispatch();
  const [postGraphql] = useGetVisitGraphqlMutation();
  const [result, setResult] = useState<VisitorSessionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { id, visitorId } = useParams<{ id: string; visitorId: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(
    null
  );
  // const [imageVehicleSessions, setImageVehicleSessions] = useState([]);
  const { data: vehicleImageArray,isLoading } = useGetImageVehicleSessionByVisitorQuery({
    visitId: Number(id),
    visitorId: Number(visitorId),
  });
  // console.log(vehicleImageArray);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const body = makeQuery(Number(visitorId), Number(id));
      try {
        const payload = await postGraphql({ query: body }).unwrap();
        const visitorData =
          (payload.data.visitorSession?.items as VisitorSessionType[]) ||
          ([] as VisitorSessionType[]);

        // Add vehicleImage attribute to each item in visitorData based on visitorSessionId
        const updatedVisitorData = visitorData.map((item) => {
          const vehicleImageForSession = vehicleImageArray.find(
            (session) => session.visitorSessionId === item.visitorSessionId
          );
          // console.log(vehicleImageForSession)
          // console.log("item : ", item);
          return {
            ...item,
            vehicleImage: vehicleImageForSession
              ? vehicleImageForSession
              : null,
          };
        });
        setResult(updatedVisitorData);
        dispatch(setListOfVisitorSession(updatedVisitorData));
        // console.log(updatedVisitorData);
      } catch (error) {
        // console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, dispatch, postGraphql,visitorId,isLoading,vehicleImageArray]);

  function makeQuery(visitorId: number, visitId: number) {
    return {
      query: `
        query {
          visitorSession(take: 100, order: [{ visitorSessionId: DESC }], where: { visitor:  {
             visitorId:  {
                eq: ${visitorId}
             }
          },
          visit:  {
             visitId:  {
                eq: ${visitId}
             }
          }
             }) {
            items {
              visitorSessionId,
              images {
                imageURL,
                imageType
              },
              visitor {
                visitorId,
                visitorName,
                companyName,
                credentialsCard,
                visitCard{
                      visitCardId
                }
              },
              checkinTime,
              checkoutTime,
              qrCardId,
              visitDetailId,
              visit {
                visitId,
                visitName
              },
              securityIn {
                userId,
                fullName,
                phoneNumber
              },
              securityOut {
                userId,
                fullName,
                phoneNumber
              },
              gateIn {
                gateId,
                gateName
              },
              gateOut {
                gateId,
                gateName
              },
              status
            }
          }
        }
      `,
    };
  }

  if (loading) {
    return <Spin />;
  }

  // if (result.length <= 0) return "Khách này chưa có thông tin ra vào";
  if (result.length === 0 && loading === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy thông tin
            </h3>
            <p className="text-gray-500 mb-6">
              Khách này chưa có thông tin ra vào
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // <Content className="p-6 bg-gray-100">
    //   <h2 className="text-2xl font-semibold text-gray-800 mb-4">
    //     Lịch sử lượt ra vào
    //   </h2>
    //   {result.map(renderSession)}
    // </Content>
    <Content className="p-4 bg-gray-50">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Lịch sử ra vào
      </h2>

      {result.map((session) => (
        <Card
          key={`session-${session.visitorSessionId}`}
          className="mb-4 shadow-sm"
        >
          {/* Header with Session ID and Status */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <IconWrapper>
                <User />
              </IconWrapper>
              <div>
                <div className="font-medium">{session.visitor.visitorName}</div>
                <div className="text-sm text-gray-500">
                  {session.visitor.companyName}
                </div>
              </div>
            </div>
            {getStatusBadge(session.status)}
          </div>

          {/* Visit Details */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={24}>
              <HistoryCard
                label="Chuyến thăm"
                value={session.visit.visitName}
              />
            </Col>
          </Row>

          {/* Check In/Out Info */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card className="bg-gray-50 border-none">
                <div className="flex items-center gap-2 mb-2">
                  <IconWrapper>
                    <Shield />
                  </IconWrapper>
                  <span className="text-sm font-medium">Thông tin vào</span>
                </div>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <HistoryCard
                      label="Bảo vệ"
                      value={session.securityIn?.fullName}
                    />
                  </Col>
                  <Col span={12}>
                    <HistoryCard
                      label="Cổng"
                      value={session.gateIn?.gateName}
                    />
                  </Col>
                  <Col span={24}>
                    <HistoryCard
                      label="Thời gian"
                      value={formatDateLocal(session.checkinTime)}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card className="bg-gray-50 border-none">
                <div className="flex items-center gap-2 mb-2">
                  <IconWrapper>
                    <LogOut />
                  </IconWrapper>
                  <span className="text-sm font-medium">Thông tin ra</span>
                </div>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <HistoryCard
                      label="Bảo vệ"
                      value={session.securityOut?.fullName}
                    />
                  </Col>
                  <Col span={12}>
                    <HistoryCard
                      label="Cổng"
                      value={session.gateOut?.gateName}
                    />
                  </Col>
                  <Col span={24}>
                    <HistoryCard
                      label="Thời gian"
                      value={
                        session.checkoutTime
                          ? formatDateLocal(session.checkoutTime)
                          : "N/A"
                      }
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Images */}
          {session.images?.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <IconWrapper>
                  <EyeOutlined />
                </IconWrapper>
                <span className="text-sm font-medium">Hình ảnh</span>
              </div>
              <Row gutter={[8, 8]}>
                {session.images.map((image, index) => (
                  <Col
                    key={`image-${session.visitorSessionId}-${index}`}
                    xs={12}
                    sm={8}
                    md={6}
                  >
                    <div
                      className="cursor-pointer relative group"
                      onClick={() => {
                        setSelectedImage(String(image.imageURL).valueOf());
                        setSelectedImageType(String(image.imageType).valueOf());
                      }}
                    >
                      <img
                        src={image.imageURL}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <EyeOutlined className="text-white opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-xs text-center mt-1 px-2 py-1 bg-gray-100 rounded">
                        {convertImageType(image.imageType)}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <IconWrapper>
                <Car />
              </IconWrapper>
              <span className="text-sm font-medium">Thông tin xe</span>
            </div>

            {session.vehicleImage ? (
              <>
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <HistoryCard
                    label="Biển số xe"
                    value={session.vehicleImage.licensePlate}
                  />
                </div>

                <Row gutter={[8, 8]}>
                  {session.vehicleImage.images.map((image, index) => (
                    <Col
                      key={`vehicle-image-${session.visitorSessionId}-${index}`}
                      xs={12}
                      sm={8}
                      md={6}
                    >
                      <div
                        className="cursor-pointer relative group"
                        onClick={() => {
                          setSelectedImage(
                            String(image.imageURL).replace(/"+$/, "")
                          );
                          setSelectedImageType(String(image.imageType));
                        }}
                      >
                        <img
                          src={image.imageURL.replace(/"+$/, "")}
                          alt={`Vehicle Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <EyeOutlined className="text-white opacity-0 group-hover:opacity-100" />
                        </div>
                        <div className="text-xs text-center mt-1 px-2 py-1 bg-gray-100 rounded">
                          {convertImageType(image.imageType)}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                Khách không đi kèm phương tiện
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* <Modal
        open={!!selectedImage}
        footer={null}
        onCancel={() => {
          setSelectedImage(null);
          setSelectedImageType(null);
        }}
        width="80%"
        centered
        title={
          selectedImageType
            ? convertImageType(selectedImageType as String)
            : "Hình ảnh"
        }
      >
        <img
          src={selectedImage || ""}
          alt="Full size"
          className="w-full h-auto"
        />
      </Modal> */}
      <Modal
        open={!!selectedImage}
        footer={null}
        onCancel={() => {
          setSelectedImage(null);
          setSelectedImageType(null);
        }}
        width="80%"
        centered
        title={
          selectedImageType
            ? convertImageType(selectedImageType as String)
            : "Hình ảnh"
        }
      >
        <img
          src={selectedImage || ""}
          alt="Full size"
          className="w-full h-auto"
        />
      </Modal>
    </Content>
  );
};

export default ListHistorySessionVisitor;
