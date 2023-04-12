import { useState, useEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import VideoCall from "./VideoCall";
import axios from "axios"


function App() {
  const [inCall, setInCall] = useState(false);
  const [data, setData] = useState("");

  const fetchData = async () => {
    const response = await fetch(`https://lingwa.app/wp-json/api/video-call-details?thread_id=${localStorage.getItem("thread_id")}&user_id=${localStorage.getItem("user_id") !== null ? localStorage.getItem("user_id") : Math.floor(Math.random() * 16).toString()}`)
    if (!response.ok) {
      throw new Error('Data coud not be fetched!')
    } else {
      return response.json()
    }
  }

  useEffect(() => {
    fetchData()
      .then((res) => {
        setData(res.data)
        localStorage.setItem("type", res.data.type)
        localStorage.setItem("appId", res.data.app_id)
        localStorage.setItem("rtm_appId", res.data.rtm_app_id)
        localStorage.setItem("channelName", res.data.channel_name)
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("rtm_token", res.data.rtm_token)
        localStorage.setItem("callHeading", res.data.call_heading)
        localStorage.setItem("leaveURL", res.data.leave_url)
        localStorage.setItem("isAdmin", res.data.is_group_organizer)
        localStorage.setItem("imageURL", res.data.user.image)
        localStorage.setItem("username", res.data.user.name)
        localStorage.setItem("user_id", res.data.user.id)
        setTimeout(() => {
          setInCall(true)
        }, 500);
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])

  useEffect(() => {
    const handleTabClose = () => {
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
          }
        })
        .catch((error) => {
          console.error(error);
        });
    };
    window.addEventListener("beforeunload", handleTabClose);
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, []);
  
 
  return (
    <div className="App" style={{ height: "100%" }}>
      {inCall ? (
        <VideoCall setInCall={setInCall} data={data} />
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
