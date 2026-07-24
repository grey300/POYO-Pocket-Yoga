/**
 * 2D keypoint layouts for each pose, using the same 17 COCO joints MoveNet
 * reports in the live session. Coordinates live in a 100 x 120 box with y
 * pointing down (SVG convention); the floor sits at y = 112.
 *
 * These replace the mismatched stock clip art: one style, one palette, and the
 * poses are drawn from the joints the classifier actually looks at.
 */

export const GROUND_Y = 112;

export const BONES = [
    ['left_shoulder', 'right_shoulder'],
    ['left_hip', 'right_hip'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
];

/** Joints drawn as the head blob rather than as bones. */
export const HEAD_KEYS = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear'];

const POSES = {
    // Standing on one leg, opposite foot to the inner thigh, hands overhead.
    Tree: {
        nose: [50, 25], left_eye: [47.5, 23.5], right_eye: [52.5, 23.5],
        left_ear: [45, 25], right_ear: [55, 25],
        left_shoulder: [42, 36], right_shoulder: [58, 36],
        left_elbow: [34, 23], right_elbow: [66, 23],
        left_wrist: [47, 8], right_wrist: [53, 8],
        left_hip: [44, 60], right_hip: [56, 60],
        left_knee: [44, 86], left_ankle: [45, 112],
        right_knee: [76, 74], right_ankle: [52, 68],
    },
    // Deep squat, hips back, arms reaching overhead. Seen from the side.
    Chair: {
        nose: [47, 37], left_eye: [50, 35], right_eye: [52, 35.5],
        left_ear: [50, 39.5], right_ear: [52, 40],
        left_shoulder: [50, 46], right_shoulder: [54, 46.5],
        left_elbow: [38, 31], right_elbow: [42, 31.5],
        left_wrist: [26, 17], right_wrist: [30, 17.5],
        left_hip: [63, 70], right_hip: [67, 70.5],
        left_knee: [38, 86], right_knee: [42, 86.5],
        left_ankle: [50, 112], right_ankle: [54, 112],
    },
    // Prone, hands under shoulders, chest and head lifted.
    Cobra: {
        nose: [78, 62], left_eye: [75, 60], right_eye: [73, 61],
        left_ear: [70, 64], right_ear: [68.5, 65],
        left_shoulder: [66, 72], right_shoulder: [68.5, 71],
        left_elbow: [68, 90], right_elbow: [70.5, 89],
        left_wrist: [67, 108], right_wrist: [69.5, 107],
        left_hip: [42, 96], right_hip: [44.5, 95],
        left_knee: [24, 104], right_knee: [26.5, 103],
        left_ankle: [8, 109], right_ankle: [10.5, 108],
    },
    // Wide stance, front knee stacked over the ankle, arms level.
    Warrior: {
        nose: [60, 29], left_eye: [57, 27], right_eye: [59.5, 26.5],
        left_ear: [54, 30], right_ear: [55.5, 29],
        left_shoulder: [44, 39], right_shoulder: [52, 38.5],
        left_elbow: [26, 39], right_elbow: [71, 38],
        left_wrist: [8, 39], right_wrist: [90, 38],
        left_hip: [46, 63], right_hip: [53, 63],
        left_knee: [28, 87], left_ankle: [12, 112],
        right_knee: [80, 84], right_ankle: [87, 112],
    },
    // Downward dog: hips high, body folded into an inverted V.
    Dog: {
        nose: [24, 86], left_eye: [27, 83], right_eye: [29, 84],
        left_ear: [31, 80], right_ear: [32.5, 79],
        left_shoulder: [28, 74], right_shoulder: [30.5, 73],
        left_elbow: [21, 92], right_elbow: [23.5, 91],
        left_wrist: [14, 109], right_wrist: [16.5, 108],
        left_hip: [58, 32], right_hip: [61, 32.5],
        left_knee: [73, 68], right_knee: [75.5, 67],
        left_ankle: [86, 110], right_ankle: [88.5, 109],
    },
    // Inverted, weight on the shoulders, legs stacked vertically.
    Shoulderstand: {
        nose: [50, 110], left_eye: [47.5, 108.5], right_eye: [52.5, 108.5],
        left_ear: [45, 107], right_ear: [55, 107],
        left_shoulder: [45, 104], right_shoulder: [55, 104],
        left_elbow: [33, 99], right_elbow: [67, 99],
        left_wrist: [41, 84], right_wrist: [59, 84],
        left_hip: [46, 50], right_hip: [54, 50],
        left_knee: [46, 28], right_knee: [54, 28],
        left_ankle: [46, 7], right_ankle: [54, 7],
    },
    // Side bend: bottom hand toward the shin, top arm reaching up.
    Triangle: {
        nose: [33, 31], left_eye: [35.5, 29.5], right_eye: [37.5, 30.5],
        left_ear: [38, 34], right_ear: [39.5, 35],
        left_shoulder: [37, 45], right_shoulder: [43, 41],
        left_elbow: [30, 67], right_elbow: [53, 25],
        left_wrist: [23, 92], right_wrist: [63, 9],
        left_hip: [49, 61], right_hip: [55, 58],
        left_knee: [30, 86], left_ankle: [16, 112],
        right_knee: [76, 86], right_ankle: [84, 112],
    },
    // Kneeling fold, forehead low, arms extended forward.
    Child: {
        nose: [31, 104], left_eye: [34, 102], right_eye: [36, 103],
        left_ear: [38, 99], right_ear: [39.5, 98],
        left_shoulder: [37, 96], right_shoulder: [39.5, 94.5],
        left_elbow: [26, 102], right_elbow: [28.5, 100.5],
        left_wrist: [13, 106], right_wrist: [15.5, 104.5],
        left_hip: [63, 84], right_hip: [65.5, 83],
        left_knee: [67, 98], right_knee: [69.5, 97],
        left_ankle: [85, 106], right_ankle: [87.5, 105],
    },
};

/** Aliases so callers can use whichever spelling the existing data uses. */
const ALIASES = {
    'Warrior II': 'Warrior',
    Traingle: 'Triangle',
    "Child's Pose": 'Child',
    Childpose: 'Child',
};

export function getPoseFigure(name) {
    return POSES[name] || POSES[ALIASES[name]] || null;
}

export default POSES;
