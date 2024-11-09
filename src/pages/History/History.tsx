import { Table, Tag, Button, Input, Space, Modal } from "antd";
import { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { useGetVisitGraphqlMutation } from "../../services/visitGraphql.service";
import { useDispatch, useSelector } from "react-redux";
import { setListOfVisitorSession } from "../../redux/slices/visitorSession.slice";
import VisitorSessionType from "../../types/visitorSessionType";
import { formatDate } from "../../utils/ultil";
import HistoryDetail from "./HistoryDetail";

interface DataType {
  key: String;
  id: Number;
  visitDetailId: Number;
  visitor: {
    visitorId: Number;
    visitorName: String;
    companyName: String;
  };
  checkInTime: Date;
  checkOutTime: Date;
  gateIn: String;
  gateOut: String;
  securityGateIn: String;
  securityGateOut: String;
  imageSrc: String;
  status: String;
}

const History = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const data: DataType[] = [];
  const [filteredData, setFilteredData] = useState<DataType[]>(data);
  const [postGraphql] = useGetVisitGraphqlMutation();
  const dispatch = useDispatch();
  const dataList = useSelector<any>(
    (s) => s.visitorSession.data
  ) as VisitorSessionType[];
  const [updatedData, setUpdatedData] = useState<DataType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataType | null>(null);

  const applyFilters = (status: string | null) => {
    const filtered = updatedData.filter((entry) => {
      const matchesStatus = status ? entry.status === status : true;
      return matchesStatus;
    });
    setFilteredData(filtered);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(status);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        const body = MakeQuery();
        const payload = await postGraphql({ query: body }).unwrap();
        dispatch(
          setListOfVisitorSession(
            payload.data.visitorSession?.items as VisitorSessionType[]
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (dataList) {
      const updatedData = dataList.map((element, index) => ({
        id: element.visitorSessionId,
        visitor: {
          visitorId: element.visitor.visitorId,
          visitorName: element.visitor.visitorName,
          companyName: element.visitor.companyName,
        },
        visitDetailId: element.visitDetailId,
        checkInTime: element.checkinTime,
        checkOutTime: element.checkoutTime,
        gateIn: element.gateIn?.gateName,
        gateOut: element.gateOut?.gateName,
        key: index.toString(),
        securityGateIn: element.securityIn?.fullName,
        securityGateOut: element.securityOut?.fullName,
        status: element.status,
        imageSrc: element.images[0].imageURL,
      }));
      setUpdatedData(updatedData);
      setFilteredData(updatedData); // Update filteredData with the new data
    }
  }, [dispatch, dataList]);

  function MakeQuery() {
    return {
      query: `
        query {
          visitorSession(take: 100, order: [{ visitorSessionId: DESC }]) {
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
              }
              checkinTime,
              checkoutTime,
              qrCardId,
              visitDetailId,
              securityIn {
                userId, fullName, phoneNumber
              },
              securityOut {
                userId, fullName, phoneNumber
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

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "STT",
      key: "index",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Tên khách",
      dataIndex: ["visitor", "visitorName"],
      key: "visitorName",
    },
    {
      title: "Giờ Vào",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (text) => formatDate(text),
      sorter: (a, b) =>
        new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime(),
    },
    {
      title: "Giờ Ra",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (text) => formatDate(text) || "Khách còn ở trong công ty",
      sorter: (a, b) =>
        new Date(a.checkOutTime).getTime() - new Date(b.checkOutTime).getTime(),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => (
        <Tag color={status === "CheckIn" ? "volcano" : "green"}>
          {status === "CheckIn" ? "Đã vào" : "Đã ra"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() => {
            setSelectedRecord(record);
            setIsModalVisible(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  return (
    <div>
      <Input
        placeholder="Tìm kiếm theo tiêu đề"
        value={searchText}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Button onClick={() => handleStatusFilter("")}>Tất cả</Button>
      <Button onClick={() => handleStatusFilter("CheckIn")}>Đã vào</Button>
      <Button onClick={() => handleStatusFilter("CheckOut")}>Đã ra</Button>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
      />{" "}
      {/* Apply loading here */}
      <Modal
        title="Chi tiết lịch sử"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        {selectedRecord && <HistoryDetail data={selectedRecord} />}
      </Modal>
    </div>
  );
};

export default History;
