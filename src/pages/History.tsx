import { Table, Tag, Button, Input, Space } from "antd";
import { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useGetVisitGraphqlMutation } from "../services/visitGraphql.service";
import GraphqlQueryType from "../types/graphqlQueryType";
import { useDispatch, useSelector } from "react-redux";
import { setListOfVisitorSession } from "../redux/slices/visitorSession.slice";
import VisitorSessionType from "../types/visitorSessionType";

interface DataType {
  key: String;
  id: Number;
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
  const data: DataType[] = [];
  const [filteredData, setFilteredData] = useState<DataType[]>(data); // Holds filtered data
  const [postGraphql] = useGetVisitGraphqlMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dataList = useSelector<any>(
    (s) => s.visitorSession.data
  ) as VisitorSessionType[];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    // Filter the data based on the search text
    const filtered = data.filter((entry) =>
      entry.gateOut.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    var body = MakeQuery();
    postGraphql({
      query: body,
    })
      .unwrap()
      .then((payload) => {
        dispatch(
          setListOfVisitorSession(
            payload.data.visitorSession?.items as VisitorSessionType[]
          )
        );
      });
  }, []);
  if (dataList) {
    dataList.forEach((element, index) => {
      data.push({
        id: element.visitorSessionId,
        checkInTime: element.checkinTime,
        checkOutTime: element.checkoutTime,
        gateIn: element.gateIn?.gateName,
        gateOut: element.gateOut?.gateName,
        key: index.toString(),
        securityGateIn: element.securityIn?.fullName,
        securityGateOut: element.securityOut?.fullName,
        status: element.status,
        imageSrc: element.images[0].imageURL,
      });
    });
  }
  function MakeQuery() {
    var queryPlain = `
        query{
  visitorSession(take: 100){
    items{
      visitorSessionId,
      images{
        imageURL,
        imageType
      },
      checkinTime,
      checkoutTime,
      qrCardId,
      visitDetailId,
      securityIn{
        userId,fullName,phoneNumber
      },
      securityOut{
        userId, fullName, phoneNumber
      },
      gateIn{
        gateId,
        gateName
      }
      ,
      gateOut{
        gateId,gateName
      },
      status
    }
  }
}
    `;

    var query: GraphqlQueryType = {
      query: queryPlain,
    };
    return query;
  }

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Giờ Vào",
      dataIndex: "checkInTime",
      key: "checkInTime",
      sorter: (a, b) =>
        new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime(),
    },
    {
      title: "Cổng Vào",
      dataIndex: "gateIn",
      key: "gateIn",
      sorter: (a, b) => a.gateIn.localeCompare(b.gateIn as string),
    },
    {
      title: "Giờ Ra",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      sorter: (a, b) =>
        new Date(a.checkOutTime).getTime() - new Date(b.checkOutTime).getTime(),
    },
    {
      title: "Cổng Ra",
      dataIndex: "gateOut",
      key: "gateOut",
      sorter: (a, b) => a.gateOut.localeCompare(b.gateOut as string),
    },
    // {
    //   title: "Khu vực",
    //   key: "area",
    //   dataIndex: "area",
    //   render: (_, { gateIn }) => (
    //     <>
    //       {gateIn.map((gateIn) => {
    //         let color = area.length > 5 ? "geekblue" : "green";
    //         return (
    //           <Tag color={color} key={area}>
    //             {area.toUpperCase()}
    //           </Tag>
    //         );
    //       })}
    //     </>
    //   ),
    // },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => {
        let color = status === "CheckIn" ? "volcano" : "green";
        return (
          <Tag color={color} key={""}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          size="middle"
          onClick={() =>
            navigate("/historyDetail", { state: { title: record.id } })
          }
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Tìm kiếm theo tiêu đề"
        value={searchText}
        onChange={handleSearchChange}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Space style={{ marginBottom: 16, display: "flex" }}>
        <Button
          type={"default"}
          // onClick={handleFilterTabs}
        >
          Bộ lọc tìm kiếm
        </Button>
      </Space>
      <Table columns={columns} dataSource={filteredData} />
    </div>
  );
};

export default History;
