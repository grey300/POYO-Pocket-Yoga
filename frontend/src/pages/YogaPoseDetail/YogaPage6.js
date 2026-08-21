import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "../../assets/poses/shoulderstand-ai.webp";

export default function YogaPage6() {
    return (
        <PoseDetailLayout
            image={Ypose}
            title="Shoulderstand"
            sanskrit="Salamba Sarvangasana"
            tracked={true}
        />
    );
}
