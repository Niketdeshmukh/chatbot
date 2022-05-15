import React, { useState, useCallback } from "react";
import chatbotImg from "../images/chatbot.png";
import userimage from "../images/dp.png";
import axios from "axios";
import { format } from "date-fns";
import { useDropzone } from "react-dropzone";
import happy from "../images/happy.png";
import sad from "../images/sad.png";

function Chatbot() {
  const [chatbot, setChatbot] = useState(false);
  const [botMessages, setBotMessages] = useState([]);
  const [location, setLocation] = useState();
  const [personMessages, setPersonMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [data, setData] = useState([]);
  const [showFileModal, setFileModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState();
  const [response, setResponse] = useState([]);
  
  const feedback = (response, index) => {
    setResponse((oldArray) => [...oldArray, { response, index }]);
  };
  var messages = [];
  Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }

    return a;
  };
  messages = botMessages.concat(personMessages).unique();
  console.log(messages);
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      setFiles((oldArray) => [...oldArray, file]);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const setShowFileModal = (param) => {
    setFileModal(param);
    setFiles([]);
    setUploadProgress();
  };
  const removeFile = (filePath) => {
    setFiles(files.filter((item) => item.path !== filePath));
  };
  const FileUploader = async (file, index, size) => {
    var response;
    console.log(index, size);
    if (file) {
      const formData = new FormData();
      formData.append("file", file, file.name);
      response = await axios.post(
        `http://localhost:8000/api/v1/upload/singleFile`,
        formData,
        {
          onUploadProgress: (ProgressEvent) => {
            setUploadProgress(
              Math.round(
                (ProgressEvent.loaded / ProgressEvent.total) *
                  100 *
                  (index / size)
              )
            );
          },
        }
      );
    }
    return response;
  };

  const uploadFiles = async () => {
    for (var i = 0; i < files.length; i++) {
      const response = await FileUploader(files[i], i + 1, files.length);
      if (response.data) {
        setData((oldArray) => [...oldArray, response.data]);
      }
    }
  };

  const toggleChatbot = () => {
    setChatbot(!chatbot);
  };
  const chatBody = document.getElementById("chatBody");
  const scrollToBottom = () => {
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const message = document.getElementById("message").value;
    if (message && message.trim().length > 0) {
      setPersonMessages([
        ...messages,
        { author: "person", message: message, time: Date.now() },
      ]);
      scrollToBottom();
      document.getElementById("message").value = "";

      const result = await axios.get(
        "https://api.github.com/users/hacktivist123/repos"
      );
      const botMsg = result.data.filter(
        (data) => data.id == message || data.node_id == message
      );
      setBotMessages([
        ...messages,
        {
          author: "bot",
          message: botMsg.length ? botMsg[0].full_name : "No match found",
          time: Date.now(),
        },
      ]);
      setLocation(botMsg.length ? botMsg[0].name : "");
    }
    scrollToBottom();
  };
  return (
    <>
      <a className="chat-button" onClick={toggleChatbot}>
        <div className="msg">{chatbot ? "Close" : "Open"} Chatbot</div>
      </a>
      <div
        className="chatbot"
        style={chatbot ? { display: "block" } : { display: "none" }}
      >
        <div
          className="file-upload-modal"
          id="file-modal-body"
          hidden={showFileModal ? "" : "hidden"}
        >
          <div className="file-modal-box">
            <div className="modal-box-header">
              Upload File
              <div
                className="modal-close"
                onClick={() => {
                  setShowFileModal(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </div>
            </div>
            <div className="modal-body">
              {uploadProgress === 100 ? (
                <h3>
                  The {files.length > 1 ? "files" : "file"} has been uploaded
                </h3>
              ) : (
                <>
                  <div className="upload-here" {...getRootProps()}>
                    {!files.length ? (
                      <>
                        <h1>Drag the file here</h1>
                        <div className="or-center">OR</div>
                        <div className="file-input">
                          click to select file
                          <input
                            {...getInputProps()}
                            type="file"
                            accept=".pdf"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="or-center">
                          {files.length} file selected
                        </div>
                        <ul className="fileList">
                          {files.map((file) => {
                            return (
                              <li key={file.path}>
                                {file.path} - {file.size / 1000}kb
                                <span onClick={() => removeFile(file.path)}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    width="24px"
                                    fill="#777"
                                  >
                                    <path d="M0 0h24v24H0V0z" fill="none" />
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                  </svg>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                  <div
                    className="uploadProgress"
                    hidden={
                      uploadProgress === "" || !uploadProgress ? "hidden" : ""
                    }
                  >
                    <div
                      className="uploadStatus"
                      style={{ width: uploadProgress + "%" }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                  <button
                    disabled={files.length ? false : true}
                    className="upload-button"
                    onClick={(e) => {
                      uploadFiles(e);
                    }}
                  >
                    Upload file
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <header></header>
        <div className="flex">
          <div className="chatbox">
            <div className="chat-header">Book Chatbot</div>
            <div className="chat-body" id="chatBody">
              <div className="message-body">
                <img src={chatbotImg} height="35px" width="35px" />
                <div className="text">
                  <div className="info">
                    Bot {format(new Date(Date.now()), "kk:mm aaaaa'm'")}
                  </div>
                  <div className="message">
                    Hello there, how can I help you?
                  </div>
                </div>
              </div>

              {messages
                .sort((a, b) => (a.time > b.time ? 1 : -1))
                .map((message, index) => (
                  <span key={index}>
                    {message.author === "person" ? (
                      <div
                        style={{
                          float: "right",
                          marginRight: "10px",
                          display: "block",
                          width: "100%",
                        }}
                      >
                        <div className="user-message" key={index}>
                          <div className="msg-container">
                            <div
                              style={{
                                display: "flex",
                                width: "max-content",
                                float: "right",
                              }}
                            >
                              <div className="text">
                                <div
                                  className="info"
                                  style={{ textAlign: "right" }}
                                >
                                  User{" "}
                                  {format(
                                    new Date(message.time),
                                    "kk:mm aaaaa'm'"
                                  )}
                                </div>
                                <div className="message">{message.message}</div>
                              </div>
                              <img
                                style={{ marginLeft: "10px" }}
                                src={userimage}
                                height="35px"
                                width="35px"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: "100%" }}>
                        <div className="message-body" style={{ width: "100%" }}>
                          <img src={chatbotImg} height="35px" width="35px" />
                          <div className="text">
                            <div className="info">
                              Bot{" "}
                              {format(new Date(message.time), "kk:mm aaaaa'm'")}
                            </div>
                            <div className="message">{message.message}</div>
                          </div>
                        </div>
                        {response.some((e) => e.index === index) ? (
                          <div className="feedback">
                            Your feedback has been recorded.
                          </div>
                        ) : (
                          <div className="feedback">
                            Are you happy with the response?
                            <div className="feedback-body">
                              <div
                                className="fc"
                                onClick={() => feedback(1, index)}
                              >
                                <img src={happy} class="emoji" />
                                <div>Yes</div>
                              </div>
                              <div
                                className="fc"
                                onClick={() => feedback(0, index)}
                              >
                                <img src={sad} class="emoji" />
                                <div>No</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </span>
                ))}
              <div
                style={{ float: "right", width: "100%", marginTop: "100px" }}
                id="bottom"
              ></div>
            </div>

            <div className="chat-footer">
              <form onSubmit={handleSend} method="post">
                <button
                  className="fileLabel"
                  type="button"
                  onClick={() => setShowFileModal(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    enableBackground="new 0 0 24 24"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    fill="#1967d2"
                  >
                    <g>
                      <rect fill="none" height="24" width="24" />
                    </g>
                    <g>
                      <g>
                        <path d="M14,2H6C4.9,2,4.01,2.9,4.01,4L4,20c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8L14,2z M18,20H6V4h7v5h5V20z M8,15.01 l1.41,1.41L11,14.84V19h2v-4.16l1.59,1.59L16,15.01L12.01,11L8,15.01z" />
                      </g>
                    </g>
                  </svg>
                </button>
                <input
                  autoComplete="off"
                  id="message"
                  type="text"
                  className="input-message"
                  placeholder="Ask something here..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
          <div className="result">
            <div className="info" style={{ fontSize: "14px" }}>
              You can ask any question related to the book to the chatbot and it
              will give you the suitable answers
            </div>
            <h1>Answer found in the paragraph</h1>
            <h1>{location}</h1>
          </div>
        </div>
      </div>
    </>
  );
}
export default Chatbot;
