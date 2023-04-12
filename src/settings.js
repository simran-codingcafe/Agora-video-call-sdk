import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const appId = localStorage.getItem("appId");
const token = localStorage.getItem("token");

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, uid: localStorage.getItem("user_id") };
export const useRTCClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = localStorage.getItem("channelName");
