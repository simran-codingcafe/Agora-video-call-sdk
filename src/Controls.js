import { useEffect, useState } from "react";
import { useClient } from "./settings";
import { Grid } from "@material-ui/core";
import MicNoneOutlinedIcon from "@material-ui/icons/MicNoneOutlined";
import MicOffOutlinedIcon from "@material-ui/icons/MicOffOutlined";
import VideocamIconOutlined from "@material-ui/icons/VideocamOutlined";
import VideocamOffIconOutlined from "@material-ui/icons/VideocamOffOutlined";
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaicOutlined';

export default function Controls(props) {
  const client = useClient();
  const { tracks, setStart, setInCall, openChat, setOpenChat, isPinned, setPinned } = props;
  const [trackState, setTrackState] = useState({ video: true, audio: true });

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const calltype = params.get('join-with');

    if (calltype === "audio") {
      setTimeout(() => {
        mute("video")
      }, 500);
    }
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
    window.location.href = localStorage.getItem("leaveURL")
  };

  return (
    <Grid container spacing={2} alignItems="center" className="btnContainer">
      <button className="localbtns" onClick={() => mute("video")}>
        {trackState.video ? <VideocamIconOutlined /> : <VideocamOffIconOutlined />}
      </button>
      <button className="localbtns" onClick={() => mute("audio")}>
        {trackState.audio ? <MicNoneOutlinedIcon /> : <MicOffOutlinedIcon />}
      </button>
      <button className="localbtns" style={{ color: "red", transform: "scaleX(-1)" }} onClick={() => leaveChannel()}>
        <PhoneDisabledIcon />
      </button>
      <button className="localbtns" style={{ color: openChat ? "blue" : "" }} onClick={() => setOpenChat(!openChat)}>
        <ChatIcon />
      </button>
      <button className="localbtns" onClick={() => setPinned(!isPinned)}>
        <AutoAwesomeMosaicIcon />
      </button>
    </Grid>
  );
}