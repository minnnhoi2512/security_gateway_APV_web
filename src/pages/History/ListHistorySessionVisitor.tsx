import { Layout, Tag, Spin, Descriptions, Card, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { useGetVisitGraphqlMutation } from "../../services/visitGraphql.service";
import VisitorSessionType from "../../types/visitorSessionType";
import { setListOfVisitorSession } from "../../redux/slices/visitorSession.slice";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import dayjs from "dayjs";

const { Content } = Layout;

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
      <Descriptions.Item label="Tên lịch trình">
        {session.visit.visitName}
      </Descriptions.Item>
      <Descriptions.Item label="Thời gian vào">
        {dayjs(session.checkinTime).format("DD/MM/YYYY HH:mm")}
      </Descriptions.Item>
      <Descriptions.Item label="Thời gian ra">
        {session.checkoutTime
          ? dayjs(session.checkoutTime).format("DD/MM/YYYY HH:mm")
          : "N/A"}
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
 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const body = makeQuery(Number(visitorId), Number(id));
      try {
        const payload = await postGraphql({ query: body }).unwrap();
        const visitorData =
          (payload.data.visitorSession?.items as VisitorSessionType[]) ||
          ([] as VisitorSessionType[]);
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

  console.log(result);
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
      {result.map(renderSession)}
    </Content>
  );
};

export default ListHistorySessionVisitor;
