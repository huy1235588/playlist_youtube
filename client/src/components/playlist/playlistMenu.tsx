import { CiMenuBurger } from "react-icons/ci";
import { useState } from "react";
import './playlistMenu.css';
import Button from "../ui/Button";
import { BiHide } from "react-icons/bi";
import { GrAdd, GrUpdate } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";

const PlaylistMenu = () => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    return (
        <div className="playlist-menu">
            <Button className="playlist-menu-button" onClick={toggleDropdown}>
                <CiMenuBurger className="playlist-menu-icon" />
            </Button>
            {isDropdownVisible && (
                <div className={`playlist-menu-dropdown ${isDropdownVisible ? 'show' : ''}`}>
                    <ul className="playlist-menu-list">
                        <li className="playlist-menu-item">
                            <GrAdd
                                className="playlist-menu-icon"
                                size={24}
                            />

                            <span className="playlist-menu-text">
                                Add new playlist
                            </span>
                        </li>
                        <li className="playlist-menu-item">
                            <BiHide
                                className="playlist-menu-icon"
                                size={20}
                            />

                            <span className="playlist-menu-text">
                                Show hidden videos
                            </span>
                        </li>
                        <li className="playlist-menu-item">
                            <GrUpdate
                                className="playlist-menu-icon"
                                size={20}
                            />

                            <span className="playlist-menu-text">
                                Update playlist
                            </span>
                        </li>
                        <li className="playlist-menu-item">
                            <RiDeleteBin6Line
                                className="playlist-menu-icon"
                                size={20}
                            />

                            <span className="playlist-menu-text">
                                Delete playlist
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PlaylistMenu;