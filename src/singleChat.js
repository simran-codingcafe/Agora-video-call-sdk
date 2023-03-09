import React from "react";

export default function Chat(props) {
    return (
        <>
            {props.message?.name !== null ?
                <li className={props.message?.sender_is_you ? "rightchat" : 'leftchat'}>
                    {props.message?.sender_is_you ? "" :
                        <img src={props.message?.image} alt="" width="28" style={{ borderRadius: '50%' }} />
                    }
                    <div>
                        {props.message?.sender_is_you ? <span>You</span> :
                            <span>{props.message?.name}</span>
                        }
                        <div className={props.message?.sender_is_you ? "chat-right2 chatmsg" : "chat-left2 chatmsg"}>
                            <div className="chat-text2">{props.message?.message}</div>
                        </div>
                    </div>
                </li>
                : ""
            }
        </>
    );
}
