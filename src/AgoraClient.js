import React, { useEffect, useState } from "react";
import AgoraRTC from "./sdk/AgoraRTC_sdk";
import {
    config,
    useClient,
    useMicrophoneAndCameraTracks,
    channelName,
  } from "./settings.js";

const AgoraClient = (props) => {
  const [client, setClient] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    const createClient = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClient.init(config.appId, async () => {
        console.log("AgoraRTC client initialized");
        const uid = await agoraClient.join(null, channelName, null, null);
        console.log("User joined channel with UID:", uid);

        const stream = AgoraRTC.createStream({
          streamID: uid,
          audio: true,
          video: true,
          screen: false,
        });

        setLocalStream(stream);

        stream.init(() => {
          agoraClient.publish(stream);
          console.log("Local stream published");
        });

        setClient(agoraClient);
      }, console.error);
    };

    createClient();

    return () => {
      if (localStream) {
        localStream.close();
      }
      if (client) {
        client.leave(() => {
          console.log("User left channel");
        }, console.error);
        client.unpublish(localStream);
      }
    };
  }, [config.appId, channelName, client, localStream]);

  return 
  <div>
    
  </div>;
};

export default AgoraClient;