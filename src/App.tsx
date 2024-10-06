import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import ContentRouter from "./router/router";
import { store } from "./redux/store";
import "react-toastify/dist/ReactToastify.css";
import { ConfigProvider } from "antd";
import locale from "antd/lib/locale/vi_VN"; // Use appropriate Ant Design locale

const App = () => {
  return (
    <ConfigProvider locale={locale}>
      <Provider store={store}>
        <ContentRouter />
        <ToastContainer />
      </Provider>
    </ConfigProvider>
  );
};

export default App;
