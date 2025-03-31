import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { count } from '../../utils/music';
import Instructions from '../../components/Instrctions/Instructions';
import DropDown from '../../components/DropDown/DropDown';
import { POINTS, keypointConnections } from '../../utils/data';
import { drawPoint, drawSegment } from '../../utils/helper';
import Navbar from '../../components/NavBar';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

import './Yoga.css'

let skeletonColor = 'rgb(255,255,255)';
let poseList = [
    'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
    'Shoulderstand'
];

let interval;
let flag = false;

function Yoga() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const [startingTime, setStartingTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [poseTime, setPoseTime] = useState(0);
    const [bestPerform, setBestPerform] = useState(0);
    const [currentPose, setCurrentPose] = useState('Tree');
    const [isStartPose, setIsStartPose] = useState(false);

    useEffect(() => {
        const timeDiff = (currentTime - startingTime) / 1000;
        if (flag) {
            setPoseTime(timeDiff);
        }
        if ((currentTime - startingTime) / 1000 > bestPerform) {
            setBestPerform(timeDiff);
        }
    }, [currentTime]);

    useEffect(() => {
        setCurrentTime(0);
        setPoseTime(0);
        setBestPerform(0);
    }, [currentPose]);

    const CLASS_NO = {
        Chair: 0,
        Cobra: 1,
        Dog: 2,
        No_Pose: 3,
        Shoulderstand: 4,
        Triangle: 5,
        Tree: 6,
        Warrior: 7,
    };

    function get_center_point(landmarks, left_bodypart, right_bodypart) {
        let left = tf.gather(landmarks, left_bodypart, 1);
        let right = tf.gather(landmarks, right_bodypart, 1);
        const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
        return center;
    }

    function get_pose_size(landmarks, torso_size_multiplier = 2.5) {
        let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
        let shoulders_center = get_center_point(landmarks, POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER);
        let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
        let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
        pose_center_new = tf.expandDims(pose_center_new, 1);
        pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2]);
        let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
        let max_dist = tf.max(tf.norm(d, 'euclidean', 0));
        let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist);
        return pose_size;
    }

    function normalize_pose_landmarks(landmarks) {
        let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP);
        pose_center = tf.expandDims(pose_center, 1);
        pose_center = tf.broadcastTo(pose_center, [1, 17, 2]);
        landmarks = tf.sub(landmarks, pose_center);

        let pose_size = get_pose_size(landmarks);
        landmarks = tf.div(landmarks, pose_size);
        return landmarks;
    }

    function landmarks_to_embedding(landmarks) {
        landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0));
        let embedding = tf.reshape(landmarks, [1, 34]);
        return embedding;
    }

    const runMovenet = async () => {
        await tf.ready();  // Ensure tf is ready
        await tf.setBackend('webgl');  // Set the backend to 'webgl'
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        const poseClassifier = await tf.loadLayersModel(process.env.REACT_APP_MODEL_URL);
        const countAudio = new Audio(count);
        countAudio.loop = true;
        interval = setInterval(() => {
            detectPose(detector, poseClassifier, countAudio);
        }, 100);
    }


    const detectPose = async (detector, poseClassifier, countAudio) => {
        const SHIFT_X_VALUE = 48; // Adjust this value to shift the landmarks left
        const SHIFT_Y_VALUE = 46; // Adjust this value to shift the landmarks up

        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            let notDetected = 0;
            const video = webcamRef.current.video;
            const pose = await detector.estimatePoses(video);
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            try {
                const keypoints = pose[0].keypoints;
                let input = keypoints.map((keypoint) => {
                    if (keypoint.score > 0.4) {
                        if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
                            const adjustedX = keypoint.x - SHIFT_X_VALUE;
                            const adjustedY = keypoint.y - SHIFT_Y_VALUE;
                            drawPoint(ctx, adjustedX, adjustedY, 8, 'rgb(255,255,255)');
                            let connections = keypointConnections[keypoint.name];
                            try {
                                connections.forEach((connection) => {
                                    let conName = connection.toUpperCase();
                                    drawSegment(ctx, [adjustedX, adjustedY],
                                        [keypoints[POINTS[conName]].x - SHIFT_X_VALUE,
                                        keypoints[POINTS[conName]].y - SHIFT_Y_VALUE],
                                        skeletonColor);
                                });
                            } catch (err) { }
                        }
                    } else {
                        notDetected += 1;
                    }
                    return [keypoint.x - SHIFT_X_VALUE, keypoint.y - SHIFT_Y_VALUE];
                });
                if (notDetected > 4) {
                    skeletonColor = 'rgb(255,255,255)';
                    return;
                }
                const processedInput = landmarks_to_embedding(input);
                const classification = poseClassifier.predict(processedInput);

                classification.array().then((data) => {
                    const classNo = CLASS_NO[currentPose];
                    console.log(data[0][classNo]);
                    if (data[0][classNo] > 0.97) {
                        if (!flag) {
                            countAudio.play();
                            setStartingTime(new Date().getTime());
                            flag = true;
                        }
                        setCurrentTime(new Date().getTime());
                        skeletonColor = 'rgb(0,255,0)';
                    } else {
                        flag = false;
                        skeletonColor = 'rgb(255,255,255)';
                        countAudio.pause();
                        countAudio.currentTime = 0;
                    }
                });
            } catch (err) {
                console.log(err);
            }
        }
    }


    function startYoga() {
        setIsStartPose(true);
        runMovenet();
    }
    const { user } = useUser();
    function stopPose() {
        setIsStartPose(false);
        clearInterval(interval);
        console.log(currentPose)
        // Save the best performance time to the backend
        const clerkUserId = user.id; // Get the user's Clerk ID
        console.log(clerkUserId)
        axios.post('https://poyo-prj-backend.onrender.com/api/update-best-time', {
            clerkUserId,
            bestPoseTime: bestPerform,
            pose_name: currentPose
        })
            .then(response => {
                console.log(response.data.message);
            })
            .catch(error => {
                console.error('Error updating cumulative pose time:', error);
            });
        axios.post('https://poyo-prj-backend.onrender.com/api/update-performance', {
            clerkUserId,
            bestTime: bestPerform,
            pose_name: currentPose
        }).then(response => {
            console.log(response.data.message);
        })
            .catch(error => {
                console.error('Error updating performance:', error);
            });
    }

    const poseVideoUrls = {
        Tree: "https://www.youtube.com/embed/Fr5kiIygm0c?autoplay=1&loop=1&playlist=Fr5kiIygm0c&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3",
        Chair: "https://www.youtube.com/embed/tEZhXr0FuAQ?autoplay=1&loop=1&playlist=tEZhXr0FuAQ&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3",
        Cobra: "https://www.youtube.com/embed/pVmOOluGAv8?autoplay=1&loop=1&playlist=pVmOOluGAv8&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3",
        Warrior: "https://www.youtube.com/embed/Mn6RSIRCV3w?autoplay=1&loop=1&playlist=Mn6RSIRCV3w&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3",
        Dog: "https://www.youtube.com/embed/EC7RGJ975iM?autoplay=1&loop=1&playlist=EC7RGJ975iM&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3",
        Shoulderstand: "https://www.youtube.com/embed/UjHTOW9x3WM?autoplay=1&loop=1&playlist=UjHTOW9x3WM&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3",
        Triangle: "https://www.youtube.com/embed/S6gB0QHbWFE?autoplay=1&loop=1&playlist=S6gB0QHbWFE&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3"
    };

    if (isStartPose) {
        return (
            <div>
                <Navbar />
                <div className='py-12'>
                    <div className="flex justify-center items-center">
                        <img src="/images/live.svg" width="300" height="100" className="flex justify-center items-center py-4" />
                    </div>
                </div>
                <div className="min-w-full min-h-screen">
                    <div className="flex flex-row-reverse">
                        <Webcam
                            width='540px'
                            height='380px'
                            id="webcam"
                            ref={webcamRef}
                            className="border-2 border-green-500"
                        />

                        <canvas
                            ref={canvasRef}
                            id="my-canvas"
                            width='540px'
                            height='380px'
                            className="absolute"
                        />

                        <div>
                            <iframe
                                width="450"
                                height="253"
                                src={poseVideoUrls[currentPose]}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                className="absolute left-32 top-56">
                            </iframe>

                            <div className="flex justify-center item-center absolute left-40 py-96">
                                <div>
                                    <h1>Pose Time: {poseTime} s</h1>
                                </div>
                                <div className="ml-8">
                                    <h1>Your Best: {bestPerform} s</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={stopPose}
                        className="bg-[red] hover:bg-[#966A61] text-white font-bold py-2 px-4 rounded absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    >Stop Pose</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className='py-10'>
                <DropDown
                    poseList={poseList}
                    currentPose={currentPose}
                    setCurrentPose={setCurrentPose}
                />
                <Instructions
                    currentPose={currentPose}
                />
                <button
                    onClick={startYoga}
                    className="bg-[#3A5A40] hover:bg-[#242F2A] text-white font-bold py-2 px-4 rounded absolute bottom-10 left-1/2 transform -translate-x-1/2"
                >Start Pose</button>
            </div>
        </div>
    );
}

export default Yoga;