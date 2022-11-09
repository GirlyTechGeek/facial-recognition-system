import "./App.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { authToken,meetingsId, createMeeting, fetchHlsDownstreamUrl } from "./Api";
import ReactPlayer from "react-player";
import { Button, Input } from "@chakra-ui/react";

function JoinScreen({ getMeetingAndToken }) {
  const [meetingId, setMeetingId] = useState(null);
  const onClick = async () => {
    await getMeetingAndToken(meetingId);
  };
  return (
    <div>
      <Input
        type="text"
        placeholder="Enter Meeting Id"
        onChange={(e) => {
          setMeetingId(e.target.value);
        }}
      />
      <Button onClick={onClick}>Join1</Button>
      {" or "}
      <Button onClick={onClick}>Create Meeting</Button>
    </div>
  );
}

function HLSJoinScreen({ onDownstreamUrl }) {
  const [meetingId, setMeetingId] = useState(null);

  const handleOnClick = async (meetingId) => {
    const downstreamUrl = await fetchHlsDownstreamUrl({ meetingId });

    onDownstreamUrl(downstreamUrl);
  };

  return (
    <div>
      <Input
        type="text"
        placeholder="Enter Meeting Id"
        onChange={(e) => {
          setMeetingId(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          handleOnClick(meetingId);
        }}
      >
        Join2
      </Button>
    </div>
  );
}

function VideoComponent(props) {
  const micRef = useRef(null);
  const webcamRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn } = useParticipant(
    props.participantId
  );

  const videoStream = useMemo(() => {
    if (webcamOn) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div key={props.participantId}>
      {micOn && micRef && <audio ref={micRef} autoPlay />}
      {webcamOn && (
        <ReactPlayer
          //
          playsinline // very very imp prop
          pip={false}
          light={false}
          controls={true}
          muted={true}
          playing={true}
          //
          url={videoStream}
          //
          height={"180px"}
          width={"320px"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      )}
    </div>
  );
}

function Controls() {
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  return (
    <div>
      <Button onClick={leave}>Leave</Button>
      {/* <Button onClick={toggleMic}>toggleMic</Button> */}
      <Button onClick={toggleWebcam}>toggleWebcam</Button>
    </div>
  );
}

function Container(props) {
  const { participants, join, isMeetingJoined, startHls } = useMeeting({
    onMeetingJoined: () => {
      startHls();
    },
    onHlsStarted: (downstreamUrl) => {},
  });
  return (
    <div className="container">
      <h3>Meeting Id: {props.meetingId}</h3>
      {isMeetingJoined ? (
        <div>
          <Controls />
          {[...participants.keys()].map((participantId) => (
            <VideoComponent key={participantId} participantId={participantId} />
          ))}
        </div>
      ) : (
        <Button onClick={join}>Joined</Button>
      )}
    </div>
  );
}

function MeetingContainer() {
  const [meetingId, setMeetingId] = useState(null);

  const getMeetingAndToken = async (id) => {
    const meetingId =
      id == null ? await createMeeting({ token: authToken }) : id;
    setMeetingId(meetingId);
  };

  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Chintan",
      }}
      token={authToken}
    >
      <Container meetingId={meetingId} />
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} />
  );
}
function HLSPlayer({ url, handleOnLeave }) {
  return (
    <>
      <Button onClick={handleOnLeave}>Leave</Button>
      <ReactPlayer
        playing={true}
        playsinline
        height={"70%"}
        width={"60%"}
        url={url}
      />
    </>
  );
}

function HLSContainer() {
  const [downstreamUrl, setDownstreamUrl] = useState("");

  const isJoined = useMemo(() => !!downstreamUrl, [downstreamUrl]);

  return isJoined ? (
    <HLSPlayer
      url={downstreamUrl}
      handleOnLeave={() => {
        setDownstreamUrl("");
      }}
    />
  ) : (
    <HLSJoinScreen
      onDownstreamUrl={(_downstreamUrl) => {
        setDownstreamUrl(_downstreamUrl);
      }}
    />
  );
}
function Test() {
  const [mode, setMode] = useState("host");

  const isHost = useMemo(() => mode === "host", [mode]);

  useEffect(() => {
    fetchHlsDownstreamUrl({ meetingId: "0g7p-kgnq-spd5" });
  }, []);

const handle = async() => {
  await fetchHlsDownstreamUrl({ roomId: meetingsId }) 
}
  return (
    <>
{/* <Button onClick={handle}>Getting Started</Button> */}
      <Button
        onClick={() => {
          setMode((s) => {
            return s === "host" ? "viewer" : "host";
          });
        }}
      >
        {isHost ? "Join as a Viewer" : "Join as a Host"}
      </Button>
      {isHost ? <MeetingContainer /> : <HLSContainer />}
    </>
  );
}

export default Test;