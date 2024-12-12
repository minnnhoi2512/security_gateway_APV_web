import { Card, Col, Descriptions, Layout, Row, Spin } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import { useGetVisitGraphqlMutation } from "../../services/visitGraphql.service";
import { setListOfVisitorSession } from "../../redux/slices/visitorSession.slice";
import VisitorSessionType from "../../types/visitorSessionType";

const { Content } = Layout;

const HistoryDetail = () => {
  const dispatch = useDispatch();
  const [postGraphql] = useGetVisitGraphqlMutation();
  const [result, setResult] = useState<VisitorSessionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const body = makeQuery(Number(id));
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

  function makeQuery(visitorSessionId: number) {
    return {
      query: `
        query {
          visitorSession(take: 100, order: [{ visitorSessionId: DESC }], where: { visitorSessionId: { eq: ${visitorSessionId} } }) {
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
    return (
      <Content className="p-6 bg-gray-100">
        <Spin size="large" />
      </Content>
    );
  }

  if (result.length === 0) {
    return (
      <Content className="p-6 bg-gray-100">
        <p>No data found</p>
      </Content>
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
  console.log(result[0]);
  return (
    <Content className="p-6 bg-gray-100">
      <Descriptions title="Chi tiết lịch sử" bordered>
        <Descriptions.Item label="ID phiên">
          {visitorSessionId.toString()}
        </Descriptions.Item>
        <Descriptions.Item label="Tên khách">
          {visitor.visitorName}
        </Descriptions.Item>
        <Descriptions.Item label="Công ty">
          {visitor.companyName}
        </Descriptions.Item>
        <Descriptions.Item label="Tên lịch trình">
          {visit.visitName}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian vào">
          {dayjs(checkinTime).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian ra">
          {checkoutTime
            ? dayjs(checkoutTime).format("DD/MM/YYYY HH:mm")
            : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Cổng vào">
          {gateIn?.gateName}
        </Descriptions.Item>
        <Descriptions.Item label="Cổng ra">
          {gateOut?.gateName}
        </Descriptions.Item>
        <Descriptions.Item label="Bảo vệ vào">
          {securityIn?.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Bảo vệ ra">
          {securityOut?.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{status}</Descriptions.Item>
        <Descriptions.Item label="QR Card ID">
          {qrCardId.toString()}
        </Descriptions.Item>
      </Descriptions>

      <Card title="Hình ảnh" className="mt-4">
        <Row gutter={16}>
          {images.map((image, index) => (
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
    </Content>
  );
};

export default HistoryDetail;
