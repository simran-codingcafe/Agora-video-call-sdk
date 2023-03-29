import React, { useState, useEffect } from "react";
import ScrollToBottom, {
    useScrollToBottom,
    useSticky,
} from "react-scroll-to-bottom";
import SingleChat from "./singleChat";
import axios from "axios"
import io from "socket.io-client"


const ChatBox = (props) => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(props.username);
    const [openLoader, setOpenLoader] = useState(false);
    const [typeMessage, setTypeMessage] = useState("");
    const scrollToBottom = useScrollToBottom();
    const [sticky] = useSticky();

    const fetchChat = (token) => {
        axios
            .get(
                `https://lingwa.app/wp-json/api/get-messages?thread_id=${localStorage.getItem("thread_id")}&user_id=${localStorage.getItem("user_id")}`,
                {
                    headers: {
                        "content-type": "application/json",
                    },
                    cancelToken: token
                }
            )
            .then((res) => {
                if (res.data.success) {
                    setMessages(res.data.data);
                    props.setUnread(false)
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (e.target.message.value !== "") {
            let myData = {
                sender_is_you: true,
                message: e.target.message.value,
            };
            // saveChat(myData);
            setMessages((prevData) => [...prevData, myData]);
            setTypeMessage("");
            const formData = new FormData();
            formData.append("user_id", localStorage.getItem("user_id"));
            formData.append("thread_id", localStorage.getItem("thread_id"));
            formData.append("message", e.target.message.value);
            axios
                .post(
                    `https://lingwa.app/wp-json/api/send-message`,
                    formData,
                    {
                        headers: {
                            "content-type": "multipart/form-data",
                        },
                    }
                )
                .then((res) => {
                    if (res.data.success) {
                        // setMessages((prevData) => [...prevData, res.data.data]);
                    }
                    setTimeout(() => {
                        fetchChat()
                    }, 4000);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    useEffect(() => {
        const source = axios.CancelToken.source();
        fetchChat(source.token);

        return () => {
            source.cancel();
        }
    }, [])

    useEffect(() => {
        const source = axios.CancelToken.source();
        const socket = io("http://phpstack-932189-3368876.cloudwaysapps.com/")
        socket.on(`${localStorage.getItem("thread_id")}`, (type, data) => {
            if (type === "message") {
                props.setUnread(true)
                fetchChat(source.token);
            }
        })
        return () => socket.disconnect()
    }, [])

    return (
        <div className="chat-box2">
            <div className="chat-box-header2">
                <h4>{localStorage.getItem("type") !== "one_to_one" ? "Group Chat" : "Chat"}</h4>
                <button
                    className="showButton"
                    style={{
                        border: "1px solid gray",
                        borderRadius: "50%",
                        padding: "0px 8px",
                        fontSize: "x-large",
                        color: "black",
                        background: "transparent"
                    }}
                    onClick={() => props.cancelChat()}
                >
                    &#215;
                </button>
            </div>
            <div className="chat-box-area2">
                <ScrollToBottom className="msger_chat">
                    {openLoader ? (
                        <span
                            style={{
                                display: "block",
                                textAlign: "center",
                                width: "100%",
                                marginTop: "50px",
                                marginBottom: "50px",
                            }}
                        >
                            Loading...
                        </span>
                    ) : (
                        <ul>
                            {messages?.length > 0 &&
                                messages?.map((item) => (
                                    <SingleChat message={item} />
                                ))}
                        </ul>
                    )}
                    {!sticky && (
                        <button onClick={scrollToBottom}>
                            Click me to scroll to bottom
                        </button>
                    )}
                </ScrollToBottom>
            </div>
            <div className="chat-box-footer2">
                <form id="myform" onSubmit={(e) => sendMessage(e)}>
                    <div className="chat-box-footer2-btn">
                        <input
                            type="text"
                            name="message"
                            value={typeMessage}
                            onChange={(e) =>
                                setTypeMessage(e.target.value)
                            }
                            placeholder="Type a message..."
                            className="form-control"
                        />
                        <button
                            style={{
                                padding: "8px 11px",
                                fontSize: "13px",
                                background: "rgb(0, 163, 138)",
                                color: "#fff",
                                position: "absolute",
                                right: "6px",
                                borderRadius: "7px"
                            }}
                            className="btn btn-primary"
                            type="submit"
                        >
                            <i className="fa fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
