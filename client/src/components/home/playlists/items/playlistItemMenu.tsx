import { IoEllipsisVertical } from "react-icons/io5";
import React from "react";
import './playlistItemMenu.css'; // Import CSS cho component
import Button from "@/components/ui/Button";

const PlaylistItemMenu = () => {

    return (
        <div className="menu">
            <Button className="menu-button" >
                <IoEllipsisVertical />
            </Button>
        </div>
    );
}

export default PlaylistItemMenu;