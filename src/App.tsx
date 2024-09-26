import { Provider } from "react-redux";
import ContentRouter from "./router/router";
import {store}  from "./redux/store";

const App = () => {
  
  return (
   <Provider store={store}>
    <ContentRouter/>
   </Provider>
  );
};

export default App;
