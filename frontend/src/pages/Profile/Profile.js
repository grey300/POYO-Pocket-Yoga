import React, { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { parseISO, isValid } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const poseList = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand'];

const Profile = () => {
    const { user, logout } = useAuth();
    const [cumulativePoseTime, setCumulativePoseTime] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [selectedPose, setSelectedPose] = useState(poseList[0]);
    const [userBestTimes, setUserBestTimes] = useState({});
    const [streakCount, setStreakCount] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(null);

    const sortedLeaderboard = [...leaderboard].sort(
        (a, b) => (b[`${selectedPose}_best`] || 0) - (a[`${selectedPose}_best`] || 0)
    );

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await apiClient.get('/api/profile');
                const userData = data.user;
                setCumulativePoseTime(userData.cumulativePoseTime);
                setUserBestTimes(
                    poseList.reduce((acc, pose) => {
                        acc[pose] = userData[`${pose}_best`] || 0;
                        return acc;
                    }, {})
                );
                setLastUpdated(userData.updatedAt);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                const { data } = await apiClient.get(`/api/leaderboard?pose=${selectedPose}`);
                setLeaderboard(data.leaderboard);
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        };
        fetchLeaderboardData();
    }, [selectedPose]);

    useEffect(() => {
        if (!lastUpdated) return;
        const lastUpdateDate = parseISO(lastUpdated);
        if (isValid(lastUpdateDate)) {
            const daysDifference = Math.floor((new Date() - lastUpdateDate) / (1000 * 60 * 60 * 24));
            if (daysDifference === 1) setStreakCount((prev) => prev + 1);
            else if (daysDifference > 1) setStreakCount(0);
        }
    }, [lastUpdated]);

    const rankMedal = (index) => ['🥇', '🥈', '🥉'][index] || index + 1;

    if (!user) return null;

    return (
        <div className="bg-[#F4F6F1] min-h-screen">
            <NavBar />
            <ToastContainer />
            <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="relative bg-white rounded-2xl shadow-md overflow-hidden">
                        <div className="bg-[#3A5A40] h-24" />
                        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/90 rounded-full px-3 py-1 shadow">
                            <FontAwesomeIcon icon={faFire} className="text-orange-500" />
                            <span className="text-sm font-bold text-gray-800">{streakCount}</span>
                        </div>
                        <div className="px-6 pb-6">
                            <div className="-mt-10 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-[#A5B28F] text-white flex items-center justify-center text-2xl font-bold ring-4 ring-white">
                                    {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold mt-3 text-gray-800">
                                    {`${user.firstName} ${user.lastName}`}
                                </h2>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <button
                                    onClick={logout}
                                    className="mt-3 text-sm text-red-600 hover:underline"
                                >
                                    Log out
                                </button>
                            </div>

                            <div className="bg-[#EDF1E8] p-4 mt-5 rounded-xl text-center">
                                <h3 className="text-sm uppercase tracking-wide text-gray-500">Total Practice Time</h3>
                                <p className="mt-1">
                                    <span className="text-4xl font-extrabold text-[#3A5A40]">{cumulativePoseTime || 0}</span>
                                    <span className="text-gray-500 ml-1">s</span>
                                </p>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Best Times for Each Pose</h3>
                                <div className="overflow-hidden rounded-xl border border-gray-100">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="bg-[#EDF1E8] text-gray-600">
                                                <th className="py-2 px-4 text-left">Pose</th>
                                                <th className="py-2 px-4 text-right">Best Time (s)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {poseList.map((pose, i) => (
                                                <tr key={pose} className={i % 2 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-4 py-2 text-gray-700">{pose}</td>
                                                    <td className="px-4 py-2 text-right font-semibold text-gray-800">
                                                        {userBestTimes[pose] || 0} s
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Section */}
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h1 className="text-2xl font-extrabold text-center text-[#3A5A40] mb-5">Leaderboard</h1>

                        <div className="mb-5">
                            <label htmlFor="pose-select" className="block mb-2 text-sm font-medium text-gray-600">
                                Select Pose
                            </label>
                            <select
                                id="pose-select"
                                value={selectedPose}
                                onChange={(e) => setSelectedPose(e.target.value)}
                                className="block w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A5A40] focus:outline-none"
                            >
                                {poseList.map((pose) => (
                                    <option key={pose} value={pose}>{pose}</option>
                                ))}
                            </select>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-[#EDF1E8] text-gray-600">
                                        <th className="py-2 px-4">Rank</th>
                                        <th className="py-2 px-4 text-left">Name</th>
                                        <th className="py-2 px-4 text-right">{selectedPose} (s)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedLeaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                                                No entries yet — be the first!
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedLeaderboard.map((entry, index) => (
                                            <tr key={entry.userId} className={index % 2 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-2 text-center">{rankMedal(index)}</td>
                                                <td className="px-4 py-2 text-gray-700">
                                                    {`${entry.userDetails.firstName} ${entry.userDetails.lastName}`}
                                                </td>
                                                <td className="px-4 py-2 text-right font-semibold text-gray-800">
                                                    {entry[`${selectedPose}_best`] || 0}
                                                </td>
                                            </tr>
                                        ))
                                    )}
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
