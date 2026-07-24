import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "./yogapose1.svg";

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
