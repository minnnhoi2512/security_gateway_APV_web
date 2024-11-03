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
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={locale}>
        <React.StrictMode>
          <Provider store={store}>
            <ContentRouter />
            <ToastContainer />
          </Provider>
        </React.StrictMode>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
