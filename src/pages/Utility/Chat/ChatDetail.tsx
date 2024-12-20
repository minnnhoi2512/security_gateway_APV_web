import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { chatDB } from "../../../api/firebase";
import upload from "../../../api/upload";
import { Button, Input, Upload, Avatar, Image } from "antd";
import {
  UploadOutlined,
  SendOutlined,
  SmileOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { format } from 'timeago.js';
import "./chatDetail.css"; // Import custom CSS

const ChatDetail = ({ chatId, sender, receiver }: { chatId: string, sender: any, receiver: any }) => {
  const [chat, setChat] = useState<any>();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [newImages, setNewImages] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
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
    const file = e.file;
    // console.log(file);
    try {
      const imgUrl = await upload(file);
      const newImageInput = { url: imgUrl, file: file };
      setNewImages((prevImages) => [...prevImages, newImageInput]);
    } catch (err) {
      // console.log(err);
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
      // console.log(err);
    } finally {
      setNewImages([]);
      setText("");
    }
  };

  return (
    <div className="chat flex flex-col h-full">
      <div className="top flex items-center justify-between p-4 border-b">
        <div className="user flex items-center">
          <Avatar src={receiver?.image || "./avatar.png"} className="ml-4" />
          <div className="texts ml-4">
            <span className="text-lg font-semibold">{receiver?.fullName}</span>
          </div>
        </div>
        <div className="icons flex space-x-4">
          <Button icon={<PhoneOutlined />} />
          <Button icon={<VideoCameraOutlined />} />
          <Button icon={<InfoCircleOutlined />} />
        </div>
      </div>
      <div className="center flex-1 overflow-y-auto p-4 max-h-96 custom-scrollbar">
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
              <div className="mx-4">
                {message.images &&
                  message.images.map((img: string, index: number) => (
                    <Image
                      key={index}
                      src={img}
                      alt=""
                      className="mb-2 max-w-20 max-h-20 object-cover"
                    />
                  ))}
                <p>{message.text}</p>
                <span>{format(message.createdAt.toDate())}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom flex items-center p-4 border-t relative">
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
            <div className="absolute bottom-16 bg-white p-2 rounded shadow-lg z-50">
              <div className="flex justify-end">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setOpen(false)}
                />
              </div>
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <div className="flex-1 mx-4 relative">
          <div className="top-0 left-0 w-full flex flex-wrap">
            {newImages.map((img, index) => (
              <div key={index} className="relative m-1">
                <Image
                  src={img.url}
                  alt="Preview"
                  className="max-w-20 max-h-20 object-cover"
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
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
        ></Button>
      </div>
    </div>
  );
};

export default ChatDetail;