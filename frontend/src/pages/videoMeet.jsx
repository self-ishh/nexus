import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
import { Snackbar } from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
// import server from "../environment";

import styles from "../styles/videoMeet.module.css";
import server from "../environment";

const server_url = server;

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  let socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let connectionsRef = useRef({});

  let [error, setError] = useState(false);

  let [snackbarOpen, setSnackbarOpen] = useState(false);

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState(true);

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  let routeTo = useNavigate();

  //block 0

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connectionsRef.current) {
      if (id === socketIdRef.current) continue;
      connectionsRef.current[id].addStream(window.localStream);
      connectionsRef.current[id].createOffer().then((description) => {
        connectionsRef.current[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({
                sdp: connectionsRef.current[id].localDescription,
              })
            );
          })
          .catch((e) => console.log(e));
      });
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  let getDisplayMedia = async () => {
    try {
      if (!navigator.mediaDevices.getDisplayMedia)
        throw new Error("Screen share not supported.");

      if (!screen) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        if (stream) {
          getDisplayMediaSuccess(stream);
          setScreen(true);
        }
      } else {
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => track.stop());
        }
        await getUserMedia();
        setScreen(false);
      }
    } catch (err) {
      console.error("Screen share cancelled or failed:", err);
      setScreen(false);
    }
  };

  // block 1

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (stream) {
        setVideoAvailable(true);
        setAudioAvailable(true);
        console.log("Video & Audio permission granted");

        window.localStream = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
    } catch (err) {
      console.warn(err);

      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoAvailable(true);
      } catch {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioAvailable(true);
      } catch {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  // block 2

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connectionsRef.current) {
      if (id === socketIdRef.current) continue;
      connectionsRef.current[id].addStream(window.localStream);
      connectionsRef.current[id].createOffer().then((description) => {
        console.log(description);
        connectionsRef.current[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({
                sdp: connectionsRef.current[id].localDescription,
              })
            );
          })
          .catch((e) => console.log(e));
      });
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connectionsRef.current) {
            connectionsRef.current[id].addStream(window.localStream);
            connectionsRef.current[id].createOffer().then((description) => {
              connectionsRef.current[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({
                      sdp: connectionsRef.current[id].localDescription,
                    })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  // block 3
  let getUserMedia = async () => {
    try {
      if ((video && videoAvailable) || (audio && audioAvailable)) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: video,
          audio: audio,
        });

        getUserMediaSuccess(stream);
      } else {
        if (localVideoRef.current?.srcObject) {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
      console.log("SET STATE HAS ", video, audio);
    }
  }, [video, audio]);

  // block 4

  let gotMessageFromServer = async (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      try {
        if (signal.sdp) {
          await connectionsRef.current[fromId].setRemoteDescription(
            new RTCSessionDescription(signal.sdp)
          );

          // Apply any ICE candidates that arrived before SDP
          const pending =
            connectionsRef.current[fromId].pendingCandidates || [];
          for (const ice of pending) {
            try {
              await connectionsRef.current[fromId].addIceCandidate(
                new RTCIceCandidate(ice)
              );
            } catch (e) {
              console.log("Deferred ICE Error:", e);
            }
          }
          connectionsRef.current[fromId].pendingCandidates = [];

          if (signal.sdp.type === "offer") {
            const description = await connectionsRef.current[
              fromId
            ].createAnswer();
            await connectionsRef.current[fromId].setLocalDescription(
              description
            );

            socketRef.current.emit(
              "signal",
              fromId,
              JSON.stringify({
                sdp: connectionsRef.current[fromId].localDescription,
              })
            );
          }
        }

        if (signal.ice) {
          const connection = connectionsRef.current[fromId];

          // Prevent ICE error by checking if SDP is ready
          if (connection?.remoteDescription) {
            await connection.addIceCandidate(new RTCIceCandidate(signal.ice));
          } else {
            if (!connection.pendingCandidates)
              connection.pendingCandidates = [];
            connection.pendingCandidates.push(signal.ice);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  // block 5
  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connectionsRef.current[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          // Wait for their ice candidate
          connectionsRef.current[socketListId].onicecandidate = function (
            event
          ) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // wait for their video stream
          connectionsRef.current[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Check if video already exists
              const exists = videos.some((v) => v.socketId === socketListId);
              if (exists) return videos;

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connectionsRef.current[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connectionsRef.current[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connectionsRef.current) {
            if (id2 === socketIdRef.current) continue;

            try {
              connectionsRef.current[id2].addStream(window.localStream);
            } catch (e) {}

            connectionsRef.current[id2].createOffer().then((description) => {
              connectionsRef.current[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({
                      sdp: connectionsRef.current[id2].localDescription,
                    })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    connectToSocketServer();
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  let sendMessage = () => {
    if (message.trim() !== "") {
      socketRef.current.emit("chat-message", message, username || "Guest");
      setMessage("");
    }
  };

  let handleScreen = () => {
    getDisplayMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    if (socketRef.current) socketRef.current.disconnect();
    routeTo("/home");
  };

  const handleCopyLink = () => {
    const meetingLink = window.location.href;
    navigator.clipboard.writeText(meetingLink);
    setSnackbarOpen(true);
  };

  let connect = () => {
    if (username.trim().length === 0) {
      setError(true);
      return;
    }
    setError(false);
    setAskForUsername(false);
    getMedia();
  };

  useEffect(() => {
    const cleanUpConnections = () => {
      // Close every WebRTC connection
      Object.values(connectionsRef.current).forEach((connection) =>
        connection.close()
      );
      connectionsRef.current = {};

      // Stop your local camera/mic
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
        window.localStream = null;
      }

      // Disconnect from socket.io
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      console.log("Cleaned up all connections and sockets.");
    };

    // Call cleanup if user reloads or goes back
    window.addEventListener("beforeunload", cleanUpConnections);

    // React unmount cleanup
    return () => {
      cleanUpConnections();
      window.removeEventListener("beforeunload", cleanUpConnections);
    };
  }, []);

  return (
    <div>
      {askForUsername ? (
        <div className={styles.lobbyContainer}>
          <h2>Enter into Lobby </h2>

          <div className={styles.lobbyInputContainer}>
            <TextField
              id="outlined-basic"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              error={error}
              helperText={error ? " Username is Required" : ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  connect();
                }
              }}
            />

            <Button variant="contained" onClick={connect}>
              Connect
            </Button>

            <IconButton onClick={handleCopyLink} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </div>
          <div className={styles.lobbyVideoContainer}>
            <video
              className={styles.lobbyVideo}
              ref={localVideoRef}
              autoPlay
              muted
            ></video>
          </div>
        </div>
      ) : (
        // Video Meet Container
        <div
          className={`${styles.meetVideosContainer} ${
            showModal ? styles.chatOpen : ""
          }`}
        >
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingMessages}>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      console.log(messages);
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold", color: "#4a2c70" }}>
                            {item.sender}
                          </p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chatInputArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainers}>
            <IconButton
              onClick={handleVideo}
              style={{ color: "white" }}
              disabled={screen || !videoAvailable}
            >
              {videoAvailable ? (
                video === true ? (
                  <VideocamIcon />
                ) : (
                  <VideocamOffIcon />
                )
              ) : (
                <VideocamOffIcon color="disabled" />
              )}
            </IconButton>

            <IconButton
              onClick={handleAudio}
              style={{ color: "white" }}
              disabled={screen}
            >
              {audioAvailable === false ? (
                <MicOffIcon />
              ) : audio === true ? (
                <MicIcon />
              ) : (
                <MicOffIcon color="disabled" />
              )}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <StopScreenShareIcon />
                ) : (
                  <ScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton
                onClick={() => {
                  setModal((prev) => !prev);
                  if (!showModal) setNewMessages(0);
                }}
                style={{ color: "white" }}
              >
                <ChatIcon />{" "}
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.localVideo}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>

          <div className={styles.conferenceView}>
            {videos.map((videoObj) => (
              <div key={videoObj.socketId}>
                <video
                  data-socket={videoObj.socketId}
                  ref={(ref) => {
                    if (ref && videoObj.stream) {
                      ref.srcObject = videoObj.stream;
                    }
                  }}
                  autoPlay
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Meeting link copied!"
      />
    </div>
  );
}
