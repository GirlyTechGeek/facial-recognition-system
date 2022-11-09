import { Alert, AlertIcon, Button, CloseButton, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import emailjs from 'emailjs-com';
import {
    MeetingProvider,
    MeetingConsumer,
    useMeeting,
    useParticipant,
} from "@videosdk.live/react-sdk";
import { authToken, createMeeting, fetchHlsDownstreamUrl } from "./Api";
import ReactPlayer from "react-player";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router";

function JoinScreen({ getMeetingAndToken }) {
    const [meetingId, setMeetingId] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, isloading] = useState(false);
    const [play, setPlay] = useState(false);
    const [visible, isVisible] = useState(false);
    const navigate = useNavigate();
    const onClick = async () => {
        isloading(true)
        await getMeetingAndToken(meetingId).then();
        setMeetingId(meetingId)
    };
    const showLogin = () => {
        navigate('/')
    }
    useEffect(() => {
        onOpen();
    })

    return (
        <div className="backdrop">
            <Modal blockScrollOnMount={true} closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay
                    bg='blackAlpha.400'
                    backdropFilter='blur(10px)'

                />
                <ModalContent>
                    <ModalBody>
                        <Text fontWeight='bold' mb='1rem'>
                            Once the button is clicked you would be instantly recorded.
                        </Text>
                        <Text>
                            All examination mulpractice events hold in this system and will be recorded with an image attached to a livestream and timestamp. Make sure your camera and microphone work before clicking the button.
                        </Text>
                        <Text>
                            All the best!
                        </Text>

                    </ModalBody>

                    <ModalFooter>
                        <Button style={{ 'width': '50%' }} colorScheme='blue' onClick={onClick} disabled={loading}>{loading ? 'Connecting...' : 'Start'}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

function VideoComponent(props) {
    const webcamRef = useRef(null);
    const micRef = useRef(null);
    const [play, setPlay] = useState(false);
    const [visible, isVisible] = useState(false);
    const navigate = useNavigate();
    const { toggleWebcam } = useMeeting();
    const { webcamStream, micStream, webcamOn, micOn } = useParticipant(
        props.participantId
    );
    const videoRef = useRef();
    const canvasRef = useRef();
    const form = useRef();
    const templateParams = {
        from_name: "Anna sent testing"

    };
    const sendEmail = () => {
        // emailjs.sendForm('service_3gs0pr5', 'template_e6asvdf', form.current, 'user_kCMlH3on6bQ53ovKUpoX6')
        emailjs.sendForm('service_ync03is', 'template_6m6h8cl', form.current, '48eO22ziAQe2BKxJT')

            .then((result) => {
                console.log(result.text);
            }, (error) => {
                console.log(error.text);
            });
    };
    const startVideo = () => {
        setPlay(true);
        videoRef && loadModels();
        // onClick();
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                videoRef.current.srcObject = currentStream;
            })
            .catch((err) => {
                console.error(err)
            });
        // onClose()
    }
    const loadModels = () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]).then(() => {
            return faceDetection();
        })
    };
    const videoStream = useMemo(() => {
        if (webcamOn) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(webcamStream.track);
            startVideo()
            return mediaStream;
        }
    }, [webcamStream, webcamOn]);
    console.log(typeof (videoStream))
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

    useEffect(() => {

        // setInterval(() => {
        startVideo();
        // }, 5000);
        setTimeout(() => {
            isVisible(true)
        }, 6000);

        const timer = setTimeout(() => {
            Swal.fire({
                text: 'You have used up all the time. Session submitted successfully',
                icon: 'info',
                allowOutsideClick: false,
                confirmButtonText: 'OKAY'
            }).then(function () {
                window.location.reload();
                navigate('/');
                localStorage.setItem('written', 'yes')
            })
        }, 12000);
        return () => clearTimeout(timer)


    }, [])
    const faceDetection = async () => {
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            console.log(detections)
            if (detections.length === 2) {
                setImmediate(console.log('error1'))
                console.log('error')
            }
            if (detections.length === 0) {
                console.log('no face detected');
               const timer = setTimeout(() => {
                    sendEmail()
                }, 5000);
                return clearTimeout(timer)

            }

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
    return (
        <div key={props.participantId}>
            <audio ref={micRef} autoPlay />
            {webcamOn && (
                <div>
                    {visible ?
                        <Alert status="warning" variant='top-accent'>
                            <AlertIcon />
                            You have 1 minute left

                        </Alert> : null}

                    {/* <Button >show</Button> */}
                    <ReactPlayer style={{ 'display': 'none' }} 
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
                        height={"650px"}
                        width={"940px"}
                        onError={(err) => {
                            console.log(err, "participant video error");
                        }}
                    />

                    <div>

                        <form ref={form} ></form>
                        <div className='app__video' style={{ 'display': 'none' }} >
                            <video crossOrigin='anonymous' ref={videoRef} autoPlay ></video>
                        </div>
                        <canvas style={{ 'display': 'none' }}  ref={canvasRef} width="940" height="650" className='app__canvas' />
                    </div>

                    {/* < canvas ref={canvasRef} width="190" height="300" className='app__canvas' /> */}

                    {/* <video
                        crossOrigin='anonymous'
                        autoPlay
                        ref={videoStream}
                        height={"190px"}
                        width={"600px"}
                    onError={(err) => {
                      console.log(err, "participant video error");
                    }}
                    /> */}
                </div>
            )}
        </div>
    );
}

function Controls() {
    const { leave, toggleMic, toggleWebcam } = useMeeting();
    return (
        <div>
            {/* <Button onClick={leave}>Leave</Button> */}
            {/* <Button onClick={toggleMic}>toggleMic</Button>
            <Button onClick={toggleWebcam}>toggleWebcam</Button> */}
        </div>
    );
}

function Container(props) {
    // const [joined, setJoined] = useState(false);
    const { participants, join, isMeetingJoined, startHls } = useMeeting({
        onMeetingJoined: () => {
            startHls();
        },
        onHlsStarted: (downstreamUrl) => { },
    });
    console.log(props.meetingId)
    localStorage.setItem('id', props.meetingId);
    // console.log(ID)
    const [loading, isloading] = useState(false);
    const [meetingId, setMeetingId] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [play, setPlay] = useState(false);

    useEffect(() => {
        const ID = localStorage.getItem('id');
        console.log(ID)
        setMeetingId(ID)


    })
    const ID = localStorage.getItem('id');
    const onClick = async (meetingId) => {
        join();
        isloading(true)

        // setInterval( async() => {
        //     await fetchHlsDownstreamUrl({meetingId})
        //    }, 10000);
    }



    return (
        <div className="container">
            {isMeetingJoined ? (
                <div>
                    <Controls />
                    {[...participants.keys()].map((participantId) => (
                        <VideoComponent key={participantId} participantId={participantId} />
                    ))}
                    {/* <Button onClick={() => {onClick1( meetingId);}}>ok test</Button> */}
                    <div style={{ 'display': 'none' }}>
                        <  HLSContainer />

                    </div>

                </div>
            ) : (
                // second join
                <div className="backdrop">
                    {/* <p>Basic instructions and mulpractice events</p> */}
                    
                    <Button className="center-start" style={{ 'height': '60px', 'width': '30%' }} colorScheme='blue' variant="solid" size='lg' disabled={loading} onClick={() => { onClick(meetingId); }}>{loading ? ' Please wait...' : 'Start Exam '}!</Button>
                </div>
            )}
        </div>
    );
}
function HLSJoinScreen({ onDownstreamUrl }) {
    const [meetingId, setMeetingId] = useState(null);

    const handleOnClick = async (meetingId) => {
        const downstreamUrl = await fetchHlsDownstreamUrl({ meetingId });

        onDownstreamUrl(downstreamUrl);
    };
    useEffect(() => {
        const ID = localStorage.getItem('id');
        console.log(ID)
        setMeetingId(ID)
    })
    return (
        <div>

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
function Exam() {
    const videoRef = useRef();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [play, setPlay] = useState(false);
    const [meetingId, setMeetingId] = useState(null);

    const getMeetingAndToken = async (id) => {
        const meetingId =
            id == null ? await createMeeting({ token: authToken }) : id;
        setMeetingId(meetingId);

    };
    console.log(typeof (videoRef))
    return (
        <div className="app">

            {authToken && meetingId ?
                <MeetingProvider
                    config={{
                        meetingId,
                        micEnabled: false,
                        webcamEnabled: true,
                        name: "Raman",
                    }}
                    token={authToken}
                >
                    <MeetingConsumer>
                        {() =>
                            <Container meetingId={meetingId} />
                        }
                    </MeetingConsumer>
                </MeetingProvider>
                :
                <>
                    <JoinScreen getMeetingAndToken={getMeetingAndToken} />

                </>

            }
        </div>
    );

    // }

}

export default Exam;