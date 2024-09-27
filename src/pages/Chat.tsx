import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { chatDB } from "../api/firebase";

// Define the Message type
interface Message {
  id: string;
  from: number;
  to: number;
  text: string;
  timestamp: Date;
  image? : string,
}

const Chat: React.FC = () => {
  const userId = Number(localStorage.getItem("userId")); // Ensure userId is a number
  const recipientId = 10; // Hardcoded recipient ID
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  // Fetch messages from Firestore
  useEffect(() => {
    const q = query(collection(chatDB, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesArray: Message[] = [];
      querySnapshot.forEach((doc) => {
        messagesArray.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });
      setMessages(messagesArray);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Send a new message
  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    await addDoc(collection(chatDB, "messages"), {
      from: userId, // Add the sender's userId
      to: recipientId, // Hardcoded recipient ID
      text: newMessage,
      timestamp: new Date(),
      image : "",
    });
    setNewMessage(""); // Clear the input
  };

  return (
    <div>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;