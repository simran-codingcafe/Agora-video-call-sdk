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
import axios from "axios"
import MicNoneOutlinedIcon from "@material-ui/icons/MicNoneOutlined";
import MicOffOutlinedIcon from "@material-ui/icons/MicOffOutlined";
import VideocamIconOutlined from "@material-ui/icons/VideocamOutlined";
import VideocamOffIconOutlined from "@material-ui/icons/VideocamOffOutlined";
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaicOutlined';
import io from "socket.io-client"


export default function VideoCall(props) {
  const { setInCall } = props;
  const [users, setUsers] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState("");
  const [error, setError] = useState(false);
  const [start, setStart] = useState(false);
  const [isPinned, setPinned] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const [unread, setUnread] = useState(false)
  const [username, setUsername] = useState(localStorage.getItem("username"))
  const [callHeading, setCallHeading] = useState(localStorage.getItem("callHeading"))
  const [leaveURL, setLeaveURL] = useState(localStorage.getItem("leaveURL"))
  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [trackState, setTrackState] = useState({ video: true, audio: true });

  // useEffect(() => {
  //   const url = new URL(window.location.href);
  //   const params = new URLSearchParams(url.search);
  //   const calltype = params.get('join-with');

  //   setTimeout(() => {
  //     if (calltype === "audio") {
  //       setTimeout(() => {
  //         tracks[1].setEnabled(!trackState.video);
  //         setTrackState((ps) => {
  //           return { ...ps, video: !ps.video };
  //         });
  //       }, 1000);
  //     }
  //   }, 1000);
  // }, [])

  const mute = async (type) => {
    if (type === "audio") {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
    } else if (type === "video") {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
    }
  };

  const leaveChannel = async () => {
    await client.leave();
    client.removeAllListeners();
    tracks[0].close();
    tracks[1].close();
    setStart(false);
    setInCall(false);
    axios
      .get(
        `https://lingwa.app/wp-json/api/leave-call?thread_id=${localStorage.getItem("thread_id")}&user_id=${localStorage.getItem("user_id")}`,
        {
          headers: {
            "content-type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          window.location.href = localStorage.getItem("leaveURL")
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => { 
    const socket = io("http://phpstack-932189-3368876.cloudwaysapps.com/")
    socket.on(`${localStorage.getItem("thread_id")}`,(type, data) => {
     if (type === "message") {
         setUnread(true)
       } 
    })
    return () => socket.disconnect()
}, [])

  useEffect(() => {
    window.onresize = function () {
      setScreenSize(window.innerWidth);
    };
  }, [])

  useEffect(() => {
    function handleVolumeIndicator(volumes) {
      volumes.forEach((volume) => {
        if (config.uid !== volume.uid && volume.level > 2) {
          const activeSpeakerId = volume.uid
          setActiveSpeaker(activeSpeakerId)
        } else {
          setActiveSpeaker("")
        }
      });
    }

    client.enableAudioVolumeIndicator();
    client.on('volume-indicator', handleVolumeIndicator);

    return () => {
      client.off('volume-indicator', handleVolumeIndicator);
    };
  }, [client, config.uid]);

  useEffect(() => {
    let init = async (name) => {
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setUsers((prevUsers) => {
            const index = prevUsers.findIndex((item) => item.uid === user.uid);
            if (index !== -1) {
              const updatedUsers = [...prevUsers];
              updatedUsers[index] = user;
              return updatedUsers;
            } else {
              return [...prevUsers, user];
            }
          });
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
          setUsers((prevUsers) => {
            const index = prevUsers.findIndex((item) => item.uid === user.uid);
            if (index !== -1) {
              const updatedUsers = [...prevUsers];
              updatedUsers[index] = user;
              return updatedUsers;
            } else {
              return [...prevUsers, user];
            }
          });
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio") {
          if (user.audioTrack) user.audioTrack.stop();
        }
        if (mediaType === "video") {
          // setUsers((prevUsers) => {
          //   return prevUsers.filter((User) => User.uid !== user.uid);
          // });
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
        if (tracks) await client.publish([tracks[0], tracks[1]]);
        setStart(true);
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const calltype = params.get('join-with');
        setTimeout(() => {
          if (calltype === "audio") {
            tracks[1].setEnabled(!trackState.video);
            setTrackState((ps) => {
              return { ...ps, video: !ps.video };
            });
          }
        }, 1000);
        setError(false)
      } catch (error) {
        console.log("error", error);
        setError(true)
        // init(channelName);
      }
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

  const endCall = async () => {
    await client.leave();
    client.removeAllListeners();
    tracks[0].close();
    tracks[1].close();
    setStart(false);
    setInCall(false);
    axios
      .get(
        `https://lingwa.app/wp-json/api/leave-call?thread_id=${localStorage.getItem("thread_id")}&user_id=${localStorage.getItem("user_id")}`,
        {
          headers: {
            "content-type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          window.location.href = leaveURL
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className="vc-container">
      <Grid container direction="column">
        <Grid item style={{ height: `${screenSize < 700 ? "0%" : "9%"}` }}>
          <div className='nav2'>
            <div className="headTab">
              <span
                className="btnBack"
                onClick={() => endCall()}
              >
                &#60;
              </span>
              <h4 className="vc-heading">{callHeading}</h4>
            </div>
          </div>
        </Grid>
        {error ?
          <span style={{ marginTop: '50px', textAlign: 'center' }}>
            You are not connected please refresh.
          </span>
          :
          <>
            <Grid item style={{ height: `${screenSize < 700 ? "90%" : "81%"}` }}>
              {start && tracks && <Video tracks={tracks} users={users} isPinned={isPinned} activeSpeaker={activeSpeaker} openChat={openChat} />}
            </Grid>
            <Grid item style={{ height: "10%" }}>
              {ready && tracks && (
                // <Controls tracks={tracks} setStart={setStart} openChat={openChat} setOpenChat={setOpenChat} setInCall={setInCall} isPinned={isPinned} setPinned={setPinned} />
                <Grid container spacing={2} alignItems="center" className="vc-btnContainer">
                  <button className="vc-localbtns" onClick={() => mute("video")}>
                    {trackState.video ? <VideocamIconOutlined /> : <VideocamOffIconOutlined />}
                  </button>
                  <button className="vc-localbtns" onClick={() => mute("audio")}>
                    {trackState.audio ? <MicNoneOutlinedIcon /> : <MicOffOutlinedIcon />}
                  </button>
                  <button className="vc-localbtns" style={{ color: "red", transform: "scaleX(-1)" }} onClick={() => leaveChannel()}>
                    <PhoneDisabledIcon />
                  </button>
                  <button className="vc-localbtns" style={{ color: openChat ? "blue" : "" }} onClick={() => setOpenChat(!openChat)}>
                  {unread ? <span className="unread-chat"></span> : ""}
                    <ChatIcon />
                  </button>
                  <button className="vc-localbtns" onClick={() => setPinned(!isPinned)}>
                    <AutoAwesomeMosaicIcon />
                  </button>
                </Grid>
              )}
            </Grid>
          </>
        }
      </Grid>
      {openChat ?
        <>
          <div className='d-md-flex chatstyle'>
            <ChatBox username={username} cancelChat={cancelChat} setUnread={setUnread} isPinned={isPinned} />
          </div>
        </>
        : ""}
    </div>
  );

}


