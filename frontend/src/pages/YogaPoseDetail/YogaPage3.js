import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "./yogapose3.svg";

export default function YogaPage3() {
    return (
        <PoseDetailLayout
            image={Ypose}
            title="Cobra"
            sanskrit="Bhujangasana"
            tracked={true}
        />
    );
}
