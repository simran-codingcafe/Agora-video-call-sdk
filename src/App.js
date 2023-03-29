import { useState, useEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import VideoCall from "./VideoCall";
import AgoraClient from "./AgoraClient";
import axios from "axios"



function App() {
  const [inCall, setInCall] = useState(false);

  const fetchData = async () => {
    const response = await fetch(`https://lingwa.app/wp-json/api/video-call-details?thread_id=${localStorage.getItem("thread_id")}&user_id=${localStorage.getItem("user_id")}`)
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
        localStorage.setItem("imageURL", res.data.user.image)
        localStorage.setItem("username", res.data.user.name)
        localStorage.setItem("isAdmin", res.data.user.is_group_organizer ? "yes" : "no")
        setInCall(true)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])
 
  useEffect(() => {
      const handleTabClose = (event) => {
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
            window.close()
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
  
  // window.addEventListener('beforeunload', function (event) {
  //   // Prevent the default browser behavior
  //   event.preventDefault();

  //   // Send an API request using Axios
  //   axios
  //     .get(
  //       `https://lingwa.app/wp-json/api/leave-call?thread_id=${localStorage.getItem("thread_id")}&user_id=${localStorage.getItem("user_id")}`,
  //       {
  //         headers: {
  //           "content-type": "application/json",
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       if (res.data.success) {
  //         console.log(res.data)
  //         window.close()
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });

  //   // Close the tab
  //   // window.close();
  // });

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
