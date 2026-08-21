import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "../../assets/poses/triangle-ai.webp";

export default function YogaPage7() {
    return (
        <PoseDetailLayout
            image={Ypose}
            title="Triangle"
            sanskrit="Trikonasana"
            tracked={false}
        />
    );
}
