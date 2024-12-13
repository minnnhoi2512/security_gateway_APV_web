import React from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import ContentRouter from "./router/router";
import { store } from "./redux/store";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigProvider } from "antd";
import locale from "antd/lib/locale/vi_VN"; // Use appropriate Ant Design locale

const queryClient = new QueryClient();

const App = () => {
  return (
    // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={locale}>
          <Provider store={store}>
            <ContentRouter />
            <ToastContainer />
          </Provider>
      </ConfigProvider>
    </QueryClientProvider>
    // </React.StrictMode>
  );
};

export default App;
