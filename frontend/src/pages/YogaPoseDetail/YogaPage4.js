import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "../../assets/poses/warrior-ai.webp";

export default function YogaPage4() {
    return (
        <PoseDetailLayout
            image={Ypose}
            title="Warrior II"
            sanskrit="Virabhadrasana II"
            tracked={true}
        />
    );
}
