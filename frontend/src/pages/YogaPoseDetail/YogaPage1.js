import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "../../assets/poses/tree-ai.webp";

export default function YogaPage1() {
    return (
        <PoseDetailLayout
            image={Ypose}
            title="Tree"
            sanskrit="Vrksasana"
            tracked={true}
        />
    );
}
