// src/components/ScheduleDetailModal.tsx
import React from 'react';
import { Modal, Button, notification, Collapse } from 'antd';
import { ScheduleUserType } from '../../types/ScheduleUserType';
import { useGetVisitByScheduleUserIdQuery } from '../../services/visitList.service';
import { useApproveScheduleMutation, useRejectScheduleMutation } from '../../services/scheduleUser.service';
import { isEntityError } from '../../utils/helpers';


const { Panel } = Collapse;
interface ScheduleUserModalDetailProps {
    isVisible: boolean;
    handleClose: () => void;
    selectedRecord: ScheduleUserType | null;
    refetch: () => void;
}

const ScheduleUserDetailModal: React.FC<ScheduleUserModalDetailProps> = ({ isVisible, handleClose, selectedRecord, refetch }) => {
    const scheduleUserId = selectedRecord?.id || 0;

    const { data, isFetching, isLoading, isError } = useGetVisitByScheduleUserIdQuery({ scheduleUserId: scheduleUserId }, { skip: scheduleUserId === 0 });
    const [rejectSchedule] = useRejectScheduleMutation();
    const [approveSchedule] = useApproveScheduleMutation();



console.log("LOG DATA: ", data);



    const handleRejectSchedule = async (id: number) => {
        try {
            await rejectSchedule(id).unwrap();
            notification.success({ message: 'Schedule rejected successfully' });
            handleClose();
            refetch(); 
        } catch (error) {
            notification.error({ message: 'Failed to reject schedule', description: "Lỗi không từ chối được" });
        }
    };
    const handleApproveSchedule = async (id: number) => {
        try {
            await approveSchedule(id).unwrap();
            notification.success({ message: 'Schedule approved successfully' });
            refetch(); 
            handleClose();
        } catch (error) {
            if (isEntityError(error)  ) {

                notification.error({ message: 'Failed to approve schedule', description: "Lỗi không duyệt được" });
            }
        }
    };
    return (
        <Modal
        title="Chi tiết lịch trình đã giao"
        visible={isVisible}
        onCancel={handleClose}
        width={800}
        footer={[
            <Button 
                key="approve" 
                type="primary" 
                className="bg-blue-500 mr-2"
                onClick={() => handleApproveSchedule(selectedRecord?.id || 0)}
                disabled={selectedRecord?.status !== "Assigned"}
            >
                Duyệt
            </Button>,
            <Button 
                key="reject" 
                type="primary" 
                danger 
                className="mr-2"
                onClick={() => handleRejectSchedule(selectedRecord?.id || 0)}
                disabled={selectedRecord?.status !== "Assigned"}
            >
                Từ chối
            </Button>,
            <Button key="close" onClick={handleClose}>
                Đóng
            </Button>,
        ]}
    >
        {selectedRecord && (
            <Collapse defaultActiveKey={['2']} className="mb-4">
                <Panel header="Thông tin lịch trình" key="1">
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>Tiêu đề:</strong> {selectedRecord.title}</p>
                        <p><strong>Mô tả:</strong> {selectedRecord.description}</p>
                        <p><strong>Ghi chú:</strong> {selectedRecord.note}</p>
                        <p><strong>Thời gian giao:</strong> {new Date(selectedRecord.assignTime).toLocaleString()}</p>
                        <p><strong>Thời hạn hoàn thành:</strong> {new Date(selectedRecord.deadlineTime).toLocaleString()}</p>
                        <p><strong>Trạng thái:</strong> {selectedRecord.status}</p>
                        <p><strong>Người giao việc:</strong> {selectedRecord.assignFrom.userName}</p>
                        <p><strong>Người nhận việc:</strong> {selectedRecord.assignTo.userName}</p>
                        <p><strong>Tên lịch trình:</strong> {selectedRecord.schedule.scheduleName}</p>
                        <p><strong>Loại lịch trình:</strong> {selectedRecord.schedule.scheduleType.scheduleTypeName}</p>
                    </div>
                </Panel>
            </Collapse>
        )}

        {data && !isError && (
            <Collapse defaultActiveKey={['2']} className="mb-4">
                <Panel header="Thông tin cuộc hẹn" key="1">
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>Tên cuộc hẹn:</strong> {data.visitName}</p>
                        <p><strong>Số lượng dự kiến:</strong> {data.visitQuantity}</p>
                        <p><strong>Thời gian bắt đầu:</strong> {new Date(data.expectedStartTime).toLocaleString()}</p>
                        <p><strong>Thời gian kết thúc:</strong> {new Date(data.expectedEndTime).toLocaleString()}</p>
                        <p><strong>Thời gian tạo:</strong> {new Date(data.createTime).toLocaleString()}</p>
                        <p><strong>Thời gian cập nhật:</strong> {new Date(data.updateTime).toLocaleString()}</p>
                        <p><strong>Trạng thái cuộc hẹn:</strong> {data.visitStatus}</p>
                        <p><strong>Người tạo:</strong> {data.createBy ? data.createBy.fullName : "N/A"}</p>
                        <p><strong>Mô tả:</strong> {data.description}</p>
                    </div>
                </Panel>

                {data.visitDetail && data.visitDetail.length > 0 && (
                    <Panel header="Chi tiết lịch trình đã giao" key="2">
                        <Collapse className="mb-4">
                            {data.visitDetail.map((detail: any, index: number) => (
                                <Panel header={`Khách thăm ${index + 1}: ${detail.visitor.visitorName}`} key={detail.visitDetailId}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <p><strong>ID Chi tiết:</strong> {detail.visitDetailId}</p>
                                        <p><strong>Giờ bắt đầu dự kiến:</strong> {detail.expectedStartHour}</p>
                                        <p><strong>Giờ kết thúc dự kiến:</strong> {detail.expectedEndHour}</p>
                                        <p><strong>Trạng thái:</strong> {detail.status ? "Đã xác nhận" : "Chưa xác nhận"}</p>
                                        <p><strong>Tên khách:</strong> {detail.visitor.visitorName}</p>
                                        <p><strong>Công ty:</strong> {detail.visitor.companyName}</p>
                                        <p><strong>Số điện thoại:</strong> {detail.visitor.phoneNumber}</p>
                                        <p><strong>Số thẻ:</strong> {detail.visitor.credentialsCard}</p>
                                    </div>
                                </Panel>
                            ))}
                        </Collapse>
                    </Panel>
                )}
            </Collapse>
        )}

        {!data && !isError && (
            <div className="text-center text-gray-500">Lịch trình chưa được tạo cuộc hẹn</div>
        )}
    </Modal>
    );
};

export default ScheduleUserDetailModal;