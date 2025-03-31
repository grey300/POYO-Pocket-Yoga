import React, { useState } from 'react';
import { poseImages } from '../../utils/pose_images';

export default function DropDown({ poseList, currentPose, setCurrentPose }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropDown = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className='flex inline-block justify-center item-center py-10'>
            <div>
                <button
                    type='button'
                    onClick={toggleDropDown}
                    className="inline-flex justify-center w-64 px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-transparent rounded-md hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    id="pose-dropdown-btn"
                    aria-expanded={isOpen}
                >
                    {currentPose}
                </button>
            </div>
            {isOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 -mt-1 w-64 origin-top bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="pose-dropdown-btn">
                    <div className="py-1" role="none">
                        {poseList.map((pose) => (
                            <button
                                key={pose}
                                onClick={() => {
                                    setCurrentPose(pose);
                                    toggleDropDown();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                            >
                                <img src={poseImages[pose]} className="w-10 h-10 mr-4" alt={pose} />
                                <span>{pose}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
