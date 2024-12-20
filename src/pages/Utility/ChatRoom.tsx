import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Input, Button, List, Typography, Avatar } from "antd";
import { chatDB } from "../../api/firebase";

// Define the Message type
interface Message {
  id: string;
  idRoom: string;
  from: number;
  text: string;
  timestamp: any; // Firestore timestamp type
  image?: string;
}

// Function to convert Firestore Timestamp to a human-readable format
function convertFirestoreTimestamp(timestamp: any) {
  const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
  return date.toLocaleString(); // Convert to a human-readable format
}

const ChatRoom: React.FC = () => {
  const userId = Number(localStorage.getItem("userId")); // Ensure userId is a number
  const roomId = "room1"; // Hardcoded room ID
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  
  // Fetch messages from Firestore for the specific room
  useEffect(() => {
    const q = query(
      collection(chatDB, "messages"),
      where("idRoom", "==", roomId),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const messagesArray: Message[] = [];
        querySnapshot.forEach((doc) => {
          messagesArray.push({
            id: doc.id,
            ...doc.data(),
          } as Message);
        });
        setMessages(messagesArray);
      },
      (error) => {
        // console.error("Error fetching messages:", error); // Log any errors
      }
    );
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [roomId]);

  // Send a new message
  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    await addDoc(collection(chatDB, "messages"), {
      idRoom: roomId,
      from: userId,
      text: newMessage,
      timestamp: new Date(), // Store the current date and time as timestamp
      image: "",
    });
    setNewMessage(""); // Clear the input
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      {/* Messages List */}
      <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-md p-4 mb-4">
        <List
          dataSource={messages}
          renderItem={(message) => {
            const isCurrentUser = message.from === userId; // Check if the message is from the current user
            return (
              <List.Item
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
              >
                {!isCurrentUser && (
                  <Avatar
                    className="mr-2"
                    src={`https://api.adorable.io/avatars/40/${message.from}.png`}
                  />
                )}
                <div
                  className={`p-2 rounded-lg shadow-md max-w-xs ${
                    isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  <Typography.Text className="block font-semibold">
                    {message.from}
                  </Typography.Text>
                  <Typography.Text>{message.text}</Typography.Text>
                  <Typography.Text
                    type="secondary"
                    className="block text-xs mt-1"
                  >
                    {convertFirestoreTimestamp(message.timestamp)}
                  </Typography.Text>
                </div>
                {isCurrentUser && (
                  <Avatar
                    className="ml-2"
                    src={`https://api.adorable.io/avatars/40/${message.from}.png`}
                  />
                )}
              </List.Item>
            );
          }}
        />
      </div>
      {/* Message Input */}
      <form onSubmit={sendMessage} className="flex">
        <Input
          className="rounded-l-lg w-full"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <Button type="primary" htmlType="submit" className="rounded-r-lg">
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatRoom;
