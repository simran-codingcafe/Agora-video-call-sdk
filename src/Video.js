import React from "react";
import { AgoraVideoPlayer } from "agora-rtc-react";
import { Grid, Button } from "@material-ui/core";
import { useState, useEffect } from "react";
import { useClient, useMicrophoneAndCameraTracks } from "./settings.js";
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from "axios"

export default function Video(props) {
  const { users, isPinned } = props;
  const client = useClient();
  const [gridSpacing, setGridSpacing] = useState(12);
  const [tracks, setTracks] = useState(props.tracks);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [screeSize, setScreenSize] = useState(window.innerWidth);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }

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

  const handleRequest = (uid, type) => {
    axios
      .get(
        `https://lingwa.app/wp-json/api/user-other-info?&user_id=${localStorage.getItem("user_id")}&other_user_id=${uid}`,
        {
          headers: {
            "content-type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          if (type === "friend") {
            window.open(res.data.data.send_friend_request, "_blank");
          } else if (type === "profile") {
            window.open(res.data.data.view_profile, "_blank");
          } else if (type === "report") {
            window.open(res.data.data.report, "_blank");
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
    setAnchorEl(null);
  }

  const handlekick = (uid) => {
    let customerKey = "5e97d03a9c104f47b5d441660f476980";
    let customerSecret = "beb02824b8504fbabc13146588c61772";
    let plainCredential = customerKey + ":" + customerSecret;
    let encoder = new TextEncoder();
    let plainTextBytes = encoder.encode(plainCredential);
    let encodedCredential = btoa(String.fromCharCode(...new Uint8Array(plainTextBytes)))
    setAnchorEl(null);
    const formData = new FormData();
    formData.append("appid", localStorage.getItem("appId"));
    formData.append("cname", localStorage.getItem("channalName"));
    formData.append("uid", uid);
    formData.append("ip", "");
    formData.append("time", 0);
    formData.append("privileges", [
      "join_channel"
    ]);
    axios
      .post(
        `https://api.agora.io/dev/v1/kicking-rule`,
        {
          appid: localStorage.getItem("appId"),
          cname: localStorage.getItem("channelName"),
          uid: uid,
          ip: "",
          time: 0,
          privileges: [
            "join_channel"
          ],
        },
        {
          headers: {
            // "Content-type": "multipart/form-data",
            "Authorization": "Basic " + encodedCredential
          },
        }
      )
      .then((res) => {
        // if (res.data.success) {
        // }
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const mute = async (type, UID) => {
    if (type === "muteAudio") {
      client.muteRemoteAudioStream(UID, true);
    } else if (type === "unmuteAudio") {
      client.muteRemoteAudioStream(UID, false);
    }
  };

  useEffect(() => {
    window.onresize = function () {
      setScreenSize(window.innerWidth);
    };
  }, [])
  console.log(tracks, "all", props.activeSpeaker)

  useEffect(() => {
    setGridSpacing(Math.max(Math.floor(12 / (users?.length + 1)), users?.length < 4 ? 6 : users?.length < 6 ? 4 : 3));
    getUsersDetails()
  }, [users, tracks]);
  return (
    <>
      {isPinned ?
        <div className={`${props.activeSpeaker === parseInt(localStorage.getItem("user_id")) ? "activeremoteplayer" : ""}  focusview`}>
          <div className={`${screeSize > 700 && screeSize < 800 ? "focuslocal2" : "focuslocal"}`} style={{ margin: `${props.openChat ? "0" : screeSize > 800 ? "0px 100px 0px 250px" : screeSize > 700 ? "0 70px 0 65px" : "0"}` }}>
            {tracks[1]._enabled === true ?
              <AgoraVideoPlayer
                videoTrack={tracks[1]}
                style={{ height: "100%", width: "100%", backgroundColor: '#ffffff', position: 'relative' }}
              >
                <span className="vc-username" >{localStorage.getItem("username")}</span>
              </AgoraVideoPlayer>
              :
              <div className="local-focus-img">
                <img src={localStorage.getItem("imageURL")} alt="user image" className={`${props.activeSpeaker === parseInt(localStorage.getItem("user_id")) ? "activeremoteplayer" : ""}  img-focus-local`} />
                <span className="vc-username" >{localStorage.getItem("username")}</span>
              </div>
            }
          </div>
          <div className="focusremote" style={{ width: `${screeSize < 767 ? `${screeSize - 32}px` : '350px'}` }}>
            {users?.length > 0 &&
              users.map((user) => (
                user.videoTrack !== undefined ?
                  <div className={`${props.activeSpeaker === user.uid ? "activeremoteplayer" : ""} remoteplayer`}>
                    <AgoraVideoPlayer
                      videoTrack={user.videoTrack}
                      key={user.uid}
                      style={{ height: "100%", width: "100%", position: 'relative', borderRadius: '40px' }}
                    >
                      <div className="remotebtnsinfo">
                        <button
                          className="remotebtns"
                          id="demo-positioned-button"
                          aria-controls={open ? 'demo-positioned-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleClick}
                        >
                          <MoreHorizOutlinedIcon />
                        </button>
                        <Menu
                          id="demo-positioned-menu"
                          aria-labelledby="demo-positioned-button"
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                        >
                          <MenuItem onClick={() => handleRequest(user.uid, "friend")}>Friend Request</MenuItem>
                          <MenuItem onClick={() => handleRequest(user.uid, "profile")}>View Profile</MenuItem>
                          <MenuItem
                          // onClick={() => mute("muteAudio", user.uid)}
                          >{user.hasAudio ? "Mute" : "Unmute"}</MenuItem>
                          <MenuItem onClick={() => handleRequest(user.uid, "report")}>Report</MenuItem>
                          {localStorage.getItem("isAdmin") === true ?
                            <MenuItem onClick={() => handlekick(user.uid)}>Remove from call</MenuItem>
                            : ""}
                        </Menu>
                      </div>
                      {allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                        <span className="vc-username">
                          {item.name}
                        </span>
                        : ""
                      ))}
                    </AgoraVideoPlayer>
                  </div>
                  :
                  <>
                    <div className="remoteplayer">
                      <div className="focus-remote-img">
                        {allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                          <>
                            <img className={`${props.activeSpeaker === user.uid ? "activeremoteplayer" : ""} img-remote-focus`} src={item.image} alt="user image" />
                            <div className="remotebtnsinfo">
                              <button
                                className="remotebtns"
                                id="demo-positioned-button"
                                aria-controls={open ? 'demo-positioned-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleClick}
                              >
                                <MoreHorizOutlinedIcon />
                              </button>
                              <Menu
                                id="demo-positioned-menu"
                                aria-labelledby="demo-positioned-button"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                anchorOrigin={{
                                  vertical: 'top',
                                  horizontal: 'left',
                                }}
                                transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'left',
                                }}
                              >
                                <MenuItem onClick={() => handleRequest(user.uid, "friend")}>Friend Request</MenuItem>
                                <MenuItem onClick={() => handleRequest(user.uid, "profile")}>View Profile</MenuItem>
                                <MenuItem
                                // onClick={() => mute("muteAudio", user.uid)}
                                >{user.hasAudio ? "Mute" : "Unmute"}</MenuItem>
                                <MenuItem onClick={() => handleRequest(user.uid, "report")}>Report</MenuItem>
                                {localStorage.getItem("isAdmin") === true ?
                                  <MenuItem onClick={() => handlekick(user.uid)}>Remove from call</MenuItem>
                                  : ""}
                              </Menu>
                            </div>
                            <span className="vc-username">
                              {item.name}
                            </span>
                          </>
                          : ""
                        ))}
                        <img className={`${props.activeSpeaker === user.uid ? "activeremoteplayer" : ""} img-remote-focus`} src={localStorage.getItem("imageURL")} alt="user image" />
                      </div>
                    </div>
                  </>
              ))}
          </div>
        </div>
        :
        <Grid container style={{ height: "100%" }}>
          <Grid item xs={gridSpacing}>
            {tracks[1]._enabled === true ?
              <div className={`${props.activeSpeaker === parseInt(localStorage.getItem("user_id")) ? "activeremoteplayer" : ""} gridlocal`}>
                <AgoraVideoPlayer
                  videoTrack={tracks[1]}
                  style={{ height: "100%", width: "100%", backgroundColor: '#ffffff', position: 'relative' }}
                >
                  <span className="vc-username" >{localStorage.getItem("username")}</span>
                </AgoraVideoPlayer>
              </div>
              :
              <div className="gridlocal">
                <div className="local-grid-img">
                  <img src={localStorage.getItem("imageURL")} alt="user image" className={`${props.activeSpeaker === parseInt(localStorage.getItem("user_id")) ? "activeremoteplayer" : ""} img-grid-local`} />
                  <span className="vc-username" >{localStorage.getItem("username")}</span>
                </div>
              </div>
            }
          </Grid>
          {users?.length > 0 &&
            users.map((user) => (
              user.videoTrack !== undefined ?
                <Grid item xs={gridSpacing}>
                  <div className={`${props.activeSpeaker === user.uid ? "activeremoteplayer" : ""} remoteplayer2`}>
                    <AgoraVideoPlayer
                      videoTrack={user.videoTrack}
                      key={user.uid}
                      style={{ height: "100%", width: "100%", position: 'relative' }}
                    >
                      <div className="remotebtnsinfo">
                        <button
                          className="remotebtns"
                          id="demo-positioned-button"
                          aria-controls={open ? 'demo-positioned-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={handleClick}
                        >
                          <MoreHorizOutlinedIcon />
                        </button>
                        <Menu
                          id="demo-positioned-menu"
                          aria-labelledby="demo-positioned-button"
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                        >
                          <MenuItem onClick={() => handleRequest(user.uid, "friend")}>Friend Request</MenuItem>
                          <MenuItem onClick={() => handleRequest(user.uid, "profile")}>View Profile</MenuItem>
                          <MenuItem
                          // onClick={() => mute("muteAudio", user.uid)}
                          >{user.hasAudio ? "Mute" : "Unmute"}</MenuItem>
                          <MenuItem onClick={() => handleRequest(user.uid, "report")}>Report</MenuItem>
                          {localStorage.getItem("isAdmin") === true ?
                            <MenuItem onClick={() => handlekick(user.uid)}>Remove from call</MenuItem>
                            : ""}
                        </Menu>
                      </div>
                      {allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                        <span className="vc-username">
                          {item.name}
                        </span>
                        : ""
                      ))}
                    </AgoraVideoPlayer>
                  </div>
                </Grid>
                :
                <Grid item xs={gridSpacing}>
                  <div className="remoteplayer2">
                    <div className="grid-remote-img">
                      {allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                        <>
                          <img className={`${props.activeSpeaker === user.uid ? "activeremoteplayer" : ""} img-remote-grid`} src={item.image} alt="user image" />
                          <div className="remotebtnsinfo">
                            <button
                              className="remotebtns"
                              id="demo-positioned-button"
                              aria-controls={open ? 'demo-positioned-menu' : undefined}
                              aria-haspopup="true"
                              aria-expanded={open ? 'true' : undefined}
                              onClick={handleClick}
                            >
                              <MoreHorizOutlinedIcon />
                            </button>
                            <Menu
                              id="demo-positioned-menu"
                              aria-labelledby="demo-positioned-button"
                              anchorEl={anchorEl}
                              open={open}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                            >
                              <MenuItem onClick={() => handleRequest(user.uid, "friend")}>Friend Request</MenuItem>
                              <MenuItem onClick={() => handleRequest(user.uid, "profile")}>View Profile</MenuItem>
                              <MenuItem
                              // onClick={() => mute("muteAudio", user.uid)}
                              >{user.hasAudio ? "Mute" : "Unmute"}</MenuItem>
                              <MenuItem onClick={() => handleRequest(user.uid, "report")}>Report</MenuItem>
                              {localStorage.getItem("isAdmin") === true ?
                                <MenuItem onClick={() => handlekick(user.uid)}>Remove from call</MenuItem>
                                : ""}
                            </Menu>
                          </div>
                          <span className="vc-username">
                            {item.name}
                          </span>
                        </>
                        :
                        ""
                      ))}
                      <img className={`${props.activeSpeaker === user.uid ? "activeremoteplayer" : ""} img-remote-grid`} src={localStorage.getItem("imageURL")} alt="user image" />
                    </div>
                  </div>
                </Grid>
            ))}
        </Grid>
      }
    </>
  );
}
