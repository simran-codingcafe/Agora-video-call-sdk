import { useState, useEffect } from "react";
import {
  config,
  useRTCClient,
  useMicrophoneAndCameraTracks,
  channelName,
} from "./settings.js";
import {
  useRtmClient,
  useRtmChannel,
} from "./rtmsettings.js";
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
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import io from "socket.io-client"

export default function VideoCall(props) {
  const { setInCall } = props;
  const [users, setUsers] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState("");
  const [activeSpeaker2, setActiveSpeaker2] = useState("");
  const [error, setError] = useState(false);
  const [start, setStart] = useState(false);
  const [isPinned, setPinned] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const [unread, setUnread] = useState(false)
  const [username, setUsername] = useState(localStorage.getItem("username"))
  const [callHeading, setCallHeading] = useState(localStorage.getItem("callHeading"))
  const client = useRTCClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const [allUsers, setAllUsers] = useState([]);
  const rtmClient = useRtmClient();
  const rtmChannel = useRtmChannel(rtmClient)


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
    await rtmChannel.leave()
    await rtmClient.logout()
    rtmChannel.removeAllListeners()
    rtmClient.removeAllListeners()
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
    const socket = io("https://phpstack-932189-3368876.cloudwaysapps.com/")
    socket.on(`${localStorage.getItem("thread_id")}`, (type, data) => {
      if (type === "message") {
        setUnread(true)
      }
    })
    return () => socket.disconnect()
  }, [])

  const getUsersDetails = () => {
    axios
      .get(
        `https://lingwa.app/wp-json/api/all-live-users?thread_id=${localStorage.getItem("thread_id")}`,
        {
          headers: {
            "content-type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          setAllUsers(res.data.data.users)
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    window.onresize = function () {
      setScreenSize(window.innerWidth);
    };
  }, [])

  useEffect(() => {
    getUsersDetails()
  }, [users])

  useEffect(() => {
    function handleVolumeIndicator(volumes) {
      volumes.forEach((volume) => {
        if (config.uid !== volume.uid && volume.level > 25) {
          const activeSpeakerId = volume.uid
            setActiveSpeaker(activeSpeakerId)
            setActiveSpeaker2(activeSpeakerId)
        } else {
          setActiveSpeaker2("")
        }
      });
    }

    client.enableAudioVolumeIndicator();
    client.on('volume-indicator', handleVolumeIndicator);

    return () => {
      client.off('volume-indicator', handleVolumeIndicator);
    };
  }, [client]);

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
        } else if (mediaType === "audio") {
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

      client.on("user-left", (user) => {
        if (user.audioTrack) user.audioTrack.stop();
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });

      try {
        if (config.appId) {
          await client.join(config.appId, name, config.token, config.uid);
          setStart(true);
          const url = new URL(window.location.href);
          const params = new URLSearchParams(url.search);
          const calltype = params.get('join-with');
          if (tracks) {
            if (calltype === "audio") {
              tracks[1].setEnabled(false);
              setTrackState((ps) => {
                return { ...ps, video: !ps.video };
              });
            }
            await client.publish([tracks[0], tracks[1]]);
          }
          setError(false)
        } else {
          // window.location.reload()
        }
      } catch (error) {
        window.location.reload()
        console.log("error", error);
        setError(true)
      }
    };

    let initRTM = async () => {
      const UID = localStorage.getItem("user_id") !== null ? localStorage.getItem("user_id").toString() : Math.floor(Math.random() * 16).toString()
      await rtmClient.login({ uid: UID, token: localStorage.getItem("rtm_token") })
      await rtmChannel.join()
      client.on('ConnectionStateChanged', async (state, reason) => {
        console.log('ConnectionStateChanged', state, reason)
      })
      rtmClient.on('MessageFromPeer', function (message, peerId) {
        if (message.text === "muteAudio") {
          tracks[0].setEnabled(false);
          setTrackState((ps) => {
            return { ...ps, audio: !ps.audio };
          });
        } else if (message.text === "unmuteAudio") {
          tracks[0].setEnabled(true);
          setTrackState((ps) => {
            return { ...ps, audio: !ps.audio };
          });
        }
      })
      rtmChannel.on('MemberJoined', (memberId) => {
        console.log('New Member: ', memberId)
      })
    };

    if (ready && tracks) {
      try {
        init(channelName);
        initRTM()
      } catch (error) {
        console.log(error);
        setError(true)
      }
    }
  }, [channelName, client, ready, tracks, error]);

  const sendMessage = async (text, UID) => {
    let peerId = UID.toString()
    try {
      await rtmClient.sendMessageToPeer({ text: text }, peerId).then(sendResult => {
        if (sendResult.hasPeerReceived) {
          console.log("message sent sucessfully", sendResult)
        } else {
          console.log("message failed", sendResult)
        }
      }).catch(error => {
        console.log("error", error)
      });
    } catch (error) {
      console.error(error);
    }
  }

  const cancelChat = () => {
    setOpenChat(false)
  }

  return (
    <div className="vc-container">
      <Grid container direction="column">
        <Grid item style={{ height: `${screenSize < 700 ? "0%" : "9%"}` }}>
          <div className='nav2'>
            <div className="headTab">
              <span
                className="btnBack"
                onClick={() => leaveChannel()}
              >
                &#60;
              </span>
              <h4 className="vc-heading">{callHeading}</h4>
            </div>
          </div>
        </Grid>
        {error ?
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}>
            <CircularProgress />
          </Box>
          :
          <>
            <Grid item style={{ height: `${screenSize < 700 ? "90%" : "81%"}` }}>
              {start && tracks && <Video tracks={tracks} users={users} isPinned={isPinned} activeSpeaker={activeSpeaker} activeSpeaker2={activeSpeaker2} openChat={openChat} allUsers={allUsers} sendMessage={sendMessage} trackState={trackState} />}
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


