import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { chatDB } from "../../../api/firebase";
import upload from "../../../api/upload";
import { useLocation, useParams, useNavigate } from "react-router";
import { Button, Input, Upload, Avatar } from "antd";
import {
  UploadOutlined,
  SendOutlined,
  SmileOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const ChatDetail = () => {
  const [chat, setChat] = useState<any>();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [newImages, setNewImages] = useState<any[]>([]);
  const { sender, receiver } = useLocation().state;
  const chatId = useParams().id;
  const endRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const uploadRef = useRef<any>(null);

  useEffect(() => {
    const unSub = onSnapshot(doc(chatDB, "chats", chatId || ""), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleEmoji = (e: any) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = async (e: any) => {
    const files = e.fileList;
    console.log(files);
    const newImagesArray: any = [];

    for (let file of files) {
      const url = URL.createObjectURL(file.originFileObj);
      newImagesArray.push({ file: file.originFileObj, url });

      try {
        const imgUrl = await upload(file.originFileObj);
        newImagesArray[newImagesArray.length - 1].url = imgUrl;
      } catch (err) {
        console.log(err);
      }
    }

    setNewImages(newImagesArray);

    // Clear the file input field
    if (uploadRef.current) {
      uploadRef.current.fileList = [];
    }
  };

  const handleDeleteImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!text.trim() && newImages.length === 0) return;

    const imgUrls = newImages.map((img) => img.url);

    try {
      const message = {
        senderId: sender.userId,
        text,
        createdAt: new Date(),
        ...(imgUrls.length > 0 && { images: imgUrls }),
      };

      await updateDoc(doc(chatDB, "chats", chatId || ""), {
        messages: arrayUnion(message),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setNewImages([]);
      setText("");
    }
  };

  return (
    <div className="chat flex flex-col h-full">
      <div className="top flex items-center justify-between p-4 border-b">
        <div className="user flex items-center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <Avatar src={receiver?.image || "./avatar.png"} />
          <div className="texts ml-4">
            <span className="text-lg font-semibold">{receiver?.fullName}</span>
          </div>
        </div>
        <div className="icons flex space-x-4">
          <PhoneOutlined />
          <VideoCameraOutlined />
          <InfoCircleOutlined />
        </div>
      </div>
      <div className="center flex-1 overflow-y-auto p-4 max-h-96">
        {chat?.messages?.map((message: any) => (
          <div
            className={`message flex ${
              message.senderId === sender?.userId
                ? "justify-end"
                : "justify-start"
            } mb-4`}
            key={message?.createdAt}
          >
            <div
              className={`texts max-w-xs p-2 rounded ${
                message.senderId === sender?.userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {message.images &&
                message.images.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt=""
                    className="mb-2 max-h-20 max-w-20"
                  />
                ))}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom flex items-center p-4 border-t">
        <div className="icons flex items-center space-x-4">
          <Upload
            ref={uploadRef}
            beforeUpload={() => false}
            onChange={handleImg}
            multiple
            showUploadList={false}
            onRemove={() => {
              setNewImages([]);
              return true;
            }}
          >
            <Button icon={<UploadOutlined />} />
          </Upload>
          <Button
            icon={<SmileOutlined />}
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && (
            <div className="picker absolute bottom-16">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <div className="flex-1 mx-4 relative">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="absolute top-0 left-0 w-full flex flex-wrap">
            {newImages.map((img, index) => (
              <div key={index} className="relative m-1">
                <img
                  src={img.url}
                  alt="Preview"
                  className="max-h-20 max-w-20"
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  className="absolute top-0 right-0"
                  onClick={() => handleDeleteImage(index)}
                />
              </div>
            ))}
          </div>
        </div>
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatDetail;