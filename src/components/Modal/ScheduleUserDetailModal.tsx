// src/components/ScheduleDetailModal.tsx
import React from 'react';
import { Modal, Button, notification } from 'antd';
import { ScheduleUserType } from '../../types/ScheduleUserType';
import { useGetVisitByScheduleUserIdQuery } from '../../services/visitList.service';
import { useApproveScheduleMutation, useRejectScheduleMutation } from '../../services/scheduleUser.service';
import { isEntityError } from '../../utils/helpers';

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
            footer={[
                <Button key="close" onClick={handleClose}>
                    Đóng
                </Button>,
            ]}
        >
            {selectedRecord ? (
                <div>
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
            ) : (
                <div>Không có lịch hẹn nào.</div>
            )}
            {data && !isError ? (
                <div>
                    <h3>Thông tin cuộc hẹn</h3>
                    <div key={data.visitId}>
                        <p><strong>Tên cuộc hẹn:</strong> {data.visitName}</p>
                        <p><strong>Số lượng dự kiến:</strong> {data.visitQuantity}</p>
                        <p><strong>Thời gian bắt đầu:</strong> {new Date(data.expectedStartTime).toLocaleString()}</p>
                        <p><strong>Thời gian kết thúc:</strong> {new Date(data.expectedEndTime).toLocaleString()}</p>
                        <p><strong>Thời gian tạo:</strong> {new Date(data.createTime).toLocaleString()}</p>
                        <p><strong>Thời gian cập nhật:</strong> {new Date(data.updateTime).toLocaleString()}</p>
                        <p><strong>Trạng thái cuộc hẹn:</strong> {data.visitStatus}</p>
                        <p><strong>Người tạo:</strong> {data.createBy ? data.createBy.fullName : "N/A"}</p>
                        <p><strong>Mô tả:</strong> {data.description}</p>
                        {data.visitDetail && data.visitDetail.length > 0 ? (
                            <div>
                                <h4>Chi tiết khách đến thăm:</h4>
                                {data.visitDetail.map((detail: any) => (
                                    <div key={detail.visitDetailId} style={{ marginBottom: "10px" }}>
                                        <p><strong>ID Chi tiết:</strong> {detail.visitDetailId}</p>
                                        <p><strong>Giờ bắt đầu dự kiến:</strong> {detail.expectedStartHour}</p>
                                        <p><strong>Giờ kết thúc dự kiến:</strong> {detail.expectedEndHour}</p>
                                        <p><strong>Trạng thái:</strong> {detail.status ? "Đã xác nhận" : "Chưa xác nhận"}</p>
                                        <p><strong>Tên khách:</strong> {detail.visitor.visitorName}</p>
                                        <p><strong>Công ty:</strong> {detail.visitor.companyName}</p>
                                        <p><strong>Số điện thoại:</strong> {detail.visitor.phoneNumber}</p>
                                        <p><strong>Số thẻ:</strong> {detail.visitor.credentialsCard}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Không có chi tiết khách đến thăm</p>
                        )}
                    </div>

                </div>
            ) : (
                <div>Lịch trình chưa được tạo cuộc hẹn</div>
            )}
            <Button
                type="primary"
                className="bg-blue-500"
                onClick={() => { handleApproveSchedule(selectedRecord?.id || 0); }}
            >
                Duyệt
            </Button>
            <Button
                type="primary"
                className="bg-blue-500"
                onClick={() => { handleRejectSchedule(selectedRecord?.id || 0); }}
            >
                Từ chối
            </Button>
        </Modal>
    );
};

export default ScheduleUserDetailModal;