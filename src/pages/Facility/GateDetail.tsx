import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Select,
  notification,
  Modal,
  Divider,
  Typography,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import ReactPlayer from "react-player";

import { useLocation, useNavigate, useParams } from "react-router";
import {
  useCreateGateMutation,
  useGetCameraByIdQuery,
  useGetListCameraTypeQuery,
  useGetListGateQuery,
  useUpdateGateMutation,
} from "../../services/gate.service";
import Gate from "../../types/gateType";
import LoadingState from "../../components/State/LoadingState";

const { Option } = Select;
const { Title, Text } = Typography;
interface GateDetailProps {
  selectedGate: Gate;
}
const GateDetail: React.FC = () => {
  const [form] = Form.useForm();
  const [cameraForm] = Form.useForm();

  const { id } = useParams();
  const {
    data: selectedGate,
    isLoading,
    isSuccess,
    refetch: refetchGate,
  } = useGetCameraByIdQuery({ gateId: Number(id) });
  const { data: cameraTypes } = useGetListCameraTypeQuery({});
  const [updateGate] = useUpdateGateMutation();
  const { refetch } = useGetListGateQuery({});
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const navigate = useNavigate();
  const handlePreview = () => {
    const camera = cameraForm.getFieldsValue();
    if (camera?.cameraURL) {
      setPreviewUrl(`${camera.cameraURL}libs/index.m3u8`);
      setIsPreviewVisible(true);
    } else {
      notification.warning({ message: "Please input URL first!" });
    }
  };

  // console.log("Gate detail:", cameraTypes);

  useEffect(() => {
    refetchGate();
    if (!isLoading && selectedGate) {
      form.setFieldsValue(selectedGate);
    }
  }, [selectedGate, form, isLoading, isSuccess]);

  console.log(selectedGate);
  console.log(
    form.getFieldValue(["cameras", 0, "cameraURL"]) + "libs/index.m3u8"
  );
  const handleAddCamera = () => {
    cameraForm
      .validateFields()
      .then((values) => {
        console.log(values);
        const cameras = form.getFieldValue("cameras") || [];
        form.setFieldsValue({
          cameras: [
            ...cameras,
            {
              ...values,

              cameraType: {
                cameraTypeId: values.cameraTypeId,
              },
            },
          ],
        });
        setIsCameraModalVisible(false);
        cameraForm.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const onFinish = async (values: any) => {
    try {
      const updatedCameras = values.cameras.map((camera: any) => ({
        ...camera,
        cameraTypeId: camera.cameraType.cameraTypeId,
        cameraId: 0,
        cameraURL: `${camera.cameraURL}`,
      }));

      const updatedValues = {
        ...values,
        status: true,
        cameras: updatedCameras,
      };

      await updateGate({ gate: updatedValues }).unwrap();
      await refetch();
      navigate("/gate");
      form.resetFields();
      notification.success({ message: "Chỉnh sửa cổng thành công!" });
    } catch (error) {
      console.error("Error creating gate:", error);
      notification.error({ message: "Có lỗi xảy ra chỉnh sửa cổng!" });
    }
  };
  if (isLoading) {
    return (
      <div>
        <LoadingState />
      </div>
    );
  } else {
    return (
      // <>
      //   <Card style={{ margin: "auto" }}>
      //     <Form form={form} onFinish={onFinish} layout="vertical">
      //       <Form.Item
      //         className="hidden"
      //         name="gateId"
      //         label="ID cổng"
      //         rules={[{ required: true, message: "Vui lòng nhập tên cổng!" }]}
      //       >
      //         <Input placeholder="Nhập tên cổng" />
      //       </Form.Item>
      //       <Form.Item
      //         name="gateName"
      //         label="Tên cổng"
      //         rules={[{ required: true, message: "Vui lòng nhập tên cổng!" }]}
      //       >
      //         <Input placeholder="Nhập tên cổng" />
      //       </Form.Item>

      //       <Form.Item
      //         name="description"
      //         label="Mô tả"
      //         rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
      //       >
      //         <Input.TextArea placeholder="Nhập mô tả" />
      //       </Form.Item>

      //       <Form.List name="cameras">
      //         {(fields, { remove }) => (
      //           <>
      //             {fields.map(
      //               ({ key, name, fieldKey, ...restField }, index) => (
      //                 <div
      //                   key={key}
      //                   style={{
      //                     display: "flex",
      //                     flexWrap: "wrap",
      //                     marginBottom: 8,
      //                     width: "50%",
      //                     paddingRight: index % 2 === 0 ? 8 : 0,
      //                     paddingLeft: index % 2 !== 0 ? 8 : 0,
      //                   }}
      //                 >
      //                   <div style={{ flex: "1 1 100%" }}>
      //                     <Form.Item
      //                       {...restField}
      //                       name={[name, "cameraURL"]}
      //                       fieldKey={[fieldKey, "cameraURL"]}
      //                       rules={[
      //                         {
      //                           required: true,
      //                           message: "Please input the stream cameraURL!",
      //                         },
      //                       ]}
      //                       className="hidden"
      //                     >
      //                       <Input
      //                         placeholder="cameraURL"
      //                         style={{ width: "100%" }}
      //                       />
      //                     </Form.Item>
      //                     <Form.Item
      //                       {...restField}
      //                       name={[name, "description"]}
      //                       fieldKey={[fieldKey, "description"]}
      //                       rules={[
      //                         {
      //                           required: true,
      //                           message: "Please input the camera description!",
      //                         },
      //                       ]}
      //                     >
      //                       <span style={{ width: "100%" }}>
      //                         {form.getFieldValue([
      //                           "cameras",
      //                           index,
      //                           "description",
      //                         ])}
      //                       </span>
      //                     </Form.Item>
      //                     <Form.Item
      //                       {...restField}
      //                       name={[name, "cameraType", "cameraTypeId"]}
      //                       fieldKey={[fieldKey, "cameraType", "cameraTypeId"]}
      //                       rules={[
      //                         {
      //                           required: true,
      //                           message: "Please select the camera type!",
      //                         },
      //                       ]}
      //                     >
      //                       <span style={{ width: "100%" }}>
      //                         {
      //                           cameraTypes?.find(
      //                             (type: any) =>
      //                               type.cameraTypeId ===
      //                               form.getFieldValue([
      //                                 "cameras",
      //                                 index,
      //                                 "cameraType",
      //                                 "cameraTypeId",
      //                               ])
      //                           )?.description
      //                         }
      //                       </span>
      //                     </Form.Item>
      //                   </div>
      //                   <div style={{ flex: "1 1 100%", marginTop: 8 }}>
      //                     <ReactPlayer
      //                       url={
      //                         form.getFieldValue([
      //                           "cameras",
      //                           index,
      //                           "cameraURL",
      //                         ]) + "libs/index.m3u8"
      //                       }
      //                       playing
      //                       controls
      //                       width="100%"
      //                       height="100px"
      //                     />
      //                     <MinusCircleOutlined
      //                       onClick={() => remove(name)}
      //                       style={{ marginTop: 8 }}
      //                     />
      //                   </div>
      //                 </div>
      //               )
      //             )}
      //             <Form.Item>
      //               <Button
      //                 type="dashed"
      //                 onClick={() => setIsCameraModalVisible(true)}
      //                 block
      //                 icon={<PlusOutlined />}
      //               >
      //                 Thêm mới Camera
      //               </Button>
      //             </Form.Item>
      //           </>
      //         )}
      //       </Form.List>

      //       <Form.Item>
      //         <Button type="primary" htmlType="submit">
      //           Cập nhật
      //         </Button>
      //       </Form.Item>
      //     </Form>
      //   </Card>

      //   <Modal
      //     title="Xem thử Camera"
      //     open={isPreviewVisible}
      //     onCancel={() => setIsPreviewVisible(false)}
      //     footer={null}
      //     width={800}
      //   >
      //     {previewUrl && (
      //       <ReactPlayer
      //         url={previewUrl}
      //         controls
      //         width="100%"
      //         height="auto"
      //         playing
      //       />
      //     )}
      //   </Modal>

      //   <Modal
      //     title="Thêm mới Camera"
      //     open={isCameraModalVisible}
      //     onCancel={() => setIsCameraModalVisible(false)}
      //     footer={[
      //       <Button key="cancel" onClick={() => setIsCameraModalVisible(false)}>
      //         Hủy
      //       </Button>,
      //       <Button key="preview" type="primary" onClick={handlePreview}>
      //         Xem thử
      //       </Button>,
      //       <Button key="submit" type="primary" onClick={handleAddCamera}>
      //         Thêm
      //       </Button>,
      //     ]}
      //   >
      //     <Form form={cameraForm} layout="vertical">
      //       <Form.Item
      //         name="cameraURL"
      //         label="URL"
      //         rules={[
      //           {
      //             required: true,
      //             message: "Please input the stream cameraURL!",
      //           },
      //         ]}
      //       >
      //         <Input placeholder="cameraURL" />
      //       </Form.Item>
      //       <Form.Item
      //         name="description"
      //         label="Mô tả"
      //         rules={[
      //           {
      //             required: true,
      //             message: "Please input the camera description!",
      //           },
      //         ]}
      //       >
      //         <Input placeholder="Mô tả camera" />
      //       </Form.Item>
      //       <Form.Item
      //         name="cameraTypeId"
      //         label="Loại camera"
      //         rules={[
      //           { required: true, message: "Please select the camera type!" },
      //         ]}
      //       >
      //         <Select placeholder="Chọn loại camera">
      //           {cameraTypes?.map((type: any) => (
      //             <Option key={type.cameraTypeId} value={type.cameraTypeId}>
      //               {type.description}
      //             </Option>
      //           ))}
      //         </Select>
      //       </Form.Item>
      //     </Form>
      //   </Modal>
      // </>
      <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
        <Card
          title={
            <div className="flex items-center gap-3 py-2">
              <VideoCameraOutlined className="text-blue-500 text-xl" />
              <div>
                <Title level={4} className="!mb-0">
                  Chi tiết cổng kiểm soát
                </Title>
                <Text type="secondary">
                  Quản lý thông tin và camera của cổng
                </Text>
              </div>
            </div>
          }
          className="shadow-lg rounded-xl !border-none"
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Form.Item
                className="hidden"
                name="gateId"
                label="ID cổng"
                rules={[{ required: true, message: "Vui lòng nhập tên cổng!" }]}
              >
                <Input />
              </Form.Item>

              <Card className="!border-none shadow-md">
                <Form.Item
                  name="gateName"
                  label={
                    <span className="text-base flex items-center gap-2">
                      <EditOutlined className="text-blue-500" />
                      <span className="font-medium">Tên cổng</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tên cổng!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên cổng"
                    className="rounded-lg h-11"
                    size="large"
                  />
                </Form.Item>
              </Card>

              <Card className="!border-none shadow-md">
                <Form.Item
                  name="description"
                  label={
                    <span className="text-base flex items-center gap-2">
                      <InfoCircleOutlined className="text-blue-500" />
                      <span className="font-medium">Mô tả</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
                  tooltip="Thông tin mô tả chi tiết về cổng kiểm soát"
                >
                  <Input.TextArea
                    placeholder="Nhập mô tả chi tiết về cổng kiểm soát"
                    className="rounded-lg"
                    rows={4}
                    style={{ resize: "none" }}
                  />
                </Form.Item>
              </Card>
            </div>

            <Divider>
              <span className="text-gray-500 px-4 flex items-center gap-2">
                <VideoCameraOutlined />
                <span className="font-medium">Danh sách Camera</span>
              </span>
            </Divider>

            <Form.List name="cameras">
              {(fields, { remove }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fields.map(
                    ({ key, name, fieldKey, ...restField }, index) => (
                      <Card
                        key={key}
                        className="shadow-md hover:shadow-lg transition-all duration-300 !border-none"
                        bodyStyle={{ padding: 0 }}
                      >
                        <div>
                          <Form.Item
                            {...restField}
                            name={[name, "cameraURL"]}
                            fieldKey={[fieldKey, "cameraURL"]}
                            className="hidden"
                          >
                            <Input />
                          </Form.Item>

                          <div className="aspect-video rounded-t-lg overflow-hidden bg-black">
                            <ReactPlayer
                              url={
                                form.getFieldValue([
                                  "cameras",
                                  index,
                                  "cameraURL",
                                ]) + "libs/index.m3u8"
                              }
                              playing
                              controls
                              width="100%"
                              height="100%"
                            />
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="font-semibold text-gray-800">
                              {form.getFieldValue([
                                "cameras",
                                index,
                                "description",
                              ])}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <VideoCameraOutlined />
                              <span>
                                {
                                  cameraTypes?.find(
                                    (type: any) =>
                                      type.cameraTypeId ===
                                      form.getFieldValue([
                                        "cameras",
                                        index,
                                        "cameraType",
                                        "cameraTypeId",
                                      ])
                                  )?.description
                                }
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100">
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                              className="w-full h-12 flex items-center justify-center gap-2 hover:bg-red-50"
                            >
                              Xóa camera
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  )}

                  <Card
                    className="flex items-center justify-center min-h-[300px] border-2 border-dashed 
                           border-gray-200 hover:border-blue-400 transition-colors cursor-pointer
                           hover:bg-blue-50/50"
                    onClick={() => setIsCameraModalVisible(true)}
                  >
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                        <PlusOutlined className="text-xl text-blue-500" />
                      </div>
                      <div className="text-gray-600 font-medium">
                        Thêm Camera mới
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </Form.List>

            <div className="flex justify-end pt-6">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="min-w-[140px] h-12 flex items-center justify-center"
              >
                <span className="text-base">Cập nhật</span>
              </Button>
            </div>
          </Form>
        </Card>

        {/* Camera Preview Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EyeOutlined className="text-blue-500" />
              <span className="text-lg font-medium">Xem thử Camera</span>
            </div>
          }
          open={isPreviewVisible}
          onCancel={() => setIsPreviewVisible(false)}
          footer={null}
          width={800}
          className="camera-preview-modal"
          centered
        >
          {previewUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <ReactPlayer
                url={previewUrl}
                controls
                width="100%"
                height="100%"
                playing
              />
            </div>
          )}
        </Modal>

        {/* Add Camera Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <PlusOutlined className="text-blue-500" />
              <span className="text-lg font-medium">Thêm mới Camera</span>
            </div>
          }
          open={isCameraModalVisible}
          onCancel={() => setIsCameraModalVisible(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setIsCameraModalVisible(false)}
              size="large"
              className="min-w-[100px]"
            >
              Hủy
            </Button>,
            <Button
              key="preview"
              type="default"
              onClick={handlePreview}
              size="large"
              className="min-w-[100px]"
              icon={<EyeOutlined />}
            >
              Xem thử
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleAddCamera}
              size="large"
              className="min-w-[100px]"
            >
              Thêm
            </Button>,
          ]}
          width={600}
          centered
        >
          <Form form={cameraForm} layout="vertical" className="space-y-5 pt-4">
            <Form.Item
              name="cameraURL"
              label={
                <span className="text-base flex items-center gap-2">
                  <span className="font-medium">URL Camera</span>
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập URL camera!" }]}
            >
              <Input
                prefix={<VideoCameraOutlined className="text-gray-400" />}
                placeholder="Nhập URL camera"
                className="rounded-lg"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <span className="text-base flex items-center gap-2">
                  <span className="font-medium">Mô tả</span>
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập mô tả camera!" },
              ]}
            >
              <Input.TextArea
                placeholder="Nhập mô tả chi tiết về camera"
                className="rounded-lg"
                rows={4}
                style={{ resize: "none" }}
              />
            </Form.Item>

            <Form.Item
              name="cameraTypeId"
              label={
                <span className="text-base flex items-center gap-2">
                  <span className="font-medium">Loại camera</span>
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng chọn loại camera!" },
              ]}
            >
              <Select
                placeholder="Chọn loại camera"
                className="rounded-lg"
                size="large"
                suffixIcon={<VideoCameraOutlined className="text-gray-400" />}
              >
                {cameraTypes?.map((type: any) => (
                  <Option key={type.cameraTypeId} value={type.cameraTypeId}>
                    {type.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
};

export default GateDetail;
