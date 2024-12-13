import {
  Table,
  Tag,
  Button,
  Input,
  Modal,
  DatePicker,
  Select,
  Spin,
  Space,
  Popover,
  Card,
} from "antd";
import { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { useGetVisitGraphqlMutation } from "../../services/visitGraphql.service";
import { useDispatch, useSelector } from "react-redux";
import { setListOfVisitorSession } from "../../redux/slices/visitorSession.slice";
import VisitorSessionType from "../../types/visitorSessionType";
import { formatDate, formatDateLocal } from "../../utils/ultil";
import HistoryDetail from "./HistoryDetail";
import dayjs, { Dayjs } from "dayjs";
import {
  useGetListVisitQuery,
  useGetListVisitByDepartmentIdQuery,
  useGetListVisitByResponsiblePersonIdQuery,
} from "../../services/visitList.service";
import VisitList from "../../types/visitListType";
import LoadingState from "../../components/State/LoadingState";
import { Content } from "antd/es/layout/layout";
import {
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";

const { Option } = Select;

const History = () => {
  const userId = localStorage.getItem("userId");
  const departmentId = localStorage.getItem("departmentId");
  const userRole = localStorage.getItem("userRole");
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [checkinTimeFilter, setCheckinTimeFilter] = useState<Dayjs | null>(
    null
  );
  const [checkoutTimeFilter, setCheckoutTimeFilter] = useState<Dayjs | null>(
    null
  );
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
  const [selectedRecord, setSelectedRecord] =
    useState<VisitorSessionType | null>(null);
  const navigate = useNavigate();
  let dataVisit, isLoadingVisit;

  if (userRole === "Staff") {
    ({ data: dataVisit, isLoading: isLoadingVisit } =
      useGetListVisitByResponsiblePersonIdQuery({
        id: Number(userId),
        pageNumber: 1,
        pageSize: 100,
      }));
  } else if (userRole === "DepartmentManager") {
    ({ data: dataVisit, isLoading: isLoadingVisit } =
      useGetListVisitByDepartmentIdQuery({
        departmentId: Number(departmentId),
        pageNumber: 1,
        pageSize: 100,
      }));
  } else {
    ({ data: dataVisit, isLoading: isLoadingVisit } = useGetListVisitQuery({
      pageNumber: 1,
      pageSize: 100,
    }));
  }

  const applyFilters = () => {
    const filtered = updatedData.filter((entry) => {
      const matchesStatus = statusFilter ? entry.status === statusFilter : true;
      const matchesCheckinTime = checkinTimeFilter
        ? dayjs(entry.checkinTime).isSame(checkinTimeFilter, "day")
        : true;
      const matchesCheckoutTime = checkoutTimeFilter
        ? dayjs(entry.checkoutTime).isSame(checkoutTimeFilter, "day")
        : true;
      const matchesGateIn = gateInFilter
        ? entry.gateIn?.gateName === gateInFilter
        : true;
      const matchesGateOut = gateOutFilter
        ? entry.gateOut?.gateName === gateOutFilter
        : true;
      const matchesSearchText = searchText
        ? entry.visitor.visitorName
            .toLowerCase()
            .includes(searchText.toLowerCase())
        : true;
      const matchesVisitId = visitIdFilter
        ? entry.visit.visitId === visitIdFilter
        : true;
      return (
        matchesStatus &&
        matchesCheckinTime &&
        matchesCheckoutTime &&
        matchesGateIn &&
        matchesGateOut &&
        matchesSearchText &&
        matchesVisitId
      );
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [
    statusFilter,
    checkinTimeFilter,
    checkoutTimeFilter,
    gateInFilter,
    gateOutFilter,
    searchText,
    visitIdFilter,
    updatedData,
  ]);

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
    console.log(dataList);
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
          visitName: element.visit.visitName,
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
      console.log(dataList);
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
    // {
    //   title: "STT",
    //   key: "index",
    //   width: 80,
    //   render: (_text, _record, index) => index + 1,
    // },
    {
      title: "Tên khách",
      dataIndex: ["visitor", "visitorName"],
      key: "visitorName",
      render: (text) => <div className="font-medium">{text}</div>,
    },
    {
      title: "Cổng vào",
      dataIndex: ["gateIn", "gateName"],
      key: "gateName",
      render: (text) => (
        <Tag className="bg-yellow-50 border-yellow-200 text-yellow-600 rounded-md">
          {text}
        </Tag>
      ),
    },
    {
      title: "Giờ Vào",
      dataIndex: "checkinTime",
      key: "checkinTime",
      render: (text) => (
        <div className="text-gray-600">{formatDateLocal(text)}</div>
      ),
      sorter: (a, b) =>
        new Date(a.checkinTime).getTime() - new Date(b.checkinTime).getTime(),
    },
    {
      title: "Cổng ra",
      dataIndex: ["gateOut", "gateName"],
      key: "gateName",
      render: (text) =>
        text && (
          <Tag className="bg-green-50 border-green-200 text-green-600 rounded-md">
            {text}
          </Tag>
        ),
    },
    {
      title: "Giờ Ra",
      dataIndex: "checkoutTime",
      key: "checkoutTime",
      render: (text) => (
        <div className="text-gray-600">
          {formatDateLocal(text) || "Khách còn ở trong công ty"}
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.checkoutTime).getTime() - new Date(b.checkoutTime).getTime(),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => (
        <Tag
          className={`${
            status === "CheckIn"
              ? "bg-green-50 border-green-200 text-green-600"
              : "bg-gray-50 border-gray-200 text-gray-600"
          } rounded-md`}
        >
          {status === "CheckIn" ? "Đã vào" : "Đã ra"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            className="flex justify-center text-blue-500 hover:text-blue-600"
            icon={<EyeOutlined />}
            onClick={() => {
              navigate(`/history/sessionDetail/${record.visitorSessionId}`);
            }}
          />
          {/* <Button
            type="text"
            className="flex items-center text-blue-500 hover:text-blue-600"
            icon={<UserOutlined />}
          /> */}
        </Space>
      ),
    },
  ];

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

  // Get unique gate names for gateIn and gateOut
  const uniqueGateInNames = Array.from(
    new Set(updatedData.map((entry) => entry.gateIn?.gateName).filter(Boolean))
  );
  const uniqueGateOutNames = Array.from(
    new Set(updatedData.map((entry) => entry.gateOut?.gateName).filter(Boolean))
  );
  const filterContent = (
    <Space direction="vertical" className="w-64">
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
          <Option value={gateName}>{gateName}</Option>
        ))}
      </Select>
      <Select
        placeholder="Chọn cổng ra"
        value={gateOutFilter || undefined}
        onChange={handleGateOutFilter}
        style={{ marginBottom: 16, marginRight: 8, width: 200 }}
      >
        {uniqueGateOutNames.map((gateName) => (
          <Option value={gateName}>{gateName}</Option>
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
    </Space>
  );
  if (loading) return <LoadingState />;

  
  return (
    <Content className="p-2 max-w-[1200px] mx-auto mt-10">
      <div className="flex gap-4 mb-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Tìm kiếm theo tên khách"
            value={searchText}
            onChange={handleSearchTextChange}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-xs h-8"
          />
          <Popover content={filterContent} title="Bộ lọc" trigger="click">
            <Button icon={<FilterOutlined />} />
          </Popover>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="invisible"
          onClick={() => console.log("Haha")}
          style={{ borderRadius: 12 }}
        >
          Tạo mới
        </Button>
      </div>

      {/* <Table columns={columns} dataSource={filteredData} loading={loading} />{" "} */}
      <Card className="shadow-lg rounded-xl border-0">
        <div className="rounded-lg bg-white mx-auto" style={{ width: "100%" }}>
          <Table
            columns={columns}
            showSorterTooltip={false}
            dataSource={filteredData}
            loading={loading}
            pagination={{
              // pageSize: 8,
              size: "small",
              className: "mt-4",
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
              showTotal: (total) => `${total} kết quả`,
              position: ["bottomRight"],
            }}
            className={`w-full [&_.ant-table-thead_th]:!bg-[#34495e] [&_.ant-table-thead_th]:!text-white [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!py-3 [&_.ant-table-thead_th]:!text-sm hover:[&_.ant-table-tbody_tr]:bg-blue-50/30 [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-none [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-none [&_.ant-table-thead_th]:!transition-none`}
            size="middle"
            bordered={false}
            rowClassName="hover:bg-gray-50"
            style={{
              borderColor: "transparent",
              fontSize: "0.9rem",
            }}
          />
        </div>
      </Card>

      {/* Apply loading here */}
      {/* <Modal
        title="Chi tiết lịch sử"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        {selectedRecord && <HistoryDetail />}
      </Modal> */}
    </Content>
  );
};

export default History;
