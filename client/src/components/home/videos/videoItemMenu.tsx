import { IoEllipsisVertical } from "react-icons/io5";
import React from "react";
import './videoItemMenu.css'; // Import CSS cho component
import Button from "@/components/ui/Button";

const VideoItemMenu = () => {

    return (
        <div className="menu">
            <Button className="menu-button" >
                <IoEllipsisVertical />
            </Button>
        </div>
    );
}

export default VideoItemMenu;