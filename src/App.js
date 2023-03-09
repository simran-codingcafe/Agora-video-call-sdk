import { useState, useEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import VideoCall from "./VideoCall";

function App() {
  const [inCall, setInCall] = useState(false);

  const fetchData = async () => {
    const response = await fetch(`https://wordpress-932189-3236313.cloudwaysapps.com/wp-json/api/video-call-details?thread_id=${localStorage.getItem("thread_id")}&user_id=${localStorage.getItem("user_id")}`)
    if (!response.ok) {
      throw new Error('Data coud not be fetched!')
    } else {
      return response.json()
    }
  }

  useEffect(() => {
    fetchData()
      .then((res) => {
        localStorage.setItem("type", res.data.type)
        localStorage.setItem("appId", res.data.app_id)
        localStorage.setItem("channelName", res.data.channel_name)
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("callHeading", res.data.call_heading)
        localStorage.setItem("leaveURL", res.data.leave_url)
        localStorage.setItem("username", res.data.user.name)
        setInCall(true)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])

  return (
    <div className="App" style={{ height: "100%" }}>
      {inCall ? (
        <VideoCall setInCall={setInCall} />
      ) : (
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}>
          <CircularProgress />
        </Box>
      )}
    </div>
  );
}

export default App;
