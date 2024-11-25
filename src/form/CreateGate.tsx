import React, { useState } from "react";
import { Form, Input, Button, Card, Space, Select, notification } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import {
  useCreateGateMutation,
  useGetListCameraTypeQuery,
  useGetListGateQuery,
} from "../services/gate.service";

const { Option } = Select;

const CreateGate: React.FC = () => {
  const [form] = Form.useForm();
  const { data: cameraTypes } = useGetListCameraTypeQuery({});
  const [createGate] = useCreateGateMutation();
  const { refetch } = useGetListGateQuery({});
  const onFinish = (values: any) => {
    try {
      console.log("Received values:", values.cameras);

      // Set captureURL and streamURL for each camera
      const updatedCameras = values.cameras.map((camera: any) => ({
        ...camera,
        captureURL: `${camera.URL}/capture-image`,
        streamURL: `${camera.URL}/libs/index.m3u8`,
      }));

      const updatedValues = {
        ...values,
        cameras: updatedCameras,
      };
      createGate({ gate: updatedValues })
        .unwrap()
        .then(() => {
          refetch();
          form.resetFields();
        });

      notification.success({ message: "Tạo cổng thành công !" });

      console.log("Updated values:", updatedValues);
    } catch (error) {
      console.error("Error creating gate:", error);
      notification.error({ message: "Có lỗi xảy ra khi tạo cổng!" });
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: "auto" }}>
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
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "URL"]}
                    fieldKey={[fieldKey, "URL"]}
                    rules={[
                      {
                        required: true,
                        message: "Please input the stream URL!",
                      },
                    ]}
                  >
                    <Input placeholder="URL" />
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
                    <Input placeholder="Mô tả camera" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "cameraTypeId"]}
                    fieldKey={[fieldKey, "cameraTypeId"]}
                    rules={[
                      {
                        required: true,
                        message: "Please select the camera type!",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn loại camera">
                      {cameraTypes?.map((type: any) => (
                        <Option
                          key={type.cameraTypeId}
                          value={type.cameraTypeId}
                        >
                          {type.description}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
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
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateGate;
