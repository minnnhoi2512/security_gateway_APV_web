import { useEffect } from "react";
import { generateToken, message } from "../api/firebase";
import { onMessage } from "firebase/messaging";
import { toast } from "react-toastify";

const NotificationTest: React.FC = () => {
  useEffect(() => {
    generateToken();
    onMessage(message, (payload) => {
      console.log(payload);
      toast(payload.notification?.body);
    });
  }, []);

  return <div>Notifications setup complete!</div>;
};

export default NotificationTest;
