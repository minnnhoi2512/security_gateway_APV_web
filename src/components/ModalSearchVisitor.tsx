import { Button, Form, Input, Modal, Table } from 'antd'
import React, { useState } from 'react'

const ModalSearchVisitor: React.FC = () =>{
    const [credentialCard, setCredentialCard] = useState<string>(""); // Track input value for search
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const handleSelectVisitor = (visitor: any) => {
    }
    const [searchResults, setSearchResults] = useState<any[]>([]);
  return (
    <div>
           
            {/* Modal for adding new visitor */}
            <Modal
              title="Thêm thông tin khách thăm"
              visible={isModalVisible}
              footer={null}
              onCancel={() => setIsModalVisible(false)}
            >
              <Form layout="vertical">
                <Form.Item label="Nhập mã Căn cước (CredentialCard)">
                  <Input
                    value={credentialCard}
                    onChange={(e) => setCredentialCard(e.target.value)} // This only updates the state, no API call
                    placeholder="Nhập mã căn cước"
                  />
                </Form.Item>
                {/* This triggers the API call only on click */}
                {searchResults.length > 0 && (
                  <Table
                    columns={[
                      {
                        title: "Tên khách thăm",
                        dataIndex: "visitorName",
                        key: "visitorName",
                      },
                      {
                        title: "Tên công ty",
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
                      },
                      {
                        title: "Hành động",
                        dataIndex: "action",
                        key: "action",
                        render: (_: any, record: any) => (
                          <div>
                            <Button onClick={() => handleSelectVisitor(record)}>
                              Chọn
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    dataSource={searchResults}
                    pagination={false}
                  />
                )}
              </Form>
            </Modal>
          </div>
  )
}

export default ModalSearchVisitor