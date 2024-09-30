import React from "react";

const Chat: React.FC = () => {
  const userId = Number(localStorage.getItem("userId")); 
  const userRole = localStorage.getItem("userRole");
  console.log(userRole)


  return <div className="flex flex-col h-screen bg-gray-100 p-4"></div>;
};

export default Chat;
