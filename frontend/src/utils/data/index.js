export const poseInstructions = {
    Tree: [
        'Get into position. Tree pose often starts from mountain pose (or Tadasana), with both feet planted firmly on the ground and your weight adequately distributed so that you are balanced.',
        'Bend one leg at the knee. Choose the leg you are going to fold in first. If your left leg is your standing leg, keep your left foot planted on the ground, and slowly bend in your right leg at the right knee so that the sole of your right foot rests against your left inner thigh (known as the half-lotus position in Bikram yoga). Point the knee of your bent leg outward, away from your body.',
        'Lengthen your body. Clasp your hands together in Anjali Mudra (also called the “prayer position”)',
        'Hold and repeat. Hold the pose for as long as necessary, making sure to breathe properly. When you’re ready to switch legs, exhale, and return to mountain pose to start again.'
    ],
    Cobra: [
        'Lie prone on the floor. Stretch your legs back, tops of the feet on the floor. Spread your hands on the floor under your shoulders. Hug the elbows back into your body.',
        'On an inhalation, begin to straighten the arms to lift the chest off the floor, going only to the height at which you can maintain a connection through your pubis to your legs. Press the tailbone toward the pubis and lift the pubis toward the navel. Narrow the hip points. Firm but don’t harden the buttocks.',
        'Firm the shoulder blades against the back, puffing the side ribs forward. Lift through the top of the sternum but avoid pushing the front ribs forward, which only hardens the lower back. Distribute the backbend evenly throughout the entire spine.',
        'Hold the pose anywhere from 15 to 30 seconds, breathing easily. Release back to the floor with an exhalation.',
        'Source: Yoga Journal - https://www.yogajournal.com/poses/types/cobra-pose-2/'
    ],
    Dog: [
        'Start on hands and knees, hands slightly forward of shoulders, and knees below hips. Spread palms, root down, and lift knees.',
        'Lengthen tailbone, lift sitting bones, and draw inner legs up. Push thighs back, straighten knees, and firm outer arms.',
        'Press bases of index fingers down, lift inner arms, and widen shoulder blades. Keep head between upper arms.',
        'Stay for 10 breaths, then exhale, bend knees, and lower into Child’s Pose.',
        'Source: Yoga Journal - https://www.yogajournal.com/poses/types/downward-facing-dog/'

    ],
    Chair: [
        'Stand straight and tall with your feet slightly wider than hip­-width apart and your arms at your sides.',
        'Inhale and lift your arms next to your ears, stretching them straight and parallel with wrists and fingers long. Keep your shoulders down and spine neutral.',
        'Exhale as you bend your knees, keeping your thighs and knees parallel. Lean your torso forward to create a right angle with the tops of your thighs. Keep your neck and head in line with your torso and arms. Hold for 30 seconds to 1 minute.',
        'Source: classpass - https://classpass.com/movements/chair-pose'
    ],
    Warrior: [
        'Begin in lunge with your front knee bent, your back leg straight and your back heel lifted. Your hips and chest should be squared to front of the mat. Raise your arms above your head.',
        'Move your hands to your heart, with palms pressed against each other in a prayer position. Lean forward until your back leg extends straight back, even with your hips. Keep your foot flexed and your gaze downward.',
        'Make sure your standing leg is strong and straight, but not locked at knee. Reach your arms forward so your body forms a “T” shape.',
        'Source classpass - https://classpass.com/movements/warrior-3-pose'
    ],
    Traingle: [
        'Begin standing, then jump your feet apart about three to four feet. Turn your left foot out, bend your left leg, and raise your arms to the sides forming a “T”.',
        'Straighten your left leg, hinge at your hips, and reach your torso over your left leg. Rotate your left palm up and gaze over your left arm.',
        'Reach your left hand to the mat in front of your left foot. Adjust your back leg if needed for balance. Gaze towards your extended right arm. Repeat on the other side.',
        'Source classpass - https://classpass.com/movements/triangle-pose'
    ],
    Shoulderstand: [
        'Start with two folded blankets under your upper back, legs bent, and feet on the floor. Walk your shoulders under and lift into bridge pose.',
        'Extend your arms with palms down towards your heels. Press into your palms, lift onto the balls of your feet, and extend one leg up. Place hands on low back and extend the other leg up.',
        "Keep your gaze up and neck straight to avoid injury. Walk hands up the back for stability and feel the chest opening.",
        "Align hips over shoulders and feet over hips. Stay in the pose for up to 10 breaths.",
        'Source: verywellfit - https://www.verywellfit.com/shoulderstand-salamba-sarvangasana-3567115'
    ]

}


export const tutorials = [
    '1. When App ask for permission of camera, allow it to access to capture pose.',
    '2. Select what pose you want to do in the dropdown.',
    '3. Read Instrctions of that pose so you will know how to do that pose.',
    '4. Click on Start pose and see the image of the that pose in the right side and replecate that image in front of camera.',
    '5. If you will do correctly the skeleton over the video will become green in color and sound will start playing'
]

export const fixCamera = [
    'Solution 1. Make sure you have allowed the permission of camera, if you have denined the permission, go to setting of your browser to allow the access of camera to the application.',
    'Solution 2. Make sure no any other application is not accessing camera at that time, if yes, close that application',
    'Solution 3. Try to close all the other opened broswers'
]

export const POINTS = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 5,
    RIGHT_SHOULDER: 6,
    LEFT_ELBOW: 7,
    RIGHT_ELBOW: 8,
    LEFT_WRIST: 9,
    RIGHT_WRIST: 10,
    LEFT_HIP: 11,
    RIGHT_HIP: 12,
    LEFT_KNEE: 13,
    RIGHT_KNEE: 14,
    LEFT_ANKLE: 15,
    RIGHT_ANKLE: 16,
}

export const keypointConnections = {
    nose: ['left_ear', 'right_ear'],
    left_ear: ['left_shoulder'],
    right_ear: ['right_shoulder'],
    left_shoulder: ['right_shoulder', 'left_elbow', 'left_hip'],
    right_shoulder: ['right_elbow', 'right_hip'],
    left_elbow: ['left_wrist'],
    right_elbow: ['right_wrist'],
    left_hip: ['left_knee', 'right_hip'],
    right_hip: ['right_knee'],
    left_knee: ['left_ankle'],
    right_knee: ['right_ankle']
}