import { Alert, AlertIcon, Button, CloseButton, FormControl, FormHelperText, FormLabel, HStack, ListItem, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, OrderedList, Radio, RadioGroup, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import emailjs from 'emailjs-com';
import axios from 'axios';
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
import { async } from "q";

function JoinScreen({ getMeetingAndToken }) {
    const [meetingId, setMeetingId] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, isloading] = useState(false);
    const [play, setPlay] = useState(false);
    const [visible, isVisible] = useState(false);
    const navigate = useNavigate();
    const onClick = async () => {
        // if (localStorage.getItem('written') == 'yes') {
        //     isVisible(true)
        //     onClose()
        // Swal.fire({
        //     text: 'You have already taken this exam ',
        //     icon: 'error',
        //     allowOutsideClick: false,
        //     confirmButtonText: 'OKAY'
        // }).then(function () {
        //         window.location.reload();
        //          navigate('/');

        //   })
        // } else {
        isloading(true)
        await getMeetingAndToken(meetingId).then();
        setMeetingId(meetingId)
        // }

        // localStorage.setItem('id', meetingId);
        //  setMeetingId(localStorage.getItem('id'))
    };
    const showLogin = () => {
        navigate('/')
    }
    useEffect(() => {

        // if(localStorage.getItem('written') !== 'yes'){
        onOpen();
        // } else{
        //      Swal.fire({
        //         text: 'You have already taken this exam ',
        //         icon: 'error',
        //         allowOutsideClick: false,
        //         confirmButtonText: 'OKAY'
        //     }).then(function () {
        //             window.location.reload();
        //              navigate('/');

        //       })
        // }
        // getMeetingAndToken(meetingId);
        // localStorage.setItem('id', meetingId)
    })


    // const startVideo = () => {
    //     setPlay(true);
    //     onClick();
    //     navigator.mediaDevices.getUserMedia({ video: true })
    //         .then((currentStream) => {
    //             videoRef.current.srcObject = currentStream;
    //         })
    //         .catch((err) => {
    //             console.error(err)
    //         });
    //     onClose()
    // }
    // useEffect(() => {
    //     onOpen();


    //     videoRef && loadModels();
    // }, []);
    // const loadModels = () => {
    //     Promise.all([
    //         faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    //         faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    //         faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    //         faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    //     ]).then(() => {
    //         faceDetection();
    //     })
    // };

    // const faceDetection = async () => {
    //     setInterval(async () => {
    //         const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    //         console.log(detections)
    //         if (detections.length == 2) {
    //             console.log('error')
    //         }
    //         if (detections.length == 0) {
    //             console.log('no face detected')
    //         }

    //         canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);
    //         faceapi.matchDimensions(canvasRef.current, {
    //             width: 940,
    //             height: 650,
    //         })

    //         const resized = faceapi.resizeResults(detections, {
    //             width: 940,
    //             height: 650,
    //         });

    //         faceapi.draw.drawDetections(canvasRef.current, resized)
    //         faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
    //         faceapi.draw.drawFaceExpressions(canvasRef.current, resized)

    //     }, 1000)
    // }
    return (
        <div className="backdrop">
            {/* <img src="../assets/dwn.jpeg" style={{ 'width': '100%', "height": '100vh' }} /> */}
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
                {/* :
                    <ModalContent>
                        <ModalBody>
                            <Text fontWeight='bold' mb='1rem'>
                                You have already taken this exam. You will be redirected to the login page
                            </Text>


                        </ModalBody>

                        <ModalFooter>
                            <Button style={{ 'width': '50%' }} colorScheme='blue' onClick={onClick} >Okay</Button>
                        </ModalFooter>
                    </ModalContent>
                } */}
            </Modal>
        </div>
    );
}

function VideoComponent(props) {
    const webcamRef = useRef(null);
    const micRef = useRef(null);
    const [play, setPlay] = useState(false);
    const [loading, isLoading] = useState(false);
    const [visible, isVisible] = useState(false);
    const navigate = useNavigate();
    const { toggleWebcam } = useMeeting();
    const endpoint = "http://localhost:8888/smart_exam_api/v1/controller"
    const { webcamStream, micStream, webcamOn, micOn } = useParticipant(
        props.participantId
    );
    const videoRef = useRef();
    const canvasRef = useRef();
    const form = useRef();
    const templateParams = {
        from_name: "Anna sent testing"

    };
    const showFirstAlert = () =>{
        Swal.fire({
            text: 'Are you sure you want to submit this work?. You will not be able to review after you click this button',
            icon:'warning',
            allowOutsideClick: false,
            confirmButtonText: 'SUBMIT'
        }).then(function(){
            updateRecord()
        })
    }
   const updateRecord = async () =>{
    isLoading(true)
    const newId = localStorage.getItem('ID')
    const newFile = ({
        idNumber: newId,
        grade: 7,
      })
    const url = `${endpoint}/grade.php`;
    await axios.post(url, newFile).then(async (response) => {
        Swal.fire({
            text: 'Submitted',
            icon: 'success',
            allowOutsideClick: false,
            confirmButtonText: 'OKAY'
          }).then(async function(){
            window.location.reload();
                  await  navigate('/');
          })
    }, err => {
       Swal.fire({
            text: 'Oops! Unable to submit records',
            icon: 'error',
            allowOutsideClick: false,
            confirmButtonText: 'OKAY'
          }).then(async function(){
           window.location.reload();
                    navigate('/');
          })
    })
    }
    const sendEmail = () => {
        const newId = localStorage.getItem('ID')
        const timing = new Date()
        const templateParams = {
            event: 'Two faces detected', student: newId, time_stamp: timing


        };
        // emailjs.sendForm('service_3gs0pr5', 'template_e6asvdf', form.current, 'user_kCMlH3on6bQ53ovKUpoX6')
        emailjs.send('service_ync03is', 'template_6m6h8cl', templateParams, '48eO22ziAQe2BKxJT')

            .then((result) => {
                console.log(result.text);
            }, (error) => {
                console.log(error.text);
            });
    };
    const sendEmail1 = () => {
        const newId = localStorage.getItem('ID')
        const timing = new Date()
        const templateParams = {
            event: 'Unable to detect face', student: newId, time_stamp: timing


        };
        // emailjs.sendForm('service_3gs0pr5', 'template_e6asvdf', form.current, 'user_kCMlH3on6bQ53ovKUpoX6')
        emailjs.send('service_ync03is', 'template_inb1v1u', templateParams, '48eO22ziAQe2BKxJT')

            .then((result) => {
                console.log(result.text);
            }, (error) => {
                console.log(error.text);
            });
    };
    // setTimeout(() => {
    //     Swal.fire({
    //         text: 'You have used up all the time. Session submitted successfully',
    //         icon: 'info',
    //         allowOutsideClick: false,
    //         confirmButtonText: 'OKAY'
    //     }).then(function () {
    //             window.location.reload();
    //              navigate('/')
    //       })
    // }, 6000);
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
    // useEffect(() => {
    //     if (webcamRef.current) {
    //       if (webcamOn) {
    //         const mediaStream = new MediaStream();
    //         mediaStream.addTrack(webcamStream.track);

    //         webcamRef.current.srcObject = mediaStream;
    //         webcamRef.current
    //           .play()
    //           .catch((error) =>
    //             console.error("videoElem.current.play() failed", error)
    //           );
    //       } else {
    //         webcamRef.current.srcObject = null;
    //       }
    //     }
    //   }, [webcamStream, webcamOn]);
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
        // setTimeout(() => {
        //     isVisible(true)
        // }, 6000);

        // const timer = setTimeout(() => {
        //     Swal.fire({
        //         text: 'You have used up all the time. Session submitted successfully',
        //         icon: 'info',
        //         allowOutsideClick: false,
        //         confirmButtonText: 'OKAY'
        //     }).then(function () {
        //         window.location.reload();
        //         navigate('/');
        //         localStorage.setItem('written', 'yes')
        //     })
        // }, 36000);
        // return () => clearTimeout(timer)


    }, [])
    const faceDetection = async () => {
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            console.log(detections)
            if (detections.length === 2) {
                setImmediate(console.log('error1'))
                console.log('error')
                // sendEmail()
            }
            if (detections.length === 0) {
                console.log('no face detected');
                //    setInterval(() => {
                // sendEmail1()
                // }, 5000);


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
                    <div>
                        <form >
                        <FormControl as='fieldset'>
                            <OrderedList>
                                <ListItem>
                                What is 1 + 1
                                    <RadioGroup >
                                        <Stack>
                                            <Radio value='2'>2</Radio>
                                            <Radio value='3'>3</Radio>
                                            <Radio value='1'>1</Radio>
                                            <Radio value='5'>5</Radio>
                                        </Stack>
                                    </RadioGroup>
                                </ListItem>
                                <ListItem>
                                What is 6 x 6
                                    <RadioGroup defaultValue='Itachi'>
                                        <Stack>
                                            <Radio value='42'>42</Radio>
                                            <Radio value='36'>36</Radio>
                                            <Radio value='54'>54</Radio>
                                            <Radio value='66'>66</Radio>
                                        </Stack>
                                    </RadioGroup>
                                </ListItem>
                                <ListItem>
                                What is the capital of Ghana?
                                    <RadioGroup >
                                        <Stack>
                                            <Radio value='Kumasi'>Kumasi</Radio>
                                            <Radio value='Accra'>Accra</Radio>
                                            <Radio value='Takoradi'>Takoradi</Radio>
                                            <Radio value='SSavana'>Savana</Radio>
                                        </Stack>
                                    </RadioGroup>
                                </ListItem>
                            </OrderedList>
                        </FormControl>
                        <Button style={{'marginTop':'10px'}} colorScheme='blue' onClick={showFirstAlert} variant="solid" size='lg' disabled={loading}>{loading? 'Please Wait... ': 'FINISH'}</Button>
                        </form>
                    </div>
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

                    <div style={{ 'display': 'none' }}>
                        <form ref={form} ></form>
                        <div className='app__video'  >
                            <video crossOrigin='anonymous' ref={videoRef} autoPlay ></video>
                        </div>
                        <canvas ref={canvasRef} width="940" height="650" className='app__canvas' />
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
                <div>
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
function ExamPage() {
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

export default ExamPage;