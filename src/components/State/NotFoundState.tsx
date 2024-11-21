import React from "react";
import { Result } from "antd";

const NotFoundState: React.FC = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Xin lỗi, trang của bạn truy cập không có hoặc bạn không có quyền truy cập."
    />
  );
};

export default NotFoundState;
