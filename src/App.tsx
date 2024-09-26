import { Provider } from "react-redux";
import { ToastContainer } from 'react-toastify';
import ContentRouter from "./router/router";
import { store } from "./redux/store";
import 'react-toastify/dist/ReactToastify.css'; 

const App = () => {
  return (
    <Provider store={store}>
      <ContentRouter />
      <ToastContainer />
    </Provider>
  );
};

export default App;
