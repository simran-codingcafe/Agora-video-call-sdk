import { useEffect, useState } from "react";
import { useClient } from "./settings.js";
import { Grid } from "@material-ui/core";
import MicNoneOutlinedIcon from "@material-ui/icons/MicNoneOutlined";
import MicOffOutlinedIcon from "@material-ui/icons/MicOffOutlined";
import VideocamIconOutlined from "@material-ui/icons/VideocamOutlined";
import VideocamOffIconOutlined from "@material-ui/icons/VideocamOffOutlined";
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaicOutlined';
import axios from "axios"


export default function Controls(props) {
  const client = useClient();
  const { setStart, setInCall, tracks, openChat, setOpenChat, isPinned, setPinned } = props;
  const [trackState, setTrackState] = useState({ video: true, audio: true });

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const calltype = params.get('join-with');

    setTimeout(() => {
      if (calltype === "audio") {
        setTimeout(() => {
          tracks[1].setEnabled(!trackState.video);
          setTrackState((ps) => {
            return { ...ps, video: !ps.video };
          });
        }, 1000);
      }
    }, 1000);
  }, [])

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

  return (
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
        <ChatIcon />
      </button>
      <button className="vc-localbtns" onClick={() => setPinned(!isPinned)}>
        <AutoAwesomeMosaicIcon />
      </button>
    </Grid>
  );
}