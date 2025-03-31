import React, { useState } from 'react'
import { poseInstructions } from '../../utils/data'
import { poseImages } from '../../utils/pose_images'

export default function Instructions({ currentPose }) {
    const [instructions, setInstructions] = useState(poseInstructions)

    return (
        <div className="flex justify-center items-center">
            <ul className="w-2/5 border-2 border-white border-opacity-20 rounded-lg p-2 mt-5">
                {instructions[currentPose].map((instruction, index) => (
                    <li key={index} className="text-black my-5">
                        {instruction}
                    </li>
                ))}
            </ul>
            <img
                className="h-96 aspect-w-1 aspect-h-1 rounded-lg"
                src={poseImages[currentPose]}
                alt="Pose Demo"
            />
        </div>
    )
}
