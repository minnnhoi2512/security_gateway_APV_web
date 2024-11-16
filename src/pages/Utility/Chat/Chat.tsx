import { useGetDetailUserQuery } from "../../../services/user.service";
import "./chatList.css";
import ChatList from "./chatList/ChatList";
import Userinfo from "./userInfo/UserInfo";

const Chat = () => {
  const userId = localStorage.getItem("userId");
  const { data: user } = useGetDetailUserQuery(Number(userId || 0));
  console.log(user);
  return (
    <div className="list">
      <Userinfo user={user} />
      <ChatList user={user} />
    </div>
  );
};

export default Chat;
