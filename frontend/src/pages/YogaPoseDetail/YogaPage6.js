import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "./yogapose6.svg";

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
