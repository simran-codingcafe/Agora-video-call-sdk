import React from "react";
import { AgoraVideoPlayer } from "agora-rtc-react";
import { Grid, Button } from "@material-ui/core";
import { useState, useEffect } from "react";
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from "axios"

const imgSrc = localStorage.getItem("imageURL");


export default function Video(props) {
  const [gridSpacing, setGridSpacing] = useState(12);
  const [tracks, setTracks] = useState(props.tracks);
  const [UID, setUID] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [screeSize, setScreenSize] = useState(window.innerWidth);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  console.log(props.users, "child", props.rtmUsers)

  const handleClose = () => {
    setAnchorEl(null);
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

  useEffect(() => {
    window.onresize = function () {
      setScreenSize(window.innerWidth);
    };
  }, [])

  useEffect(() => {
    setGridSpacing(Math.max(Math.floor(12 / (props.rtmUsers?.length)), screeSize < 450 ? props.rtmUsers?.length < 3 ? 12 : 6 : props.rtmUsers?.length < 4 ? 6 : props.rtmUsers?.length < 6 ? 4 : 3));
    setTracks(props.tracks)
  }, [props.rtmUsers, props.tracks]);
  return (
    <>
      {props.isPinned ?
        <div className={`focusview`}>
          <div className={`${screeSize > 700 && screeSize < 800 ? "focuslocal2" : "focuslocal"}`} style={{ margin: `${props.openChat ? "0" : screeSize > 800 ? "0px 70px 0px 200px" : screeSize > 700 ? props.openChat ? "0" : "0 70px 0 65px" : "0"}` }}>
            {props.users?.length > 0 ?
              props.users.map((user) => (
                user.uid === props.activeSpeaker && props.activeSpeaker !== localStorage.getItem("user_id") ?
                  user.videoTrack !== undefined ?
                    <AgoraVideoPlayer
                      videoTrack={user.videoTrack}
                      style={{ height: "100%", width: "100%", backgroundColor: '#ffffff', position: 'relative' }}
                    >
                      <div className="remotebtnsinfo">
                        <button
                          className="remotebtns"
                          id={`demo-positioned-button-${user.uid}`}
                          aria-controls={open ? `demo-positioned-menu-${user.uid}` : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={(e) => { handleClick(e); setUID(user.uid); }}
                        >
                          <MoreHorizOutlinedIcon />
                        </button>
                        <Menu
                          id={`demo-positioned-menu-${user.uid}`}
                          aria-labelledby={`demo-positioned-button-${user.uid}`}
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
                          <MenuItem onClick={() => handleRequest(UID, "friend")}>Friend Request</MenuItem>
                          <MenuItem onClick={() => handleRequest(UID, "profile")}>View Profile</MenuItem>
                          <MenuItem
                            onClick={() => props.sendMessage(user.audioTrack !== undefined ? "muteAudio" : "unmuteAudio", UID)}
                          >{user.audioTrack !== undefined ? "Mute" : "Unmute"}</MenuItem>
                          <MenuItem onClick={() => handleRequest(UID, "report")}>Report</MenuItem>
                          {localStorage.getItem("isAdmin") === 1 ?
                            <MenuItem onClick={() => handlekick(UID)}>Remove from call</MenuItem>
                            : ""}
                        </Menu>
                      </div>
                      {props.allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                        <span className="vc-username">
                          {item.name}
                        </span>
                        : ""
                      ))}
                    </AgoraVideoPlayer>
                    :
                    <div className="local-focus-img">
                      {props.allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                        <>
                          <img className={`${props.activeSpeaker2 === user.uid ? "activeremoteplayer" : ""} img-focus-local`} src={item.image} alt="user image" />
                          <div className="remotebtnsinfo">
                            <button
                              className="remotebtns"
                              id={`demo-positioned-button-${user.uid}`}
                              aria-controls={open ? `demo-positioned-menu-${user.uid}` : undefined}
                              aria-haspopup="true"
                              aria-expanded={open ? 'true' : undefined}
                              onClick={(e) => { handleClick(e); setUID(user.uid); }}
                            >
                              <MoreHorizOutlinedIcon />
                            </button>
                            <Menu
                              id={`demo-positioned-menu-${user.uid}`}
                              aria-labelledby={`demo-positioned-button-${user.uid}`}
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
                              <MenuItem onClick={() => handleRequest(UID, "friend")}>Friend Request</MenuItem>
                              <MenuItem onClick={() => handleRequest(UID, "profile")}>View Profile</MenuItem>
                              <MenuItem
                                onClick={() => props.sendMessage(user.audioTrack !== undefined ? "muteAudio" : "unmuteAudio", UID)}
                              >{user.audioTrack !== undefined ? "Mute" : "Unmute"}</MenuItem>
                              <MenuItem onClick={() => handleRequest(UID, "report")}>Report</MenuItem>
                              {localStorage.getItem("isAdmin") === 1 ?
                                <MenuItem onClick={() => handlekick(UID)}>Remove from call</MenuItem>
                                : ""}
                            </Menu>
                          </div>
                          <span className="vc-username">
                            {item.name}
                          </span>
                        </>
                        : ""
                      ))}
                    </div>
                  :
                  user.videoTrack !== undefined ?

                    <AgoraVideoPlayer
                      videoTrack={user.videoTrack}
                      style={{ height: "100%", width: "100%", backgroundColor: '#ffffff', position: 'relative' }}
                    >
                      <div className="remotebtnsinfo">
                        <button
                          className="remotebtns"
                          id={`demo-positioned-button-${user.uid}`}
                          aria-controls={open ? `demo-positioned-menu-${user.uid}` : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          onClick={(e) => { handleClick(e); setUID(user.uid); }}
                        >
                          <MoreHorizOutlinedIcon />
                        </button>
                        <Menu
                          id={`demo-positioned-menu-${user.uid}`}
                          aria-labelledby={`demo-positioned-button-${user.uid}`}
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
                          <MenuItem onClick={() => handleRequest(UID, "friend")}>Friend Request</MenuItem>
                          <MenuItem onClick={() => handleRequest(UID, "profile")}>View Profile</MenuItem>
                          <MenuItem
                            onClick={() => props.sendMessage(user.audioTrack !== undefined ? "muteAudio" : "unmuteAudio", UID)}
                          >{user.audioTrack !== undefined ? "Mute" : "Unmute"}</MenuItem>
                          <MenuItem onClick={() => handleRequest(UID, "report")}>Report</MenuItem>
                          {localStorage.getItem("isAdmin") === 1 ?
                            <MenuItem onClick={() => handlekick(UID)}>Remove from call</MenuItem>
                            : ""}
                        </Menu>
                      </div>
                      {props.allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                        <span className="vc-username">
                          {item.name}
                        </span>
                        : ""
                      ))}
                    </AgoraVideoPlayer>
                    :
                    <div className="local-focus-img">
                      {props.allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                        <>
                          <img className={`${props.activeSpeaker2 === user.uid ? "activeremoteplayer" : ""} img-focus-local`} src={item.image} alt="user image" />
                          <div className="remotebtnsinfo">
                            <button
                              className="remotebtns"
                              id={`demo-positioned-button-${user.uid}`}
                              aria-controls={open ? `demo-positioned-menu-${user.uid}` : undefined}
                              aria-haspopup="true"
                              aria-expanded={open ? 'true' : undefined}
                              onClick={(e) => { handleClick(e); setUID(user.uid); }}
                            >
                              <MoreHorizOutlinedIcon />
                            </button>
                            <Menu
                              id={`demo-positioned-menu-${user.uid}`}
                              aria-labelledby={`demo-positioned-button-${user.uid}`}
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
                              <MenuItem onClick={() => handleRequest(UID, "friend")}>Friend Request</MenuItem>
                              <MenuItem onClick={() => handleRequest(UID, "profile")}>View Profile</MenuItem>
                              <MenuItem
                                onClick={() => props.sendMessage(user.audioTrack !== undefined ? "muteAudio" : "unmuteAudio", UID)}
                              >{user.audioTrack !== undefined ? "Mute" : "Unmute"}</MenuItem>
                              <MenuItem onClick={() => handleRequest(UID, "report")}>Report</MenuItem>
                              {localStorage.getItem("isAdmin") === 1 ?
                                <MenuItem onClick={() => handlekick(UID)}>Remove from call</MenuItem>
                                : ""}
                            </Menu>
                          </div>
                          <span className="vc-username">
                            {item.name}
                          </span>
                        </>
                        : ""
                      ))}
                    </div>
              ))
              :
              <>
                {props.trackState.video === true ?
                  <AgoraVideoPlayer
                    videoTrack={tracks[1]}
                    style={{ height: "100%", width: "100%", backgroundColor: '#ffffff', position: 'relative' }}
                  >
                    <span className="vc-username" >{localStorage.getItem("username")}</span>
                  </AgoraVideoPlayer>
                  :
                  <div className="local-focus-img">
                    <img src={imgSrc} alt="user image" className={`img-focus-local`} />
                    <span className="vc-username" >{localStorage.getItem("username")}</span>
                  </div>
                }
              </>
            }
          </div>
          <div className="focusremote" style={{ width: `${screeSize < 767 ? `${screeSize - 32}px` : props.openChat ? '220px' : '350px'}` }}>
            {props.users?.length > 0 ?
              <>
                {props.trackState.video === true ?
                  <div className={`remoteplayer`}>
                    <AgoraVideoPlayer
                      videoTrack={tracks[1]}
                      style={{ height: "100%", width: "100%", backgroundColor: '#ffffff', position: 'relative' }}
                    >
                      <span className="vc-username" >{localStorage.getItem("username")}</span>
                    </AgoraVideoPlayer>
                  </div>
                  :
                  <div className="remoteplayer">
                    <div className="focus-remote-img">
                      <img src={imgSrc} alt="user image" className={`img-remote-focus`} />
                      <span className="vc-username" >{localStorage.getItem("username")}</span>
                    </div>
                  </div>
                }
              </>
              :
              props.rtmUsers?.length > 1 ?
                (props.rtmUsers.map((rtmuser, ind) => rtmuser !== localStorage.getItem("user_id") ?
                  <div className="remoteplayer">
                    <div className="focus-remote-img">
                      {props.allUsers?.map((item) => (item.user_id === parseInt(rtmuser) ?
                        <>
                          <img className={`${props.activeSpeaker2 === rtmuser ? "activeremoteplayer" : ""} img-remote-focus`} src={item.image} alt="user image" />
                          <div className="remotebtnsinfo">
                            <button
                              className="remotebtns"
                              id={`demo-positioned-button-${rtmuser}`}
                              aria-controls={open ? `demo-positioned-menu-${rtmuser}` : undefined}
                              aria-haspopup="true"
                              aria-expanded={open ? 'true' : undefined}
                              onClick={(e) => { handleClick(e); setUID(rtmuser); }}
                            >
                              <MoreHorizOutlinedIcon />
                            </button>
                            <Menu
                              id={`demo-positioned-menu-${rtmuser}`}
                              aria-labelledby={`demo-positioned-button-${rtmuser}`}
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
                              <MenuItem onClick={() => handleRequest(UID, "friend")}>Friend Request</MenuItem>
                              <MenuItem onClick={() => handleRequest(UID, "profile")}>View Profile</MenuItem>
                              <MenuItem
                                onClick={() => props.sendMessage("unmuteAudio", UID)}
                              >Unmute</MenuItem>
                              <MenuItem onClick={() => handleRequest(UID, "report")}>Report</MenuItem>
                              {localStorage.getItem("isAdmin") === 1 ?
                                <MenuItem onClick={() => handlekick(UID)}>Remove from call</MenuItem>
                                : ""}
                            </Menu>
                          </div>
                          <span className="vc-username">
                            {item.name}
                          </span>
                        </>
                        : ""
                      ))}
                    </div>
                  </div>
                  :
                  ""
                ))
                :
                ""
            }
            {props.users?.length > 1 &&
              props.users.map((user) => (
                user.uid !== props.activeSpeaker ?
                  user.videoTrack === undefined ?
                    <>
                      <div className="remoteplayer">
                        <div className="focus-remote-img">
                          {props.allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                            <>
                              <img className={`${props.activeSpeaker2 === user.uid ? "activeremoteplayer" : ""} img-remote-focus`} src={item.image} alt="user image" />
                              <div className="remotebtnsinfo">
                                <button
                                  className="remotebtns"
                                  id={`demo-positioned-button-${user.uid}`}
                                  aria-controls={open ? `demo-positioned-menu-${user.uid}` : undefined}
                                  aria-haspopup="true"
                                  aria-expanded={open ? 'true' : undefined}
                                  onClick={(e) => { handleClick(e); setUID(user.uid); }}
                                >
                                  <MoreHorizOutlinedIcon />
                                </button>
                                <Menu
                                  id={`demo-positioned-menu-${user.uid}`}
                                  aria-labelledby={`demo-positioned-button-${user.uid}`}
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
                                  <MenuItem onClick={() => handleRequest(UID, "friend")}>Friend Request</MenuItem>
                                  <MenuItem onClick={() => handleRequest(UID, "profile")}>View Profile</MenuItem>
                                  <MenuItem
                                    onClick={() => props.sendMessage(user.audioTrack !== undefined ? "muteAudio" : "unmuteAudio", UID)}
                                  >{user.audioTrack !== undefined ? "Mute" : "Unmute"}</MenuItem>
                                  <MenuItem onClick={() => handleRequest(UID, "report")}>Report</MenuItem>
                                  {localStorage.getItem("isAdmin") === 1 ?
                                    <MenuItem onClick={() => handlekick(UID)}>Remove from call</MenuItem>
                                    : ""}
                                </Menu>
                              </div>
                              <span className="vc-username">
                                {item.name}
                              </span>
                            </>
                            : ""
                          ))}
                        </div>
                      </div>
                    </>
                    :
                    <div className={`remoteplayer`}>
                      <AgoraVideoPlayer
                        videoTrack={user.videoTrack}
                        key={user.uid}
                        style={{ height: "100%", width: "100%", position: 'relative', borderRadius: '40px' }}
                      >
                        <div className="remotebtnsinfo">
                          <button
                            className="remotebtns"
                            id={`demo-positioned-button-${user.uid}`}
                            aria-controls={open ? `demo-positioned-menu-${user.uid}` : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={(e) => { handleClick(e); setUID(user.uid); }}
                          >
                            <MoreHorizOutlinedIcon />
                          </button>
                          <Menu
                            id={`demo-positioned-menu-${user.uid}`}
                            aria-labelledby={`demo-positioned-button-${user.uid}`}
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
                            <MenuItem onClick={() => handleRequest(UID, "friend")}>Friend Request</MenuItem>
                            <MenuItem onClick={() => handleRequest(UID, "profile")}>View Profile</MenuItem>
                            <MenuItem
                              onClick={() => props.sendMessage(user.audioTrack !== undefined ? "muteAudio" : "unmuteAudio", UID)}
                            >{user.audioTrack !== undefined ? "Mute" : "Unmute"}</MenuItem>
                            <MenuItem onClick={() => handleRequest(UID, "report")}>Report</MenuItem>
                            {localStorage.getItem("isAdmin") === 1 ?
                              <MenuItem onClick={() => handlekick(UID)}>Remove from call</MenuItem>
                              : ""}
                          </Menu>
                        </div>
                        {props.allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                          <span className="vc-username">
                            {item.name}
                          </span>
                          : ""
                        ))}
                      </AgoraVideoPlayer>
                    </div>
                  :
                  ""
              ))}
          </div>
        </div>
        :
        <Grid container style={{ height: "100%" }}>
          <Grid item xs={gridSpacing}>
            {props.trackState.video !== true ?
              <div className="gridlocal">
                <div className="local-grid-img">
                  <img src={imgSrc} alt="user image" className={`${props.activeSpeaker === parseInt(localStorage.getItem("user_id")) ? "activeremoteplayer" : ""} img-grid-local`} />
                  <span className="vc-username" >{localStorage.getItem("username")}</span>
                </div>
              </div>
              :
              <div className={`${props.activeSpeaker2 === parseInt(localStorage.getItem("user_id")) ? "activeremoteplayer" : ""} gridlocal`}>
                <AgoraVideoPlayer
                  videoTrack={tracks[1]}
                  style={{ height: "100%", width: "100%", backgroundColor: '#ffffff', position: 'relative' }}
                >
                  <span className="vc-username" >{localStorage.getItem("username")}</span>
                </AgoraVideoPlayer>
              </div>
            }
          </Grid>
          {props.rtmUsers?.length > 0 ?
            (props.rtmUsers.map((rtmuser, ind) => rtmuser !== localStorage.getItem("user_id") ?
              props.users?.length !== 0 ?
                props.users?.length > 0 &&
                props.users.map((user) => (user.uid === rtmuser ?
                  user.videoTrack === undefined ?
                    <Grid item xs={gridSpacing}>
                      <div className="remoteplayer2">
                        <div className="grid-remote-img">
                          {props.allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                            <>
                              <img className={`${props.activeSpeaker2 === user.uid ? "activeremoteplayer" : ""} img-remote-grid`} src={item.image} alt="user image" />
                              <div className="remotebtnsinfo">
                                <button
                                  className="remotebtns"
                                  id={`demo-positioned-button-${user.uid}`}
                                  aria-controls={open ? `demo-positioned-menu-${user.uid}` : undefined}
                                  aria-haspopup="true"
                                  aria-expanded={open ? 'true' : undefined}
                                  onClick={(e) => { handleClick(e); setUID(user.uid); }}
                                >
                                  <MoreHorizOutlinedIcon />
                                </button>
                                <Menu
                                  id={`demo-positioned-menu-${user.uid}`}
                                  aria-labelledby={`demo-positioned-button-${user.uid}`}
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
                                  <MenuItem onClick={() => handleRequest(item.user_id, "friend")}>Friend Request</MenuItem>
                                  <MenuItem onClick={() => handleRequest(item.user_id, "profile")}>View Profile</MenuItem>
                                  <MenuItem
                                    onClick={() => props.sendMessage(user.audioTrack !== undefined ? "muteAudio" : "unmuteAudio", item.user_id)}
                                  >{user.audioTrack !== undefined ? "Mute" : "Unmute"}</MenuItem>
                                  <MenuItem onClick={() => handleRequest(item.user_id, "report")}>Report</MenuItem>
                                  {localStorage.getItem("isAdmin") === 1 ?
                                    <MenuItem onClick={() => handlekick(item.user_id)}>Remove from call</MenuItem>
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
                        </div>
                      </div>
                    </Grid>
                    :
                    <Grid item xs={gridSpacing}>
                      <div className={`${props.activeSpeaker2 === user.uid ? "activeremoteplayer" : ""} remoteplayer2`}>
                        <AgoraVideoPlayer
                          videoTrack={user.videoTrack}
                          key={user.uid}
                          style={{ height: "100%", width: "100%", position: 'relative' }}
                        >
                          <div className="remotebtnsinfo">
                            <button
                              className="remotebtns"
                              id={`demo-positioned-button-${user.uid}`}
                              aria-controls={open ? `demo-positioned-menu-${user.uid}` : undefined}
                              aria-haspopup="true"
                              aria-expanded={open ? 'true' : undefined}
                              onClick={(e) => { handleClick(e); setUID(user.uid); }}
                            >
                              <MoreHorizOutlinedIcon />
                            </button>
                            <Menu
                              id={`demo-positioned-menu-${user.uid}`}
                              aria-labelledby={`demo-positioned-button-${user.uid}`}
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
                              <MenuItem onClick={() => handleRequest(UID, "friend")}>Friend Request</MenuItem>
                              <MenuItem onClick={() => handleRequest(UID, "profile")}>View Profile</MenuItem>
                              <MenuItem
                                onClick={() => props.sendMessage(user.audioTrack !== undefined ? "muteAudio" : "unmuteAudio", UID)}
                              >{user.audioTrack !== undefined ? "Mute" : "Unmute"}</MenuItem>
                              <MenuItem onClick={() => handleRequest(UID, "report")}>Report</MenuItem>
                              {localStorage.getItem("isAdmin") === 1 ?
                                <MenuItem onClick={() => handlekick(UID)}>Remove from call</MenuItem>
                                : ""}
                            </Menu>
                          </div>
                          {props.allUsers?.map((item) => (item.user_id === parseInt(user.uid) ?
                            <span className="vc-username">
                              {item.name}
                            </span>
                            : ""
                          ))}
                        </AgoraVideoPlayer>
                      </div>
                    </Grid>
                  :
                  ""
                ))
                :
                <Grid item xs={gridSpacing}>
                  <div className="remoteplayer2" key={ind}>
                    <div className="grid-remote-img">
                      {props.allUsers?.map((item) => (item.user_id === parseInt(rtmuser) ?
                        <>
                          <img className={`${props.activeSpeaker2 === rtmuser ? "activeremoteplayer" : ""} img-remote-grid`} src={item.image} alt="user image" />
                          <div className="remotebtnsinfo">
                            <button
                              className="remotebtns"
                              id={`demo-positioned-button-${rtmuser}`}
                              aria-controls={open ? `demo-positioned-menu-${rtmuser}` : undefined}
                              aria-haspopup="true"
                              aria-expanded={open ? 'true' : undefined}
                              onClick={(e) => { handleClick(e); setUID(rtmuser); }}
                            >
                              <MoreHorizOutlinedIcon />
                            </button>
                            <Menu
                              id={`demo-positioned-menu-${rtmuser}`}
                              aria-labelledby={`demo-positioned-button-${rtmuser}`}
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
                              <MenuItem onClick={() => handleRequest(item.user_id, "friend")}>Friend Request</MenuItem>
                              <MenuItem onClick={() => handleRequest(item.user_id, "profile")}>View Profile</MenuItem>
                              <MenuItem
                                onClick={() => props.sendMessage("unmuteAudio", item.user_id)}
                              >Unmute</MenuItem>
                              <MenuItem onClick={() => handleRequest(item.user_id, "report")}>Report</MenuItem>
                              {localStorage.getItem("isAdmin") === 1 ?
                                <MenuItem onClick={() => handlekick(item.user_id)}>Remove from call</MenuItem>
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
                    </div>
                  </div>
                </Grid>
              :
              ""
            ))
            : ""
          }
        </Grid>
      }
    </>
  );
}
