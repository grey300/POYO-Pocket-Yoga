import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "./yogapose8.svg";

export default function YogaPage8() {
    return (
        <PoseDetailLayout
            image={Ypose}
            title="Child’s Pose"
            sanskrit="Balasana"
            tracked={false}
        />
    );
}
