import { useEffect, useState } from "react";
import { Input, Button, List, Avatar, Dropdown, Menu } from "antd";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";
import "./chatList.css";
import {
  doc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { chatDB } from "../../../../api/firebase";
import { useGetListUserByRoleQuery } from "../../../../services/user.service";
import User from "../../../../types/userType";
import { v4 as uuidv4 } from "uuid";
import ChatDetail from "../ChatDetail";

const ChatList = ({ user }: any) => {
  const [roleName, setRoleName] = useState("Security");
  const { data: dataUser, isLoading } = useGetListUserByRoleQuery({
    pageNumber: 1,
    pageSize: 100,
    role: roleName,
  });
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null); // State to manage the selected chat
  const currentUser = user;

  const handleSelect = async (security: User) => {
    const chatQuery = query(
      collection(chatDB, "chats"),
      where("participants", "array-contains", currentUser.userId)
    );
    const chatQuerySnapshot = await getDocs(chatQuery);
    let chatRoomExists = false;
    let chatId = "";

    chatQuerySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(security.userId)) {
        chatRoomExists = true;
        chatId = doc.id;
      }
    });

    if (chatRoomExists) {
      setSelectedChat({ chatId, sender: user, receiver: security });
    } else {
      chatId = uuidv4();
      const chatDocRef = doc(chatDB, "chats", chatId);
      await setDoc(chatDocRef, {
        participants: [currentUser.userId, security.userId],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSelectedChat({ chatId, sender: user, receiver: security });
    }
  };

  // Filter data to exclude the current user
  useEffect(() => {
    if (dataUser) {
      const filteredData = dataUser.filter(
        (security: any) => security.userId !== currentUser.userId
      );
      setFilteredData(filteredData);
    }
  }, [dataUser, isLoading]);

  const handleMenuClick = (e: any) => {
    setRoleName(e.key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="Security">Bảo vệ</Menu.Item>
      <Menu.Item key="Staff">Nhân viên</Menu.Item>
      <Menu.Item key="DepartmentManager">Quản lý phòng ban</Menu.Item>
      <Menu.Item key="Manager">Quản lý</Menu.Item>
      <Menu.Item key="Admin">Quản trị viên</Menu.Item>
    </Menu>
  );

  return (
    <div className="chatContainer flex h-full">
      <div className="chatList w-1/3 border-r overflow-y-auto">
        <div className="search flex items-center space-x-4 p-4">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search"
            style={{ marginBottom: 16 }}
          />
          <Dropdown overlay={menu}>
            <Button>
              {roleName} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={filteredData}
          renderItem={(security: User) => (
            <List.Item
              key={security.userId}
              onClick={() => handleSelect(security)}
            >
              <List.Item.Meta
                avatar={<Avatar src={security.image || "./avatar.png"} />}
                title={security.fullName}
              />
            </List.Item>
          )}
        />
      </div>
      <div className="chatDetail w-2/3 overflow-y-auto">
        {selectedChat ? (
          <ChatDetail
            chatId={selectedChat.chatId}
            sender={selectedChat.sender}
            receiver={selectedChat.receiver}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;