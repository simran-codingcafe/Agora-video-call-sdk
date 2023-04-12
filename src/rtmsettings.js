import { createChannel, createClient } from 'agora-rtm-react'

let appId = localStorage.getItem("rtm_appId");
let channel = localStorage.getItem("channelName");

let useRtmClient, useRtmChannel;

if (appId) {
  useRtmClient = createClient(appId);
  useRtmChannel = createChannel(channel);
} else {
  console.error("App ID not found");
}

export { useRtmClient, useRtmChannel };
