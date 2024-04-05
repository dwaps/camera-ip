const socket = io();

function requestReloadWindow() {
  socket.emit("reload");
}

socket.on("reload", () => location.reload());

let peerConnection;
const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function setupWebRTC(isCaller) {
  peerConnection = new RTCPeerConnection(config);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("message", {
        type: "new-ice-candidate",
        candidate: event.candidate,
      });
    }
  };

  if (!isCaller) {
    peerConnection.ontrack = (event) => {
      document.getElementById("videoViewer").srcObject = event.streams[0];
    };
  }

  socket.on("message", (message) => {
    switch (message.type) {
      case "offer":
        handleOffer(message.offer, isCaller);
        break;
      case "answer":
        if (!peerConnection) {
          console.error("peerConnection n'est pas initialisé");
          return;
        }
        handleAnswer(message.answer);
        break;
      case "new-ice-candidate":
        handleNewICECandidateMsg(message.candidate);
        break;
    }
  });

  if (isCaller) {
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      ?.then((stream) => {
        document.getElementById("videoElement").srcObject = stream;
        stream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, stream));
        peerConnection.createOffer().then((offer) => {
          peerConnection.setLocalDescription(offer);
          socket.emit("message", { type: "offer", offer: offer });
        });
      })
      ?.catch((error) => console.error("Media error: ", error));
  }
}

function handleOffer(offer, isCaller) {
  if (!isCaller) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    peerConnection
      .createAnswer()
      .then((answer) => {
        peerConnection.setLocalDescription(answer);
        socket.emit("message", { type: "answer", answer });
      })
      .catch((error) => console.error(error));
  }
}

function handleAnswer(answer) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleNewICECandidateMsg(candidate) {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
