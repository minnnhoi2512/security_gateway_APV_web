import { FilterOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleStatusTab } from "../redux/slices/filterTab.slice";
import { Checkbox, Col, DatePicker, GetProp, Row, Slider } from "antd";
import dayjs, { Dayjs } from "dayjs";
import GraphqlQueryType from "../types/graphqlQueryType";
import { useGetVisitGraphqlMutation } from "../services/visitGraphql.service";
import { DatePickerProps } from "antd/lib";
import {
  cancelFilter,
  setListOfVisitList,
} from "../redux/slices/visitDetailList.slice";
import VisitDetailList from "../types/VisitDetailListType";

const FilterVisit: React.FC = () => {
  const statusTabs = useSelector<any>((s) => s.filterTabs.isOpen);
  const [expectedStartTime, SetExpectedStartTime] = useState<Dayjs>(dayjs().startOf('day'));
  const [expectedEndTime, SetExpectedEndTime] = useState<Dayjs>(dayjs().endOf('day'));
  const [visitQuantity, SetVisitQuantity] = useState<[number, number]>([1, 100]);
  const [scheduleTypeId, SetScheduleTypeId] = useState<any[]>([null,1, 2, 3, 4]);
  const [visitStatus, SetVisitStatus] = useState<string[]>([
    "Active",
    "Pending",
  ]);
  const [scheduleTypeIdDisplay, SetScheduleTypeIdDisplay] = useState<string[]>(
    []
  );
  const [visitStatusDisplay, SetVisitStatusDisplay] = useState<string[]>();
  const [postGraphql] = useGetVisitGraphqlMutation();
  const dispatch = useDispatch();
  const handleFilterTabs = () => {
    dispatch(toggleStatusTab());
  };

  const handleSubmitFilter = () => {
    var body = MakeQuery(
      expectedStartTime,
      expectedEndTime,
      visitQuantity,
      scheduleTypeId as never,
      visitStatus
    );
    console.log(body);
    postGraphql({
      query: body,
    })
      .unwrap()
      .then((payload) => {
        dispatch(
          setListOfVisitList(payload.data.visit?.items as VisitDetailList[])
        );
      });
  };
  const handleCancelFilter = () => {
    SetExpectedStartTime(dayjs().startOf('day'));
    SetExpectedEndTime(dayjs().endOf('day'));
    SetScheduleTypeId([1, 2, 3, 4]);
    SetScheduleTypeIdDisplay([]);
    SetVisitStatusDisplay([]);
    SetVisitStatus(["Active", "Pending"]);
    dispatch(cancelFilter());
  };
  const handleStartDateChange: DatePickerProps["onChange"] = (
    date,
  ) => {
    SetExpectedStartTime(date);
  };
  const handleEndDateChange: DatePickerProps["onChange"] = (
    date,
  ) => {
    SetExpectedEndTime(date);
  };
  const handleVisitScheduleType: GetProp<typeof Checkbox.Group, "onChange"> = (
    checkedValues
  ) => {
    SetScheduleTypeId(checkedValues as number[]);
    SetScheduleTypeIdDisplay(checkedValues as string[]);
  };
  const handlevisitStatusType: GetProp<typeof Checkbox.Group, "onChange"> = (
    checkedValues
  ) => {
    SetVisitStatus(checkedValues as string[]);
    SetVisitStatusDisplay(checkedValues as string[]);
  };

  function MakeQuery(
    expectedStartTime: dayjs.Dayjs,
    expectedEndTime: dayjs.Dayjs,
    visitQuantity: [number, number],
    scheduleTypeId: number[],
    visitStatus: string[] | undefined
  ) {
    var status = "[";
    visitStatus?.forEach((element) => {
      status += `"${element}",`;
    });
    status += "]";
    var schedule = "[";
    scheduleTypeId?.forEach((element) => {
      schedule += `${element},`;
    });
    schedule += "]";
    var queryPlain = `
            query{
         visit(take: 100,skip: 0,
        where:  {
            expectedStartTime:  {
        gte: "${
          expectedStartTime.format()?.toString().split("T")[0] + "T00:00:00+07:00"
        }"
            },
             and: [ {
             expectedEndTime:  {
                lte: "${
                  expectedEndTime.format()?.toString().split("T")[0] + "T23:59:59+07:00"
                }"
            }
            }],
            visitStatus:  {
                in: ${status}
            },
            visitQuantity:  {
                gte: ${visitQuantity[0]},
                lte: ${visitQuantity[1]}
                },
            schedule:  
            {
                   scheduleTypeId:  {
                      in: ${schedule}
                   }
                },    
                }){
             items{
      visitId,
      visitName,
      expectedStartTime,
      expectedEndTime,
      visitQuantity,
      visitStatus,
      description,
      createBy{
        fullName
      }
      ,
      schedule{
        scheduleId,
        scheduleName,
      },
      createTime,
      updateTime,
      createBy{
        fullName
      },
      updateBy{
        fullName
      },
    }
  }
}

        `;
    console.log(queryPlain);
    var query: GraphqlQueryType = {
      query: queryPlain,
    };
    return query;
  }

  return (
    <div
      className={`fixed top-0 right-0 bg-white shadow-2xl rounded-l-md w-96 h-full grid grid-rows-[60px_1fr_60px] transform transition-transform duration-500
        ${statusTabs === false ? "translate-x-full" : ""}`}
    >
      <div dir="ltr" className="grid grid-cols-5">
        <h2 className="ps-5 col-span-4 text-black text-2xl pt-5 font-bold">
          <FilterOutlined />
          Bộ lọc tìm kiếm
        </h2>
        <button className=" text-black" onClick={handleFilterTabs}>
          X
        </button>
      </div>
      <div className="grid-rows-4 overflow-y-auto block">
        <div className="p-5 grid border-b-2 border-b-gray-400 h-fit">
          <div>
            <h3 className="text-black text-xl pt-5 font-semibold">Theo Ngày</h3>
          </div>
          <div className="ps-5 pt-3 inline-flex grid-cols-5">
            <p className="col-span-4 pe-5">Ngày bắt đầu</p>
            <DatePicker
              size="small"
              value={expectedStartTime}
              onChange={handleStartDateChange}
            />
          </div>
          <div className="ps-5 pt-3 inline-flex grid-cols-5">
            <p className="col-span-4 pe-5">Ngày kết thúc</p>
            <DatePicker
              size="small"
              value={expectedEndTime}
              minDate={expectedStartTime}
              onChange={handleEndDateChange}
            />
          </div>
        </div>
        <div className="p-5 grid border-b-2 border-b-gray-400 h-fit">
          <h3 className="text-black text-xl pt-5 font-semibold">
            Số Lượng Người
          </h3>
          <Slider
            range
            min={1}
            max={100}
            value={visitQuantity}
            // onChange={SetVisitQuantity}
          />
        </div>
        <div className="p-5 grid border-b-2 border-b-gray-400 h-fit">
          <h3 className="text-black text-xl pt-5 font-semibold">Loại</h3>
          <Checkbox.Group
            style={{ width: "100%", marginTop: "10px" }}
            value={scheduleTypeIdDisplay}
            onChange={handleVisitScheduleType}
          >
            <Row>
              <Col span={8}>
                <Checkbox value="1">Hằng Ngày</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="2">Theo Tuần</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="3">Theo Tháng</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="4">Dự Án</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </div>
        <div className="p-5 grid border-b-2 border-b-gray-400 h-fit">
          <h3 className="text-black text-xl pt-5 font-semibold">Trạng Thái</h3>
          <Checkbox.Group
            style={{ width: "100%", marginTop: "10px" }}
            value={visitStatusDisplay}
            onChange={handlevisitStatusType}
          >
            <Row>
              <Col span={8}>
                <Checkbox value="Active">Còn hiệu lực</Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox value="Pending">Đang đợi</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <button
          className="border-2 border-black text-black rounded-l-md font-bold"
          onClick={handleCancelFilter}
        >
          Xóa Tất Cả
        </button>
        <button
          className="bg-[#34495e] text-white font-bold"
          onClick={handleSubmitFilter}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default FilterVisit;