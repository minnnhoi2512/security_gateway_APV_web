import React, { useState } from "react";
import { Modal, Form, Input, Table, Image, Button, Tag } from "antd";
import CreateNewVisitor from "./CreateNewVisitor";
import SearchVisitor from "./SearchVisitor";

interface VisitorSearchModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  onVisitorSelected: (visitor: any) => void; // New prop for handling selected visitor
}

const VisitorSearchModal: React.FC<VisitorSearchModalProps> = ({
  isModalVisible,
  setIsModalVisible,
  onVisitorSelected, // Destructure new prop
}) => {
  const [credentialCard, setCredentialCard] = useState("");
  const [isCreateNewVisitorVisible, setIsCreateNewVisitorVisible] =
    useState(false);

  // New state for search results
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleCredentialCardChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentialCard(e.target.value);
  };

  const handleVisitorSelection = (visitor: any) => {
    setSearchResults([]);
    setCredentialCard("");
    onVisitorSelected([visitor]);
  };

  return (
    <Modal
      title="Tìm kiếm khách"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={1000}
    >
      <Form.Item
        validateStatus={
          credentialCard.length > 12 ||
          (credentialCard.length < 12 && credentialCard.length > 0)
            ? "error"
            : ""
        }
        help={
          credentialCard.length > 12 ||
          (credentialCard.length < 12 && credentialCard.length > 0)
            ? "Cần đúng 12 số."
            : ""
        }
      >
        <Input
          value={credentialCard}
          onChange={handleCredentialCardChange}
          placeholder="Nhập mã căn cước (12 số)"
        />
        {credentialCard.length === 12 && (
          <SearchVisitor
            credentialCard={credentialCard}
            onVisitorFound={setSearchResults}
          ></SearchVisitor>
        )}
      </Form.Item>

      {searchResults.length > 0 && (
        <Table
          dataSource={searchResults}
          columns={[
            {
              title: "Ảnh căn cước",
              dataIndex: "visitorCredentialImage",
              key: "visitorCredentialImage",
              render: (image: string) => (
                <Image
                  src={`data:image/jpeg;base64,${image}`}
                  alt="Visitor Credential"
                  width={50}
                  height={50}
                  preview={false}
                  style={{ objectFit: "cover" }}
                />
              ),
            },
            {
              title: "Tên khách",
              dataIndex: "visitorName",
              key: "visitorName",
            },
            {
              title: "Công ty",
              dataIndex: "companyName",
              key: "companyName",
            },
            {
              title: "Mã căn cước",
              dataIndex: "credentialsCard",
              key: "credentialsCard",
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              key: "status",
              render: (status: string) => (
                <Tag color={status === "Unactive" ? "red" : "green"}>
                  {status === "Unactive" ? "Sổ đen" : "Hợp lệ"}
                </Tag>
              ),
            },
            {
              title: "Hành động",
              key: "action",
              render: (_, visitor) => (
                <Button onClick={() => handleVisitorSelection(visitor)}>
                  Chọn
                </Button>
              ),
            },
          ]}
          rowKey="visitorId"
          pagination={false}
        />
      )}
      {searchResults.length <= 0 && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <p>Không tìm thấy khách nào.</p>

          {/* Ant Design Button to open the CreateNewVisitor modal */}
          <Button
            type="primary" // Set button type to primary for a styled button
            onClick={() => {
              setIsCreateNewVisitorVisible(true); // Optionally set this state
            }}
            style={{ marginTop: "10px" }} // Optional margin for spacing
          >
            Thêm khách mới
          </Button>

          {isCreateNewVisitorVisible && (
            <CreateNewVisitor
              isModalVisible={isCreateNewVisitorVisible}
              setIsModalVisible={setIsCreateNewVisitorVisible}
              onVisitorCreated={(newVisitor) => {
                setSearchResults((prevResults) => [...prevResults, newVisitor]); // Add new visitor to search results
              }}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default VisitorSearchModal;
