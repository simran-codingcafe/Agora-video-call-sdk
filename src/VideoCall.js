import { useState, useEffect } from "react";
import {
  config,
  useClient,
  useMicrophoneAndCameraTracks,
  channelName,
} from "./settings.js";
import { Grid } from "@material-ui/core";
import Video from "./Video";
import Controls from "./Controls";
import ChatBox from "./chatbox";

export default function VideoCall(props) {
  const { setInCall } = props;
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const [isPinned, setPinned] = useState(true)
  const [openChat, setOpenChat] = useState(false)
  const [username, setUsername] = useState(localStorage.getItem("username"))
  const [callHeading, setCallHeading] = useState(localStorage.getItem("callHeading"))
  const [leaveURL, setLeaveURL] = useState(localStorage.getItem("leaveURL"))
  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();

  useEffect(() => {
    let init = async (name) => {
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setUsers((prevUsers) => {
            return [...prevUsers, user];
          });
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio") {
          if (user.audioTrack) user.audioTrack.stop();
        }
        if (mediaType === "video") {
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        }
      });

      client.on("user-left", (user) => {
        if (user.audioTrack) user.audioTrack.stop();
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });

      try {
        await client.join(config.appId, name, config.token, config.uid);
      } catch (error) {
        console.log("error",  error);
      }

      if (tracks) await client.publish([tracks[0], tracks[1]]);
      setStart(true);
    };

    if (ready && tracks) {
      try {
        init(channelName);
      } catch (error) {
        console.log(error);
      }
    }
  }, [channelName, client, ready, tracks]);

  const cancelChat = () => {
    setOpenChat(false)
  }

  const endCall =async () => {
    await client.leave();
    client.removeAllListeners();
    tracks[0].close();
    tracks[1].close();
    setStart(false);
    setInCall(false);
    window.location.href = leaveURL
  }

  return (
    <div className="container">
      <Grid container direction="column">
        <Grid item style={{ height: "10%" }}>
          <div className='nav2'>
            <div className="headTab">
              <span
                className="btnBack"
                onClick={() => endCall()}
              >
                &#60;
              </span>
              <h4 className="heading">{callHeading}</h4>
            </div>
          </div>
        </Grid>
        <Grid item style={{ height: "80%" }}>
          {start && tracks && <Video tracks={tracks} users={users} isPinned={isPinned} />}
        </Grid>
        <Grid item style={{ height: "10%" }}>
          {ready && tracks && (
            <Controls tracks={tracks} setStart={setStart} openChat={openChat} setOpenChat={setOpenChat} setInCall={setInCall} isPinned={isPinned} setPinned={setPinned} />
          )}
        </Grid>
      </Grid>
      {openChat ?
        <>
          <div className='d-md-flex chatstyle'>
            <ChatBox username={username} cancelChat={cancelChat} isPinned={isPinned} />
          </div>
        </>
        : ""}
    </div>
  );

}


