import React from "react";
import { AgoraVideoPlayer } from "agora-rtc-react";
import { Grid, Button } from "@material-ui/core";
import { useState, useEffect } from "react";
import { useClient } from "./settings.js";
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from "axios"

export default function Video(props) {
  const { users, tracks, isPinned } = props;
  const client = useClient();
  const [gridSpacing, setGridSpacing] = useState(12);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleRequest = () => {
    window.open(localStorage.getItem("leaveURL"), "_blank");
    setAnchorEl(null);
  }

  const handleProfile = () => {
    window.open(localStorage.getItem("leaveURL"), "_blank");
    setAnchorEl(null);
  }

  const handleReport = () => {
    window.open(localStorage.getItem("leaveURL"), "_blank");
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
  console.log("all-users", users)
  useEffect(() => {
    setGridSpacing(Math.max(Math.floor(12 / (users.length + 1)), users.length < 4 ? 6 : users.length < 6 ? 4 : 3));
  }, [users]);
  return (
    <>
      {isPinned ?
        <div className="focusview">
            <div className="focuslocal">
              <AgoraVideoPlayer
                videoTrack={tracks[1]}
                style={{ height: "100%", width: "100%", position: "relative" }}
              >
              </AgoraVideoPlayer>
            </div>
            <div className="focusremote">
              {users.length > 0 &&
                users.map((user) => {
                  if (user.videoTrack) {
                    return (
                      <Grid item xs={gridSpacing}>
                        <AgoraVideoPlayer
                          videoTrack={user.videoTrack}
                          key={user.uid}
                          style={{ height: "100%", width: "100%", position: 'relative' }}
                        >
                          <Grid item>
                            <button
                              className="remotemute"
                              // onClick={() => mute("muteAudio", user.uid)}
                            >
                              {user.hasAudio ? "Mute" : "Unmute"}
                            </button>
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
                              <MenuItem onClick={handleRequest}>Friend Request</MenuItem>
                              <MenuItem onClick={handleProfile}>View Profile</MenuItem>
                              <MenuItem onClick={handleReport}>Report</MenuItem>
                              <MenuItem onClick={() => handlekick(user.uid)}>Kick</MenuItem>
                            </Menu>
                          </Grid>
                        </AgoraVideoPlayer>
                      </Grid>
                    );
                  } else return null;
                })}
            </div>
        </div>
        :
        <Grid container style={{ height: "100%" }}>
          <Grid item xs={gridSpacing}>
            <AgoraVideoPlayer
              videoTrack={tracks[1]}
              style={{ height: "100%", width: "100%", position: "relative" }}
            >
            </AgoraVideoPlayer>
          </Grid>
          {users.length > 0 &&
            users.map((user) => {
              if (user.videoTrack) {
                return (
                  <Grid item xs={gridSpacing}>
                    <AgoraVideoPlayer
                      videoTrack={user.videoTrack}
                      key={user.uid}
                      style={{ height: "100%", width: "100%", position: 'relative' }}
                    >
                      <Grid item>
                        <button
                          className="remotemute"
                          // onClick={() => mute("muteAudio", user.uid)}
                        >
                          {user.hasAudio ? "Mute" : "Unmute"}
                        </button>
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
                          <MenuItem onClick={handleRequest}>Friend Request</MenuItem>
                          <MenuItem onClick={handleProfile}>View Profile</MenuItem>
                          <MenuItem onClick={handleReport}>Report</MenuItem>
                          <MenuItem onClick={() => handlekick(user.uid)}>Kick</MenuItem>
                        </Menu>
                      </Grid>
                    </AgoraVideoPlayer>
                  </Grid>
                );
              } else return null;
            })}
        </Grid>
      }
    </>
  );
}
