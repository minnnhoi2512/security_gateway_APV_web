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
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ReactPlayer from "react-player";

import { useLocation, useNavigate } from "react-router";
import {
  useCreateGateMutation,
  useGetListCameraTypeQuery,
  useGetListGateQuery,
} from "../../services/gate.service";
import Gate from "../../types/gateType";

const { Option } = Select;

interface GateDetailProps {
  selectedGate: Gate;
}
const GateDetail: React.FC = () => {
  const [form] = Form.useForm();
  const [cameraForm] = Form.useForm();
  const location = useLocation();
  const { selectedGate } = location.state || {};
  console.log(selectedGate);
  const { data: cameraTypes } = useGetListCameraTypeQuery({});
  const [createGate] = useCreateGateMutation();
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

  useEffect(() => {
    form.setFieldsValue(selectedGate);
  }, [selectedGate]);
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
        cameraURL: `${camera.cameraURL}`,
      }));

      const updatedValues = {
        ...values,
        status: true,
        cameras: updatedCameras,
      };

      await createGate({ gate: updatedValues }).unwrap();
      await refetch();
      navigate("/gate");
      form.resetFields();
      notification.success({ message: "Tạo cổng thành công!" });
    } catch (error) {
      console.error("Error creating gate:", error);
      notification.error({ message: "Có lỗi xảy ra khi tạo cổng!" });
    }
  };

  return (
    <>
      <Card style={{ margin: "auto" }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="gateName"
            label="Tên cổng"
            rules={[{ required: true, message: "Vui lòng nhập tên cổng!" }]}
          >
            <Input placeholder="Nhập tên cổng" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea placeholder="Nhập mô tả" />
          </Form.Item>

          <Form.List name="cameras">
            {(fields, { remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      marginBottom: 8,
                      width: "50%",
                      paddingRight: index % 2 === 0 ? 8 : 0,
                      paddingLeft: index % 2 !== 0 ? 8 : 0,
                    }}
                  >
                    <div style={{ flex: "1 1 100%" }}>
                      <Form.Item
                        {...restField}
                        name={[name, "cameraURL"]}
                        fieldKey={[fieldKey, "cameraURL"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input the stream cameraURL!",
                          },
                        ]}
                        className="hidden"
                      >
                        <Input
                          placeholder="cameraURL"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        fieldKey={[fieldKey, "description"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input the camera description!",
                          },
                        ]}
                      >
                        <span style={{ width: "100%" }}>
                          {form.getFieldValue([
                            "cameras",
                            index,
                            "description",
                          ])}
                        </span>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "cameraType", "cameraTypeId"]}
                        fieldKey={[fieldKey, "cameraType", "cameraTypeId"]}
                        rules={[
                          {
                            required: true,
                            message: "Please select the camera type!",
                          },
                        ]}
                      >
                        <span style={{ width: "100%" }}>
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
                      </Form.Item>
                    </div>
                    <div style={{ flex: "1 1 100%", marginTop: 8 }}>
                      <ReactPlayer
                        url={
                          form.getFieldValue(["cameras", index, "cameraURL"]) +
                          "libs/index.m3u8"
                        }
                        playing
                        controls
                        width="100%"
                        height="100px"
                      />
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => setIsCameraModalVisible(true)}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm mới Camera
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Xem thử Camera"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewUrl && (
          <ReactPlayer
            url={previewUrl}
            controls
            width="100%"
            height="auto"
            playing
          />
        )}
      </Modal>

      <Modal
        title="Thêm mới Camera"
        open={isCameraModalVisible}
        onCancel={() => setIsCameraModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCameraModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="preview" type="primary" onClick={handlePreview}>
            Xem thử
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddCamera}>
            Thêm
          </Button>,
        ]}
      >
        <Form form={cameraForm} layout="vertical">
          <Form.Item
            name="cameraURL"
            label="URL"
            rules={[
              { required: true, message: "Please input the stream cameraURL!" },
            ]}
          >
            <Input placeholder="cameraURL" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              {
                required: true,
                message: "Please input the camera description!",
              },
            ]}
          >
            <Input placeholder="Mô tả camera" />
          </Form.Item>
          <Form.Item
            name="cameraTypeId"
            label="Loại camera"
            rules={[
              { required: true, message: "Please select the camera type!" },
            ]}
          >
            <Select placeholder="Chọn loại camera">
              {cameraTypes?.map((type: any) => (
                <Option key={type.cameraTypeId} value={type.cameraTypeId}>
                  {type.description}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GateDetail;
