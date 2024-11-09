import { Table, Tag, Button, Input, Modal, DatePicker, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { useGetVisitGraphqlMutation } from "../../services/visitGraphql.service";
import { useDispatch, useSelector } from "react-redux";
import { setListOfVisitorSession } from "../../redux/slices/visitorSession.slice";
import VisitorSessionType from "../../types/visitorSessionType";
import { formatDate } from "../../utils/ultil";
import HistoryDetail from "./HistoryDetail";
import dayjs, { Dayjs } from "dayjs";
import { useGetListVisitQuery, useGetListVisitByDepartmentIdQuery, useGetListVisitByResponsiblePersonIdQuery } from "../../services/visitList.service";
import VisitList from "../../types/visitListType";

const { Option } = Select;

const History = () => {
  const userId = localStorage.getItem("userId");
  const departmentId = localStorage.getItem("departmentId");
  const userRole = localStorage.getItem("userRole");
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [checkinTimeFilter, setCheckinTimeFilter] = useState<Dayjs | null>(null);
  const [checkoutTimeFilter, setCheckoutTimeFilter] = useState<Dayjs | null>(null);
  const [gateInFilter, setGateInFilter] = useState<string>("");
  const [gateOutFilter, setGateOutFilter] = useState<string>("");
  const [visitIdFilter, setVisitIdFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const data: VisitorSessionType[] = [];
  const [filteredData, setFilteredData] = useState<VisitorSessionType[]>(data);
  const [postGraphql] = useGetVisitGraphqlMutation();
  const dispatch = useDispatch();
  const dataList = useSelector<any>(
    (s) => s.visitorSession.data
  ) as VisitorSessionType[];
  const [updatedData, setUpdatedData] = useState<VisitorSessionType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VisitorSessionType | null>(null);

  let dataVisit, isLoadingVisit;

  if (userRole === "Staff") {
    ({ data: dataVisit, isLoading: isLoadingVisit } = useGetListVisitByResponsiblePersonIdQuery({ id: Number(userId), pageNumber: 1, pageSize: 100 }));
  } else if (userRole === "DepartmentManager") {
    ({ data: dataVisit, isLoading: isLoadingVisit } = useGetListVisitByDepartmentIdQuery({ departmentId: Number(departmentId), pageNumber: 1, pageSize: 100 }));
  } else {
    ({ data: dataVisit, isLoading: isLoadingVisit } = useGetListVisitQuery({ status: "", pageNumber: 1, pageSize: 100 }));
  }

  const applyFilters = () => {
    const filtered = updatedData.filter((entry) => {
      const matchesStatus = statusFilter ? entry.status === statusFilter : true;
      const matchesCheckinTime = checkinTimeFilter ? dayjs(entry.checkinTime).isSame(checkinTimeFilter, 'day') : true;
      const matchesCheckoutTime = checkoutTimeFilter ? dayjs(entry.checkoutTime).isSame(checkoutTimeFilter, 'day') : true;
      const matchesGateIn = gateInFilter ? entry.gateIn?.gateName === gateInFilter : true;
      const matchesGateOut = gateOutFilter ? entry.gateOut?.gateName === gateOutFilter : true;
      const matchesSearchText = searchText ? entry.visitor.visitorName.toLowerCase().includes(searchText.toLowerCase()) : true;
      const matchesVisitId = visitIdFilter ? entry.visit.visitId === visitIdFilter : true;
      return matchesStatus && matchesCheckinTime && matchesCheckoutTime && matchesGateIn && matchesGateOut && matchesSearchText && matchesVisitId;
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [statusFilter, checkinTimeFilter, checkoutTimeFilter, gateInFilter, gateOutFilter, searchText, visitIdFilter, updatedData]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleCheckinTimeFilter = (date: Dayjs | null) => {
    setCheckinTimeFilter(date);
  };

  const handleCheckoutTimeFilter = (date: Dayjs | null) => {
    setCheckoutTimeFilter(date);
  };

  const handleGateInFilter = (gate: string) => {
    setGateInFilter(gate);
  };

  const handleGateOutFilter = (gate: string) => {
    setGateOutFilter(gate);
  };

  const handleVisitIdFilter = (visitId: number) => {
    setVisitIdFilter(visitId);
  };

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setCheckinTimeFilter(null);
    setCheckoutTimeFilter(null);
    setGateInFilter("");
    setGateOutFilter("");
    setVisitIdFilter(null);
    applyFilters();
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
        visitorSessionId: element.visitorSessionId,
        visitor: {
          visitorId: element.visitor.visitorId,
          visitorName: element.visitor.visitorName,
          companyName: element.visitor.companyName,
        },
        visit: {
          visitId: element.visit.visitId,
        },
        visitDetailId: element.visitDetailId,
        checkinTime: element.checkinTime,
        checkoutTime: element.checkoutTime,
        gateIn: {
          gateId: element.gateIn?.gateId,
          gateName: element.gateIn?.gateName,
        },
        gateOut: {
          gateId: element.gateOut?.gateId,
          gateName: element.gateOut?.gateName,
        },
        key: index.toString(),
        securityIn: {
          fullName: element.securityIn?.fullName,
        },
        securityOut: {
          fullName: element.securityOut?.fullName,
        },
        status: element.status,
        images: element.images,
      }));
      setUpdatedData(updatedData as VisitorSessionType[]);
      setFilteredData(updatedData as VisitorSessionType[]); // Update filteredData with the new data
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
              visit{
                visitId
              },
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

  const columns: TableProps<VisitorSessionType>["columns"] = [
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
      title: "Cổng vào",
      dataIndex: ["gateIn", "gateName"],
      key: "gateName",
    },
    {
      title: "Giờ Vào",
      dataIndex: "checkinTime",
      key: "checkinTime",
      render: (text) => formatDate(text),
      sorter: (a, b) =>
        new Date(a.checkinTime).getTime() - new Date(b.checkinTime).getTime(),
    },
    {
      title: "Cổng ra",
      dataIndex: ["gateOut", "gateName"],
      key: "gateName",
    },
    {
      title: "Giờ Ra",
      dataIndex: "checkoutTime",
      key: "checkoutTime",
      render: (text) => formatDate(text) || "Khách còn ở trong công ty",
      sorter: (a, b) =>
        new Date(a.checkoutTime).getTime() - new Date(b.checkoutTime).getTime(),
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

  // Get unique gate names for gateIn and gateOut
  const uniqueGateInNames = Array.from(new Set(updatedData.map(entry => entry.gateIn?.gateName).filter(Boolean)));
  const uniqueGateOutNames = Array.from(new Set(updatedData.map(entry => entry.gateOut?.gateName).filter(Boolean)));

  return (
    <div>
      <Input
        placeholder="Tìm kiếm theo tên khách"
        value={searchText}
        onChange={handleSearchTextChange}
        style={{ marginBottom: 16, width: 300 }}
      />
      <DatePicker
        placeholder="Chọn ngày vào"
        value={checkinTimeFilter}
        onChange={handleCheckinTimeFilter}
        style={{ marginBottom: 16, marginRight: 8 }}
      />
      <DatePicker
        placeholder="Chọn ngày ra"
        value={checkoutTimeFilter}
        onChange={handleCheckoutTimeFilter}
        style={{ marginBottom: 16, marginRight: 8 }}
      />
      <Select
        placeholder="Chọn cổng vào"
        value={gateInFilter || undefined}
        onChange={handleGateInFilter}
        style={{ marginBottom: 16, marginRight: 8, width: 200 }}
      >
        {uniqueGateInNames.map((gateName) => (
          <Option value={gateName}>
            {gateName}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Chọn cổng ra"
        value={gateOutFilter || undefined}
        onChange={handleGateOutFilter}
        style={{ marginBottom: 16, marginRight: 8, width: 200 }}
      >
        {uniqueGateOutNames.map((gateName) => (
          <Option value={gateName}>
            {gateName}
          </Option>
        ))}
      </Select>
      <Select
        placeholder="Chọn trạng thái"
        value={statusFilter || undefined}
        onChange={handleStatusFilter}
        defaultValue=""
        style={{ marginBottom: 16, marginRight: 8, width: 200 }}
      >
        <Option value="">Tất cả</Option>
        <Option value="CheckIn">Đã vào</Option>
        <Option value="CheckOut">Đã ra</Option>
      </Select>
      {isLoadingVisit ? (
        <Spin style={{ marginBottom: 16 }} />
      ) : (
        <Select
          placeholder="Chọn tên chuyến thăm"
          value={visitIdFilter || undefined}
          onChange={handleVisitIdFilter}
          style={{ marginBottom: 16, marginRight: 8, width: 200 }}
        >
          {dataVisit?.map((visit: VisitList) => (
            <Option key={visit.visitId} value={visit.visitId}>
              {visit.visitName}
            </Option>
          ))}
        </Select>
      )}
      <Button onClick={clearFilters} style={{ marginBottom: 16 }}>
        Xóa bộ lọc
      </Button>
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