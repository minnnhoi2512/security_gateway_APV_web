import { Button, Card, Input, notification } from "antd";
import { useState } from "react";
import axios from "axios";

export const Simulation = () => {
  const [visitorNumber, setVisitorNumber] = useState<string>("0");
  const [scheduleNumber, setScheduleNumber] = useState<string>("0");
  const [acceptTaskNumber, setAcceptTaskNumber] = useState<string>("0");
  const [rejectTaskNumber, setRejectTaskNumber] = useState<string>("0");
  const [checkinNumber, setCheckInNumber] = useState<string>("0");
  const [activeMode, setActiveMode] = useState<string>("visit");

  const handleSimulateVisit = async () => {
    try {
      await axios.get(
        `https://security-gateway-api.tools.kozow.com/api/Mock/Coflow1_1_CreateVisit`,
        {
          params: {
            requestOfStaff: 5,
            requestOfSecurity: 5,
          },
        }
      );
      notification.success({
        message:
          "Tạo mới thành công 5 chuyến thăm từ bảo vệ, 5 chuyến thăm từ nhân viên",
      });
    } catch (error) {
      notification.error({ message: "Có lỗi xảy ra khi gọi API" });
    } finally {
    }
  };
  const handleSimulateCheckIn = async () => {
    try {
      await axios.get(
        `https://security-gateway-api.tools.kozow.com/api/Mock/Coflow3_1_Check_in`,
        {
          params: {
            numberOfCheckIn: parseInt(checkinNumber) || 0,
          },
        }
      );
      notification.success({
        message: `Tạo mới thành công ${parseInt(checkinNumber)} lần check-in`,
      });
    } catch (error) {
      notification.error({ message: "Có lỗi xảy ra khi gọi API" });
    } finally {
    }
  };
  const handleSimulateUpdateTask = async () => {
    try {
      await axios.get(
        `https://security-gateway-api.tools.kozow.com/api/Mock/Coflow2_4_AcceptAndRejectTask`,
        {
          params: {
            numberOfReject: parseInt(rejectTaskNumber) || 0,
            numberOfAccept: parseInt(acceptTaskNumber) || 0,
          },
        }
      );
      notification.success({
        message: `Chấp nhận cho ${parseInt(
          rejectTaskNumber
        )} và từ chối cho ${parseInt(acceptTaskNumber)} nhiệm vụ thành công`,
      });
    } catch (error) {
      notification.error({ message: "Có lỗi xảy ra khi gọi API" });
    } finally {
    }
  };
  const handleSimulateVisitor = async () => {
    try {
      await axios.get(
        `https://security-gateway-api.tools.kozow.com/api/Mock/Coflow1_1_MockVisitor`,
        {
          params: {
            numberOfVisitor: parseInt(visitorNumber) || 0,
          },
        }
      );
      notification.success({
        message: `Tạo mới ${parseInt(visitorNumber)} khách thành công!`,
      });
    } catch (error) {
      notification.error({ message: "Có lỗi xảy ra khi gọi API" });
    } finally {
    }
  };
  const handleSimulateSchedule = async () => {
    try {
      await axios.get(
        `https://security-gateway-api.tools.kozow.com/api/Mock/Coflow2_1_CreateSchedule`,
        {
          params: {
            numberRequestOfSchedule: parseInt(scheduleNumber) || 0,
          },
        }
      );
      notification.success({
        message: `Tạo mới ${parseInt(scheduleNumber)} lịch trình thành công!`,
      });
    } catch (error) {
      notification.error({ message: "Có lỗi xảy ra khi gọi API" });
    } finally {
    }
  };
  const handleSimulateRejectFromSecurity = async () => {
    try {
      await axios.get(
        `https://security-gateway-api.tools.kozow.com/api/Mock/Coflow1_2_RejectVisitOfSecurity`,
        {}
      );
      notification.success({
        message:
          "Hệ thống đã tự động hủy 2 chuyến thăm từ nhân viên, báo cáo vi phạm 4 chuyến thăm từ bảo vệ và chấp nhận 1 chuyến thăm từ bảo vệ!",
      });
    } catch (error) {
      notification.error({ message: "Có lỗi xảy ra khi gọi API" });
    } finally {
    }
  };

  const renderContent = () => {
    const cardStyle = {
      maxWidth: "500px",
      margin: "0 auto",
    };

    const inputStyle = {
      width: "200px",
    };

    switch (activeMode) {
      case "visit":
        return (
          <Card className="w-full" style={cardStyle}>
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              <Button
                type="primary"
                className="w-48 mx-auto"
                onClick={handleSimulateVisit}
              >
                Tạo mới chuyến thăm
              </Button>
              <Button
                type="primary"
                className="w-48 mx-auto"
                onClick={handleSimulateRejectFromSecurity}
              >
                Cập nhật trạng thái
              </Button>
            </div>
          </Card>
        );

      case "visitor":
        return (
          <Card className="w-full" style={cardStyle}>
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Số lượng khách</h3>
                <Input
                  type="number"
                  value={visitorNumber}
                  onChange={(e) => setVisitorNumber(e.target.value)}
                  min={0}
                  style={inputStyle}
                />
              </div>
              <Button
                type="primary"
                className="w-48"
                onClick={handleSimulateVisitor}
              >
                Tạo mới khách
              </Button>
            </div>
          </Card>
        );

      case "schedule":
        return (
          <Card className="w-full" style={cardStyle}>
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Số lượng lịch trình
                </h3>
                <Input
                  type="number"
                  value={scheduleNumber}
                  onChange={(e) => setScheduleNumber(e.target.value)}
                  min={0}
                  style={inputStyle}
                />
              </div>
              <Button
                type="primary"
                className="w-48"
                onClick={handleSimulateSchedule}
              >
                Tạo mới lịch trình
              </Button>
            </div>
          </Card>
        );

      case "task":
        return (
          <Card className="w-full" style={cardStyle}>
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Số nhiệm vụ chấp nhận
                </h3>
                <Input
                  type="number"
                  value={acceptTaskNumber}
                  onChange={(e) => setAcceptTaskNumber(e.target.value)}
                  min={0}
                  style={inputStyle}
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Số nhiệm vụ từ chối
                </h3>
                <Input
                  type="number"
                  value={rejectTaskNumber}
                  onChange={(e) => setRejectTaskNumber(e.target.value)}
                  min={0}
                  style={inputStyle}
                />
              </div>
              <Button
                type="primary"
                className="w-48"
                onClick={handleSimulateUpdateTask}
              >
                Cập nhật trạng thái
              </Button>
            </div>
          </Card>
        );

      case "checkin":
        return (
          <Card className="w-full" style={cardStyle}>
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Số lần check-in</h3>
                <Input
                  type="number"
                  value={checkinNumber}
                  onChange={(e) => setCheckInNumber(e.target.value)}
                  min={0}
                  style={inputStyle}
                />
              </div>
              <Button
                type="primary"
                className="w-48"
                onClick={handleSimulateCheckIn}
              >
                Tạo mới check-in
              </Button>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="flex gap-4 p-8">
      <div className="w-64">
        <Card>
          <div className="flex flex-col gap-2">
            <Button
              type={activeMode === "visit" ? "primary" : "default"}
              block
              onClick={() => setActiveMode("visit")}
            >
              Chuyến thăm
            </Button>
            <Button
              type={activeMode === "visitor" ? "primary" : "default"}
              block
              onClick={() => setActiveMode("visitor")}
            >
              Khách
            </Button>
            <Button
              type={activeMode === "schedule" ? "primary" : "default"}
              block
              onClick={() => setActiveMode("schedule")}
            >
              Lịch trình
            </Button>
            <Button
              type={activeMode === "task" ? "primary" : "default"}
              block
              onClick={() => setActiveMode("task")}
            >
              Nhiệm vụ
            </Button>
            <Button
              type={activeMode === "checkin" ? "primary" : "default"}
              block
              onClick={() => setActiveMode("checkin")}
            >
              Check-in
            </Button>
          </div>
        </Card>
      </div>
      <div className="">{renderContent()}</div>
    </div>
  );
};
