import React from "react";
import { Image, Layout, Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import {
  User,
  Clock,
  Shield,
  LogIn,
  LogOut,
  Camera,
  ArrowLeft,
  MapPin,
  AlertCircle,
  Search,
  Footprints,
  Car,
} from "lucide-react";
import { useGetVisitGraphqlMutation } from "../../services/visitGraphql.service";
import { setListOfVisitorSession } from "../../redux/slices/visitorSession.slice";
import { formatDateLocal } from "../../utils/ultil";

type SecurityRes = {
  userId?: number;
  fullName: string;
  phoneNumber?: string;
};

type GateRes = {
  gateId: number;
  gateName: string;
};

type SessionsImageRes = {
  visitorSessionsImageId?: number;
  imageType?: string;
  imageURL: string;
};

type VisitorSessionType = {
  visitorSessionId: number;
  visitor: {
    visitorId: number;
    visitorName: string;
    companyName: string;
  };
  qrCardId?: number;
  visit: {
    visitId: number;
    visitName: string;
  };
  checkinTime: Date;
  checkoutTime: Date;
  visitDetailId: number;
  securityIn: SecurityRes;
  securityOut: SecurityRes;
  gateIn: GateRes;
  gateOut: GateRes;
  status: string;
  images: SessionsImageRes[];
};

const { Content } = Layout;

const ImageModal = ({
  visible,
  image,
  onClose,
}: {
  visible: boolean;
  image: SessionsImageRes | null;
  onClose: () => void;
}) => (
  <Modal
    open={visible}
    footer={null}
    onCancel={onClose}
    width={800}
    className="p-0"
    centered
  >
    {image && (
      <div className="p-4">
        <img
          src={image.imageURL}
          alt={image.imageType || "Visit image"}
          className="w-full h-auto rounded-lg"
        />
        {image.imageType && (
          <p className="mt-2 text-center text-gray-600">{image.imageType}</p>
        )}
      </div>
    )}
  </Modal>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (
    status: string
  ): { bg: string; text: string; icon: JSX.Element; label: string } => {
    switch (status.toLowerCase()) {
      case "checkin":
        return {
          bg: "bg-[#27ae60] hover:!border-nonenone",
          text: "text-[#fbfcfc]",
          icon: <LogIn className="w-4 h-4 mr-2" />,
          label: "Đã vào",
        };
      case "checkout":
        return {
          bg: "bg-[#e74c3c] hover:!border-none",
          text: "text-[#fbfcfc]",
          icon: <LogOut className="w-4 h-4 mr-2" />,
          label: "Đã ra",
        };
      default:
        return {
          bg: "bg-orange-100 hover:bg-orange-200",
          text: "text-orange-700",
          icon: <AlertCircle className="w-4 h-4 mr-2" />,
          label: "Không xác định",
        };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <div
      className={`${styles.bg} ${styles.text} px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center font-medium cursor-default border border-transparent hover:border-current`}
    >
      {styles.icon}
      <span>{styles.label}</span>
    </div>
  );
};

const DetailCard = ({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    <div className="border-b border-gray-100 p-4 bg-gray-50 rounded-t-lg">
      <h3 className="font-medium flex items-center text-gray-800">
        <div className="p-1.5 rounded-lg bg-[#34495e] mr-2">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {title}
      </h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">{value || "N/A"}</span>
  </div>
);

const HistoryDetail = () => {
  const dispatch = useDispatch();
  const [postGraphql] = useGetVisitGraphqlMutation();
  const [result, setResult] = useState<VisitorSessionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<SessionsImageRes | null>(
    null
  );
 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const body = makeQuery(Number(id));
      try {
        const payload = await postGraphql({ query: body }).unwrap();
        const visitorData =
          (payload.data.visitorSession?.items as VisitorSessionType[]) || [];
        setResult(visitorData);
        dispatch(setListOfVisitorSession(visitorData));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, dispatch, postGraphql]);

  function makeQuery(visitorSessionId: number) {
    return {
      query: `
        query {
          visitorSession(take: 100, order: [{ visitorSessionId: DESC }], where: { visitorSessionId: { eq: ${visitorSessionId} } }) {
            items {
              visitorSessionId,
              images {
                imageURL,
                imageType,
                visitorSessionsImageId
              },
              visitor {
                visitorId,
                visitorName,
                companyName
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
 
  const getImageTypeInfo = (imageType: string) => {
    switch (imageType) {
      case "CheckIn_Body":
        return {
          label: "Ảnh toàn thân lúc vào",
          icon: <LogIn className="w-4 h-4 mr-1.5" />,
          color: "from-green-900/50",
        };
      case "CheckIn_Shoe":
        return {
          label: "Ảnh giày lúc vào",
          icon: <Footprints className="w-4 h-4 mr-1.5" />,
          color: "from-green-900/50",
        };
      case "CheckOut_Body":
        return {
          label: "Ảnh toàn thân lúc ra",
          icon: <LogOut className="w-4 h-4 mr-1.5" />,
          color: "from-blue-900/50",
        };
      case "CheckOut_Shoe":
        return {
          label: "Ảnh giày lúc ra",
          icon: <Footprints className="w-4 h-4 mr-1.5" />,
          color: "from-blue-900/50",
        };
      case "CheckIn_Vehicle":
        return {
          label: "Ảnh xe lúc vào",
          icon: <Car className="w-4 h-4 mr-1.5" />,
          color: "from-green-900/50",
        };
      case "CheckOut_Vehicle":
        return {
          label: "Ảnh xe lúc ra",
          icon: <Car className="w-4 h-4 mr-1.5" />,
          color: "from-blue-900/50",
        };
      default:
        return {
          label: imageType,
          icon: <Image className="w-4 h-4 mr-1.5" />,
          color: "from-gray-900/50",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (result.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-4">Không tìm thấy dữ liệu</p>
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      </div>
    );
  }

  const {
    visitorSessionId,
    images,
    visitor,
    checkinTime,
    checkoutTime,
    qrCardId,
    visit,
    securityIn,
    securityOut,
    gateIn,
    gateOut,
    status,
  } = result[0];
  console.log(qrCardId)
  return (
    <Content className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          <DetailCard
            icon={User}
            title="Thông tin phiên thăm"
            className="bg-white"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Mã phiên thăm</div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-semibold">
                    #{visitorSessionId}
                  </span>
                  {/* <button className="text-[#f7dc6f] hover:!text-[#f7dc6f]">
                    <Copy className="w-4 h-4" />
                  </button> */}
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
          </DetailCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DetailCard
                icon={MapPin}
                title="Cổng vào - ra"
                className="h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#58d68d] rounded-full"></div>
                      <span className="text-sm">
                        {gateIn?.gateName || "N/A"}
                      </span>
                    </div>
                    <div className="border-b border-dashed border-gray-300 flex-grow mx-4"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#e74c3c] rounded-full"></div>
                      <span className="text-sm">
                        {gateOut?.gateName || "N/A"}
                      </span>
                    </div>
                  </div>
                  {/* <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{
                        width:
                          status.toLowerCase() === "completed" ? "100%" : "50%",
                      }}
                    />
                  </div> */}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      {dayjs(checkinTime).format("HH:mm, DD/MM/YYYY")}
                    </span>
                    <span>
                      {checkoutTime
                        ? dayjs(checkoutTime).format("HH:mm, DD/MM/YYYY")
                        : "Đang diễn ra"}
                    </span>
                  </div>
                </div>
              </DetailCard>
            </div>

            {/* <DetailCard icon={Clock} title="Thời gian" className="h-full">
              <div className="space-y-2">
                <div className="text-3xl font-semibold text-gray-900">
                  {checkoutTime
                    ? dayjs(checkoutTime).diff(checkinTime, "minutes")
                    : "--"}
                  <span className="text-lg text-gray-500 ml-1">phút</span>
                </div>
                <p className="text-sm text-gray-500">Thời gian chuyến thăm</p>
              </div>
            </DetailCard> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DetailCard icon={User} title="Thông tin khách" className="h-full">
              <div className="divide-y divide-gray-100">
                <InfoRow label="Tên khách" value={visitor.visitorName} />
                <InfoRow label="Công ty" value={visitor.companyName} />
                <InfoRow label="Lịch trình" value={visit.visitName} />
                <InfoRow label="QR Card ID" value={qrCardId || "N/A"} />
              </div>
            </DetailCard>

            <DetailCard icon={Shield} title="Bảo vệ vào" className="h-full">
              <div className="divide-y divide-gray-100">
                <InfoRow label="Tên bảo vệ" value={securityIn?.fullName} />
                <InfoRow
                  label="Số điện thoại"
                  value={securityIn?.phoneNumber}
                />
                <InfoRow label="Cổng vào" value={gateIn?.gateName} />
                <InfoRow
                  label="Thời gian"
                  value={formatDateLocal(checkinTime)}
                />
              </div>
            </DetailCard>

            <DetailCard icon={Shield} title="Bảo vệ ra" className="h-full">
              <div className="divide-y divide-gray-100">
                <InfoRow label="Tên bảo vệ" value={securityOut?.fullName} />
                <InfoRow
                  label="Số điện thoại"
                  value={securityOut?.phoneNumber}
                />
                <InfoRow label="Cổng ra" value={gateOut?.gateName} />
                <InfoRow
                  label="Thời gian"
                  value={
                    checkoutTime
                      ? formatDateLocal(checkoutTime)
                      : "N/A"
                  }
                />
              </div>
            </DetailCard>
          </div>
        </div>

        {images && images.length > 0 && (
          <DetailCard icon={Camera} title="Hình ảnh" className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="cursor-pointer relative group"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200">
                    <img
                      src={image.imageURL}
                      alt={`Visit image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/*     
                  {image.imageType && (
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/70 rounded-b-lg transition-all duration-200">
                      <p className="text-white text-sm text-center truncate px-2">
                        {image.imageType}
                      </p>
                    </div>
                  )} */}
                  {image.imageType && (
                    <div
                      className={`absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t ${
                        getImageTypeInfo(image.imageType).color
                      } to-transparent group-hover:from-black/70 rounded-b-lg transition-all duration-200`}
                    >
                      <p className="text-white text-sm text-center truncate px-2 flex items-center justify-center">
                        {getImageTypeInfo(image.imageType).icon}
                        {getImageTypeInfo(image.imageType).label}
                      </p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Search className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        )}

        <ImageModal
          visible={!!selectedImage}
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      </div>
    </Content>
  );
};

export default HistoryDetail;
