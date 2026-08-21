import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "../../assets/poses/chair-ai.webp";

export default function YogaPage2() {
    return (
        <PoseDetailLayout
            image={Ypose}
            title="Chair"
            sanskrit="Utkatasana"
            tracked={true}
        />
    );
}
