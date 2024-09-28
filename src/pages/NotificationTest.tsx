import { useEffect, useState } from "react";
import { generateToken, message} from "../api/firebase";
import { toast } from "react-toastify"; // Import toast
import { onMessage } from "firebase/messaging";

const NotificationTest: React.FC = () => {
  const [notification, setNotification] = useState({ title: "", body: "" });

  useEffect(() => {
    // Generate token for the device
    generateToken();
    // setNotification("")
    // Set up the notification listener
    const unsubscribe = onMessage(message, (payload) => {
      console.log(payload)
      toast(payload.notification?.body);
    });
    console.log(unsubscribe)
    // Cleanup function to handle unsubscription
    return () => {
      
    };
  }, []);

  return (
    <div>
      <h1>Notifications setup complete!</h1>
      {notification.title && <h2>{notification.title}</h2>}
      {notification.body && <p>{notification.body}</p>}
    </div>
  );
};

export default NotificationTest;