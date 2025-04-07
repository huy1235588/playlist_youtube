import { CiMenuBurger } from "react-icons/ci";
import { useState, useEffect, useRef } from "react";
import './playlistMenu.css';
import Button from "../ui/Button";
import { BiHide } from "react-icons/bi";
import { GrAdd, GrUpdate } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";

const PlaylistMenu = () => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Hàm để mở/đóng dropdown
    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    // Đóng dropdown khi nhấn ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };

    // Sử dụng useEffect để thêm sự kiện click ra ngoài
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="playlist-menu" ref={dropdownRef}>
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