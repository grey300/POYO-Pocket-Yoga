import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "./yogapose4.svg";

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
