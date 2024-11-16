import "./userInfo.css";

const Userinfo = ({ user }: any) => {
  return (
    <div className="userInfo">
      <div className="user">
        <img src={user?.image || "./avatar.png"} alt="" />
        <h2>{user?.fullName}</h2>
      </div>
      {/* <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div> */}
    </div>
  );
};

export default Userinfo;