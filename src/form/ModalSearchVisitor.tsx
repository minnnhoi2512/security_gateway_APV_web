import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Table, Image, Button, Tag, Spin } from "antd";
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
  const [isLoading, setIsLoading] = useState(false);
  const [displayResults, setDisplayResults] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);

  const [displayData, setDisplayData] = useState<any[]>([]);

  const handleCredentialCardChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentialCard(e.target.value);
  };

  const handleVisitorSelection = (visitor: any) => {
    setSearchResults([]);
    setDisplayResults([]);
    setCredentialCard("");
    onVisitorSelected([visitor]);
  };

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    if (results.length > 0) {
      setIsLoading(true);
      setDisplayData([]); // Clear current display data
      setTimeout(() => {
        setDisplayData(results); // Update display data after loading
        setIsLoading(false);
      }, 1000);
    } else {
      setDisplayData([]);
    }
  };

  useEffect(() => {
    if (searchResults.length > 0) {
      setIsLoading(true);
      setShowTable(false);

      const timer = setTimeout(() => {
        setShowTable(true);
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowTable(false);
    }
  }, [searchResults]);

  const renderImages = (images: any[]) => {
    const image = images[0];
    return (
      <Image
        key={1}
        src={`data:image/jpeg;base64,${image.imageURL}`}
        alt="Visitor image"
        width={50}
        height={50}
        preview={false}
        style={{ objectFit: "cover" }}
      />
    );
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
          placeholder="Nhập mã thẻ (12 số)"
        />
        {credentialCard.length === 12 && (
          <SearchVisitor
            credentialCard={credentialCard}
            onVisitorFound={setSearchResults}
          ></SearchVisitor>
        )}
      </Form.Item>
      {isLoading ? (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Spin tip="Đang tìm kiếm..." />
        </div>
      ) : (
        searchResults.length > 0 && (
          <Table
            dataSource={searchResults}
            columns={[
              {
                title: "Ảnh",
                dataIndex: "visitorImage",
                key: "visitorImage",
                render: renderImages,
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
                title: "Mã thẻ",
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
        )
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
