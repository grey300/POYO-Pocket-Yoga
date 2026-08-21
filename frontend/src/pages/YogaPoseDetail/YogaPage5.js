import React from "react";
import PoseDetailLayout from "../../components/PoseDetailLayout";
import Ypose from "../../assets/poses/dog-ai.webp";

export default function YogaPage5() {
    return (
        <PoseDetailLayout
            image={Ypose}
            title="Dog"
            sanskrit="Adho Mukha Svanasana"
            tracked={true}
        />
    );
}
