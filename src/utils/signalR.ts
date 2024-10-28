import * as signalR from '@microsoft/signalr';
import { Dispatch } from 'redux';
// import { setNewNotificationReceived } from '../redux/slice/notificationSlice';
import UserConnectionHubType from '../types/userConnectionHubType';
import { clearConnection, setConnection } from '../redux/slices/hubConnection.slice';

const SetSignalR = async (
  user : UserConnectionHubType,
  connection: React.MutableRefObject<signalR.HubConnection | null>
  , dispatch: Dispatch
) => {

  if (user) {
    connection.current = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7018/notificationHub", {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    const startConnection = async () => {
      try {
        await connection.current?.start();
        console.log("Connected to NotificationHub " + connection.current?.connectionId);
        dispatch(setConnection(connection));
        connection.current?.on("ReceiveMessage", (title, message) => {
          console.log("Nhận thông báo:", title, message);
        //   PushNotification.localNotification({
        //     channelId: "general_notifications",
        //     title: title,
        //     message: message,
        //   });
        //   dispatch(setNewNotificationReceived(true)); // Đánh dấu có thông báo mới được nhận
        });
        await connection.current?.invoke("JoinHub", user);

        // connection.current?.on("ReceivedPersonalNotification", (title, message) => {
        //   console.log("Nhận thông báo cá nhân:", title, message);
        //   PushNotification.localNotification({
        //     channelId: "general_notifications",
        //     title: title,
        //     message: message,
        //   });
        //   dispatch(setNewNotificationReceived(true)); // Đánh dấu có thông báo mới được nhận
        // });
      } catch (error) {
        console.error("SignalR Connection Error: ", error);
      }
    };

    startConnection();
    return () => {
      connection.current?.stop().then(() => console.log("Disconnected from NotificationHub"));
    };
  }
};
const DisconnectSignalR = (
  connection: React.MutableRefObject<signalR.HubConnection | null>
  , dispatch: Dispatch
) =>{
  try {
    connection.current?.stop().then(() => console.log("Disconnected from NotificationHub"));
    dispatch(clearConnection())
  } catch (error) {
    console.error("SignalR Disconnection Error: ", error);
  }
}

export default {SetSignalR,DisconnectSignalR};
