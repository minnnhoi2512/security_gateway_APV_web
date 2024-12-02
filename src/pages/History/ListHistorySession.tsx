import { Layout, Spin, Tag } from "antd";
import { formatDate, formatDateLocal } from "../../utils/ultil";
import { useEffect, useState } from "react";
import { useGetVisitGraphqlMutation } from "../../services/visitGraphql.service";
import VisitorSessionType from "../../types/visitorSessionType";
import { setListOfVisitorSession } from "../../redux/slices/visitorSession.slice";
import { useDispatch } from "react-redux";

const { Content } = Layout;

const ListHistorySesson = ({ data }: { data: any }) => {
  const dispatch = useDispatch();
  const [postGraphql] = useGetVisitGraphqlMutation();
  const [result, setResult] = useState<VisitorSessionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const body = makeQuery(data);
      try {
        const payload = await postGraphql({ query: body }).unwrap();
        const visitorData =
          (payload.data.visitorSession?.items as VisitorSessionType[]) ||
          ([] as VisitorSessionType[]);
        setResult(visitorData);
        dispatch(setListOfVisitorSession(visitorData));
      } catch (error) {
        console.error("Error fetching data:", error);
      }finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [data, dispatch, postGraphql]);

  function makeQuery(visitDetailId: number) {
    return {
      query: `
        query {
          visitorSession(take: 100, order: [{ visitorSessionId: DESC }], where: { visitDetailId: { eq: ${visitDetailId} } }) {
            items {
              visitorSessionId,
              images {
                imageURL,
                imageType
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
  if (loading) {
    return <Spin />;
  }
  if (result.length <= 0) return "Khách này chưa có thông tin ra vào";

  return (
    <Content className="p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Lịch sử lượt ra vào
      </h2>
      <div className="space-y-6">
        {result.map((session) => (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Thông tin lượt ra vào
            </h3>
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
              {/* Visitor Information */}
              <div className="flex-1">
                <p className="text-lg">
                  <strong>Tên khách:</strong>{" "}
                  {session.visitor?.visitorName || "N/A"}
                  <div>{}</div>
                </p>
                <p className="text-lg">
                  <strong>Công ty:</strong>{" "}
                  {session.visitor?.companyName || "N/A"}
                </p>
                <p className="text-lg mt-2">
                  <strong>Trạng thái:</strong>{" "}
                  <Tag color={session.status === "CheckOut" ? "green" : "red"}>
                    {session.status === "CheckOut" ? "Đã ra" : "Đã vào"}
                  </Tag>
                </p>
                <img
                  src={String(session.images[0].imageURL)}
                  alt="Visitor"
                  className="w-full max-w-xs mt-4 rounded-lg shadow-sm"
                />
              </div>

              {/* Divider */}
              <div className="hidden md:block border-l border-gray-300 mx-4"></div>

              {/* Check-In Information */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Thông tin vào
                </h4>
                <p className="text-lg">
                  <strong>Giờ vào:</strong>{" "}
                  {session.checkinTime
                    ? formatDateLocal(session.checkinTime)
                    : "N/A"}
                </p>
                <p className="text-lg mt-2">
                  <strong>Cổng vào:</strong> {session.gateIn?.gateName || "N/A"}
                </p>
                <p className="text-lg mt-2">
                  <strong>Cho phép bởi:</strong>{" "}
                  {session.securityIn?.fullName || "N/A"}
                </p>
              </div>

              {/* Divider */}
              <div className="hidden md:block border-l border-gray-300 mx-4"></div>

              {/* Check-Out Information */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Thông tin ra
                </h4>
                <p className="text-lg">
                  <strong>Giờ ra:</strong>{" "}
                  {session.checkoutTime
                    ? formatDateLocal(session.checkoutTime)
                    : "N/A"}
                </p>
                <p className="text-lg mt-2">
                  <strong>Cổng ra:</strong> {session.gateOut?.gateName || "N/A"}
                </p>
                <p className="text-lg mt-2">
                  <strong>Cho phép bởi:</strong>{" "}
                  {session.securityOut?.fullName || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Content>
  );
};

export default ListHistorySesson;
