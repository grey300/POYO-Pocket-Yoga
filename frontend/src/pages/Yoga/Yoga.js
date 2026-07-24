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
import apiClient from '../../utils/api';

import './Yoga.css';

const SKELETON_IDLE = 'rgba(255,255,255,0.85)';
const SKELETON_OK = '#3B8CFF';

let skeletonColor = SKELETON_IDLE;
let poseList = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand'];

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
    const [isHolding, setIsHolding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const timeDiff = (currentTime - startingTime) / 1000;
        if (flag) {
            setPoseTime(timeDiff);
        }
        if ((currentTime - startingTime) / 1000 > bestPerform) {
            setBestPerform(timeDiff);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await tf.ready();
        await tf.setBackend('webgl');
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        const poseClassifier = await tf.loadLayersModel(process.env.REACT_APP_MODEL_URL);
        const countAudio = new Audio(count);
        countAudio.loop = true;
        interval = setInterval(() => {
            detectPose(detector, poseClassifier, countAudio);
        }, 100);
    };

    const detectPose = async (detector, poseClassifier, countAudio) => {
        if (
            typeof webcamRef.current === 'undefined' ||
            webcamRef.current === null ||
            webcamRef.current.video.readyState !== 4 ||
            canvasRef.current === null
        ) {
            return;
        }

        let notDetected = 0;
        const video = webcamRef.current.video;

        // Keep the canvas in the SAME coordinate space as the video so keypoints
        // (which MoveNet reports in the video's intrinsic resolution) line up
        // exactly. CSS stretches both identically, so no manual offsets needed.
        const { videoWidth, videoHeight } = video;
        if (canvasRef.current.width !== videoWidth || canvasRef.current.height !== videoHeight) {
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
        }

        const pose = await detector.estimatePoses(video);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, videoWidth, videoHeight);

        try {
            const keypoints = pose[0].keypoints;

            // Scale the skeleton with the video so it looks right at any resolution.
            const scale = Math.max(1, videoWidth / 640);

            const input = keypoints.map((keypoint) => {
                if (keypoint.score > 0.4) {
                    if (!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
                        drawPoint(ctx, keypoint.x, keypoint.y, 6 * scale, '#EAF3FF');
                        const connections = keypointConnections[keypoint.name];
                        try {
                            connections.forEach((connection) => {
                                const conName = connection.toUpperCase();
                                drawSegment(
                                    ctx,
                                    [keypoint.x, keypoint.y],
                                    [keypoints[POINTS[conName]].x, keypoints[POINTS[conName]].y],
                                    skeletonColor,
                                    5 * scale
                                );
                            });
                        } catch (err) { }
                    }
                } else {
                    notDetected += 1;
                }
                return [keypoint.x, keypoint.y];
            });

            if (notDetected > 4) {
                skeletonColor = SKELETON_IDLE;
                return;
            }

            const processedInput = landmarks_to_embedding(input);
            const classification = poseClassifier.predict(processedInput);

            classification.array().then((data) => {
                const classNo = CLASS_NO[currentPose];
                if (data[0][classNo] > 0.97) {
                    if (!flag) {
                        countAudio.play();
                        setStartingTime(new Date().getTime());
                        flag = true;
                        setIsHolding(true);
                    }
                    setCurrentTime(new Date().getTime());
                    skeletonColor = SKELETON_OK;
                } else {
                    if (flag) setIsHolding(false);
                    flag = false;
                    skeletonColor = SKELETON_IDLE;
                    countAudio.pause();
                    countAudio.currentTime = 0;
                }
            });
        } catch (err) {
            /* no pose in frame */
        }
    };

    function startYoga() {
        setSummary(null);
        setIsStartPose(true);
        runMovenet();
    }

    async function stopPose() {
        setIsStartPose(false);
        setIsHolding(false);
        clearInterval(interval);
        flag = false;
        skeletonColor = SKELETON_IDLE;

        const held = Number(bestPerform.toFixed(1));
        if (held <= 0) {
            setSummary({ held: 0, streak: null });
            return;
        }

        setSaving(true);
        try {
            const { data } = await apiClient.post('/api/update-best-time', {
                bestPoseTime: held,
                pose_name: currentPose,
            });
            apiClient
                .post('/api/update-performance', { bestTime: held, pose_name: currentPose })
                .catch(() => { });
            setSummary({ held, streak: data.streak || null });
        } catch (error) {
            setSummary({ held, streak: null, error: 'Could not save this session.' });
        } finally {
            setSaving(false);
        }
    }

    const poseVideoUrls = {
        Tree: 'https://www.youtube.com/embed/Fr5kiIygm0c?autoplay=1&loop=1&playlist=Fr5kiIygm0c&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&mute=1',
        Chair: 'https://www.youtube.com/embed/tEZhXr0FuAQ?autoplay=1&loop=1&playlist=tEZhXr0FuAQ&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&mute=1',
        Cobra: 'https://www.youtube.com/embed/pVmOOluGAv8?autoplay=1&loop=1&playlist=pVmOOluGAv8&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&mute=1',
        Warrior: 'https://www.youtube.com/embed/Mn6RSIRCV3w?autoplay=1&loop=1&playlist=Mn6RSIRCV3w&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&mute=1',
        Dog: 'https://www.youtube.com/embed/EC7RGJ975iM?autoplay=1&loop=1&playlist=EC7RGJ975iM&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&mute=1',
        Shoulderstand: 'https://www.youtube.com/embed/UjHTOW9x3WM?autoplay=1&loop=1&playlist=UjHTOW9x3WM&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&mute=1',
        Triangle: 'https://www.youtube.com/embed/S6gB0QHbWFE?autoplay=1&loop=1&playlist=S6gB0QHbWFE&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&mute=1',
    };

    /* ------------------------------ Live view ------------------------------ */
    if (isStartPose) {
        return (
            <div className="min-h-screen bg-ink-950">
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-glow-400 font-semibold">Live Session</p>
                            <h1 className="text-2xl font-bold text-white">{currentPose} Pose</h1>
                        </div>
                        <span
                            className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${isHolding
                                ? 'bg-glow-500/15 border-glow-400/40 text-glow-200'
                                : 'bg-white/5 border-white/10 text-slate-400'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isHolding ? 'bg-glow-400 animate-pulse' : 'bg-slate-500'}`} />
                            {isHolding ? 'Holding' : 'Get into position'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Camera */}
                        <div className="lg:col-span-2">
                            <div
                                className={`relative rounded-2xl overflow-hidden border-2 transition-colors duration-300 ${isHolding ? 'border-glow-400 shadow-glow' : 'border-white/10'
                                    }`}
                            >
                                <Webcam
                                    ref={webcamRef}
                                    id="webcam"
                                    className="w-full h-auto block bg-black"
                                    videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
                                />
                                <canvas
                                    ref={canvasRef}
                                    id="my-canvas"
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="panel p-4 text-center">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">Current Hold</p>
                                    <p className="text-3xl font-extrabold text-white mt-1">
                                        {poseTime.toFixed(1)}<span className="text-base text-slate-400 ml-1">s</span>
                                    </p>
                                </div>
                                <div className="panel p-4 text-center">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">Session Best</p>
                                    <p className="text-3xl font-extrabold text-glow-300 mt-1">
                                        {bestPerform.toFixed(1)}<span className="text-base text-slate-400 ml-1">s</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reference */}
                        <div className="space-y-4">
                            <div className="panel overflow-hidden">
                                <p className="text-sm font-semibold text-white px-4 pt-4 pb-2">Reference</p>
                                <iframe
                                    title={`${currentPose} tutorial`}
                                    src={poseVideoUrls[currentPose]}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full aspect-video"
                                />
                            </div>

                            <div className="panel p-4">
                                <p className="text-sm font-semibold text-white mb-2">Tips</p>
                                <ul className="text-sm text-slate-400 space-y-1.5 list-disc pl-4">
                                    <li>Stand back so your whole body is visible.</li>
                                    <li>Good lighting improves detection.</li>
                                    <li>The skeleton turns <span className="text-glow-300 font-medium">blue</span> when the pose is correct.</li>
                                </ul>
                            </div>

                            <button onClick={stopPose} disabled={saving} className="btn-primary w-full !bg-red-500 hover:!bg-red-400 !shadow-none">
                                {saving ? 'Saving…' : 'Stop Session'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------------------- Setup / summary --------------------------- */
    return (
        <div className="min-h-screen bg-ink-950 relative">
            <div className="aurora" />
            <Navbar />
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
                <div className="text-center mb-8">
                    <p className="text-xs uppercase tracking-widest text-glow-400 font-semibold mb-2">Live Session</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient">Practice with real-time feedback</h1>
                    <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                        Pick a pose, allow camera access, and hold the position. POYO tracks your body and times how
                        long you hold it correctly.
                    </p>
                </div>

                {summary && (
                    <div className="panel p-5 mb-6 text-center animate-rise">
                        <p className="text-sm text-slate-400">Session complete</p>
                        <p className="text-4xl font-extrabold text-white mt-1">
                            {summary.held}<span className="text-lg text-slate-400 ml-1">s</span>
                        </p>
                        <p className="text-sm text-slate-400 mt-1">best hold for {currentPose}</p>
                        {summary.streak && (
                            <p className="mt-3 inline-flex items-center gap-2 text-sm bg-orange-500/10 border border-orange-500/30 text-orange-300 px-3 py-1.5 rounded-full">
                                🔥 {summary.streak.currentStreak}-day streak
                            </p>
                        )}
                        {summary.error && <p className="text-sm text-red-400 mt-2">{summary.error}</p>}
                    </div>
                )}

                <div className="panel p-6">
                    <DropDown poseList={poseList} currentPose={currentPose} setCurrentPose={setCurrentPose} />
                    <Instructions currentPose={currentPose} />
                    <button onClick={startYoga} className="btn-primary w-full mt-6 text-base py-3">
                        Start Session
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Yoga;
