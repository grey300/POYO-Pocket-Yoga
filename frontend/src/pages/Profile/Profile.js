import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { useUser } from '@clerk/clerk-react';
import { UserButton } from '@clerk/clerk-react';
import { parseISO, isValid } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const poseList = [
    'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand'
];

const Profile = () => {
    const { user } = useUser();
    const [bestPoseTime, setBestPoseTime] = useState(null);
    const [cumulativePoseTime, setCumulativePoseTime] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [selectedPose, setSelectedPose] = useState(poseList[0]);
    const [userBestTimes, setUserBestTimes] = useState({});
    const [bestTimesData, setBestTimesData] = useState([]);
    const [performanceData, setPerformanceData] = useState({});
    const [streakCount, setStreakCount] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);

    const sortedLeaderboard = [...leaderboard].sort((a, b) => b[`${selectedPose}_best`] - a[`${selectedPose}_best`]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            const clerkUserId = user.id;

            try {
                const userProfileResponse = await axios.get(`http://localhost:80/api/user-profile/${clerkUserId}`);
                const userData = userProfileResponse.data.user;

                setBestPoseTime(userData[`${selectedPose}_best`]);
                setCumulativePoseTime(userData.cumulativePoseTime);

                const bestTimes = poseList.reduce((acc, pose) => {
                    acc[pose] = userData[`${pose}_best`] || 0;
                    return acc;
                }, {});

                setUserBestTimes(bestTimes);
                setLastUpdated(userData.lastUpdated);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserData();
    }, [user, selectedPose]);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                const response = await axios.get(`http://localhost:80/api/leaderboard?pose=${selectedPose}`);
                setLeaderboard(response.data.leaderboard);
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        };

        fetchLeaderboardData();
    }, [selectedPose]);

    useEffect(() => {
        const fetchBestTimesData = async () => {
            if (!user) return;

            const clerkUserId = user.id;

            try {
                const response = await axios.get(`http://localhost:80/api/best-times/${clerkUserId}`);
                setBestTimesData(response.data.bestTimes);
            } catch (error) {
                console.error('Error fetching best times data:', error);
            }
        };

        fetchBestTimesData();
    }, [user]);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            if (!user) return;

            const clerkUserId = user.id;
            try {
                const response = await axios.get(`http://localhost:80/api/get-performance/${clerkUserId}`);
                setPerformanceData(response.data.performanceData);
            } catch (error) {
                console.error('Error fetching performance data:', error);
            }
        };

        fetchPerformanceData();
    }, [user]);

    useEffect(() => {
        const checkStreak = () => {
            if (!lastUpdated) return;

            const lastUpdateDate = parseISO(lastUpdated);
            const currentDate = new Date();

            if (isValid(lastUpdateDate)) {
                const daysDifference = Math.floor((currentDate - lastUpdateDate) / (1000 * 60 * 60 * 24));

                if (daysDifference === 1) {
                    setStreakCount(prevCount => prevCount + 1);
                } else if (daysDifference > 1) {
                    setStreakCount(0);
                }
            }
        };

        checkStreak();
    }, [lastUpdated]);

    const notifyMotivation = (pose, newBestTime) => {
        toast.success(`🎉 New personal best for ${pose}: ${newBestTime}s! Keep it up!`);
    };

    const updatePoseTime = async (pose, newTime) => {
        if (!user) return;

        const clerkUserId = user.id;
        const previousBestTime = userBestTimes[pose];

        try {
            const response = await axios.post(`http://localhost:80/api/update-pose-time`, {
                clerkUserId,
                pose,
                newTime
            });

            if (response.data.success) {
                if (newTime > previousBestTime) {
                    notifyMotivation(pose, newTime);
                }
                setUserBestTimes(prevTimes => ({
                    ...prevTimes,
                    [pose]: Math.max(prevTimes[pose], newTime)
                }));
            }
        } catch (error) {
            console.error('Error updating pose time:', error);
        }
    };

    return (
        <div>
            <NavBar />
            <ToastContainer />
            <div className="container mx-auto py-20 px-56">
                <div className="flex flex-wrap -mx-2 mb-10">
                    {user && (
                        <div className="w-full lg:w-1/2 px-2 mb-4 lg:mb-0">
                            <div className="relative profile-section bg-[#A5B28F] p-5 rounded-lg shadow-lg">
                                <div className="absolute top-0 left-0 m-4 flex items-center space-x-2">
                                    <FontAwesomeIcon icon={faFire} className="text-red-500" />
                                    <span className="text-lg font-bold">{streakCount}</span>
                                </div>
                                <div className="profile-image text-center">
                                    <div className="user-button-large mt-2">
                                        <UserButton afterSignOutUrl='/' />
                                    </div>
                                </div>
                                <h2 className="text-center text-xl font-bold mt-3">{`${user.firstName} ${user.lastName}`}</h2>
                                <div className="total-time bg-gray-200 p-3 mt-3 rounded-lg text-center">
                                    <h3>Total Time:</h3>
                                    <span className="text-3xl font-bold">{cumulativePoseTime || 0}</span> s
                                </div>
                                <div className="best-times mt-5">
                                    <h3 className="text-center text-xl font-bold">Best Times for Each Pose</h3>
                                    <table className="min-w-full bg-white mt-3 border">
                                        <thead>
                                            <tr>
                                                <th className="py-2 px-4 bg-gray-200 border">Pose</th>
                                                <th className="py-2 px-4 bg-gray-200 border">Best Time (s)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {poseList.map(pose => (
                                                <tr key={pose} className="text-center">
                                                    <td className="border px-4 py-2">{pose}</td>
                                                    <td className="border px-4 py-2">{userBestTimes[pose]} s</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Leaderboard Section */}
                    <div className="w-full lg:w-1/2 px-2">
                        <div className="leaderboard-section bg-[#A5B28F] p-5 rounded-lg shadow-lg">
                            <h1 className="text-2xl font-bold text-center mb-5">LEADERBOARD</h1>

                            {/* Pose Filter Dropdown */}
                            <div className="mb-5">
                                <label htmlFor="pose-select" className="block mb-2">Select Pose:</label>
                                <select
                                    id="pose-select"
                                    value={selectedPose}
                                    onChange={(e) => setSelectedPose(e.target.value)}
                                    className="block w-full p-2 border rounded"
                                >
                                    {poseList.map(pose => (
                                        <option key={pose} value={pose}>{pose}</option>
                                    ))}
                                </select>
                            </div>

                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 bg-gray-200">Rank</th>
                                        <th className="py-2 px-4 bg-gray-200">Name</th>
                                        <th className="py-2 px-4 bg-gray-200">Best Time ({selectedPose}) (s)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedLeaderboard.map((entry, index) => (
                                        <tr key={entry.clerkUserId} className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                                            <td className="border px-4 py-2 text-center">{index + 1}</td>
                                            <td className="border px-4 py-2 text-center">{`${entry.userDetails.firstName} ${entry.userDetails.lastName}`}</td>
                                            <td className="border px-4 py-2 text-center">{entry[`${selectedPose}_best`]} Sec</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
