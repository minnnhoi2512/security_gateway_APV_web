import { useState } from "react";
import { Input, Button, List, Avatar } from "antd";
import { PlusOutlined, MinusOutlined, SearchOutlined } from "@ant-design/icons";
import "./chatList.css";
import {
  doc,
  setDoc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { chatDB } from "../../../../api/firebase";

import { useGetListUserByRoleQuery } from "../../../../services/user.service";
import User from "../../../../types/userType";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";

const ChatList = ({ user }: any) => {
  const { data: securityData } = useGetListUserByRoleQuery({
    pageNumber: 1,
    pageSize: 100,
    role: "Staff",
  });
  const [addMode, setAddMode] = useState(false);
  const currentUser = user;
  const navigate = useNavigate();

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
      navigate(`/chat-detail/${chatId}`, {
        state: { sender: user, receiver: security },
      });
    } else {
      chatId = uuidv4();
      const chatDocRef = doc(chatDB, "chats", chatId);
      await setDoc(chatDocRef, {
        participants: [currentUser.userId, security.userId],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      navigate(`/chat-detail/${chatId}`, {
        state: { sender: user, receiver: security },
      });
    }
  };

  return (
    <div className="chatList">
      <div className="search">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search"
          // onChange={(e) => setInput(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Button
          type="primary"
          icon={addMode ? <MinusOutlined /> : <PlusOutlined />}
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      <List
        itemLayout="horizontal"
        dataSource={securityData}
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
  );
};

export default ChatList;
