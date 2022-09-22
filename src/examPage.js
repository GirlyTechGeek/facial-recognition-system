import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import Webcam from 'react-webcam';
import {
    MeetingProvider,
    MeetingConsumer,
    useMeeting,
    useParticipant,
} from "@videosdk.live/react-sdk";
import { authToken, createMeeting } from "./Api";
import ReactPlayer from "react-player";


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
            <Button onClick={onClick}>Join</Button>
            {" or "}
            <Button onClick={onClick}>Create Meeting</Button>
        </div>
    );
}

function VideoComponent(props) {
    const webcamRef = useRef(null);
    const micRef = useRef(null);
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
            height={"190px"}
            width={"300px"}
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
            <Button onClick={toggleMic}>toggleMic</Button>
            <Button onClick={toggleWebcam}>toggleWebcam</Button>
        </div>
    );
}

function Container(props) {
    const [joined, setJoined] = useState(false);
    const { join } = useMeeting();
    const { participants } = useMeeting();
    const joinMeeting = () => {
        setJoined(true);
        join();
    };

    return (
        <div className="container">
            <h3>Meeting Id: {props.meetingId}</h3>
            {joined ? (
                <div key={participants}>
                    <Controls  />
                    {[...participants.keys()].map((participantId) => (
                        <VideoComponent participantId={participantId} />
                    ))}
                </div>
            ) : (
                <Button onClick={joinMeeting}>Join</Button>
            )}
        </div>
    );
}

function ExamPage() {
    const videoRef = useRef();
    const canvasRef = useRef();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [play, setPlay] = useState(false);
    const height = 500;
    const weight = 500;
    const [meetingId, setMeetingId] = useState(null);

    const getMeetingAndToken = async (id) => {
        const meetingId =
            id == null ? await createMeeting({ token: authToken }) : id;
        setMeetingId(meetingId);
    };

    useEffect(() => {
        onOpen();
        // startVideo();

        videoRef && loadModels();
    }, []);
    const loadModels = () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]).then(() => {
            faceDetection();
        })
    };

    const startVideo = () => {
        setPlay(true)
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                videoRef.current.srcObject = currentStream;
            })
            .catch((err) => {
                console.error(err)
            });
    }
    const faceDetection = async () => {
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            console.log(detections)
            if (detections.length == 2) {
                console.log('error')
            }
            if (detections.length == 0) {
                console.log('no face detected')
            }
            //  else {
            //     console.log('two')
            // }
            canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);
            faceapi.matchDimensions(canvasRef.current, {
                width: 940,
                height: 650,
            })

            const resized = faceapi.resizeResults(detections, {
                width: 940,
                height: 650,
            });

            faceapi.draw.drawDetections(canvasRef.current, resized)
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
            faceapi.draw.drawFaceExpressions(canvasRef.current, resized)

        }, 1000)
    }

    // render(){
    return (
        <div className="app">
            <Modal blockScrollOnMount={true} closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontWeight='bold' mb='1rem'>
                            Once the button is clicked you would be instantly recorded.
                        </Text>
                        {/* <Lorem count={2} /> */}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='ghost' onClick={startVideo}>Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* style={{'display':'none'}} */}
            <div className='app__video'  >
                <video crossOrigin='anonymous' ref={videoRef} autoPlay ></video>
            </div>
            <canvas  ref={canvasRef} width="940" height="650" className='app__canvas' />
            {authToken && meetingId ?
                <MeetingProvider
                    config={{
                        meetingId,
                        micEnabled: false,
                        webcamEnabled: false,
                        name: "C.V. Raman",
                    }}
                    token={authToken}
                >
                    <MeetingConsumer>
                        {() => <Container meetingId={meetingId} />}
                    </MeetingConsumer>
                </MeetingProvider>
                :
                <JoinScreen getMeetingAndToken={getMeetingAndToken} />
            }

            {/* <video
                height={height}
                width={weight}
                autoPlay
                muted
                className="vid"
            ></video> */}
        </div>
    );

    // }

}

export default ExamPage;