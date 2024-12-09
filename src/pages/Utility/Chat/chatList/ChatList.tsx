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

  // const menu = (
  //   <Menu onClick={handleMenuClick}>
  //     <Menu.Item key="Security">Bảo vệ</Menu.Item>
  //     <Menu.Item key="Staff">Nhân viên</Menu.Item>
  //     <Menu.Item key="DepartmentManager">Quản lý phòng ban</Menu.Item>
  //     <Menu.Item key="Manager">Quản lý</Menu.Item>
  //     <Menu.Item key="Admin">Quản trị viên</Menu.Item>
  //   </Menu>
  // );
  const menu = (
    <Menu 
      className="rounded-lg shadow-lg border border-gray-100"
      onClick={handleMenuClick}
    >
      <Menu.Item key="Security" className="hover:bg-blue-50">
        Bảo vệ
      </Menu.Item>
      <Menu.Item key="Staff" className="hover:bg-blue-50">
        Nhân viên
      </Menu.Item>
      <Menu.Item key="DepartmentManager" className="hover:bg-blue-50">
        Quản lý phòng ban
      </Menu.Item>
      <Menu.Item key="Manager" className="hover:bg-blue-50">
        Quản lý
      </Menu.Item>
      <Menu.Item key="Admin" className="hover:bg-blue-50">
        Quản trị viên
      </Menu.Item>
    </Menu>
  );

  return (
    // <div className="chatContainer flex h-full">
    //   <div className="chatList w-1/3 border-r overflow-y-auto">
    //     <div className="search flex items-center space-x-4 p-4">
    //       <Input
    //         prefix={<SearchOutlined />}
    //         placeholder="Search"
    //         style={{ marginBottom: 16 }}
    //       />
    //       <Dropdown overlay={menu}>
    //         <Button>
    //           {roleName} <DownOutlined />
    //         </Button>
    //       </Dropdown>
    //     </div>
    //     <List
    //       itemLayout="horizontal"
    //       dataSource={filteredData}
    //       renderItem={(security: User) => (
    //         <List.Item
    //           key={security.userId}
    //           onClick={() => handleSelect(security)}
    //         >
    //           <List.Item.Meta
    //             avatar={<Avatar src={security.image || "./avatar.png"} />}
    //             title={security.fullName}
    //           />
    //         </List.Item>
    //       )}
    //     />
    //   </div>
    //   <div className="chatDetail w-2/3 overflow-y-auto">
    //     {selectedChat ? (
    //       <ChatDetail
    //         chatId={selectedChat.chatId}
    //         sender={selectedChat.sender}
    //         receiver={selectedChat.receiver}
    //       />
    //     ) : (
    //       <div className="flex items-center justify-center h-full">
    //         <p>Select a chat to start messaging</p>
    //       </div>
    //     )}
    //   </div>
    // </div>
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="mb-3">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Tìm kiếm người dùng..."
              className="rounded-lg hover:border-blue-400 focus:border-blue-500"
            />
          </div>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-400">
              <span className="flex items-center gap-2">
                <span className="text-gray-700">{roleName}</span>
              </span>
              <DownOutlined className="text-gray-400" />
            </Button>
          </Dropdown>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <List
            className="divide-y divide-gray-100"
            itemLayout="horizontal"
            dataSource={filteredData}
            renderItem={(security: User) => (
              <List.Item
                key={security.userId}
                onClick={() => handleSelect(security)}
                className="hover:bg-blue-50 cursor-pointer transition-colors p-3"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Avatar 
                    src={security.image || "./avatar.png"}
                    size={40}
                    className="border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{security.fullName}</h3>
                    <p className="text-sm text-gray-500">
                      {security.department?.departmentName || 'No department'}
                    </p>
                  </div>
                  {/* <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400">12:30</span>
                
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 mt-1">
                      2
                    </span>
                  </div> */}
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="w-2/3 flex flex-col bg-gray-50">
        {selectedChat ? (
          <ChatDetail
            chatId={selectedChat.chatId}
            sender={selectedChat.sender}
            receiver={selectedChat.receiver}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
            <p className="text-sm mt-2">Chọn người dùng từ danh sách bên trái để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;