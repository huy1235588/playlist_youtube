import { CiMenuBurger } from "react-icons/ci";
import { useState, useEffect, useRef } from "react";
import './playlistMenu.css'; // Đảm bảo file CSS này tồn tại và được import
import Button from "../ui/Button"; // Giả sử Button component đã được import đúng
import { BiHide } from "react-icons/bi";
import { GrAdd, GrUpdate } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";

// Định nghĩa kiểu cho một mục trong menu playlist
interface PlaylistItem {
    id: string; // ID duy nhất cho key prop
    label: string;
    icon: React.ElementType;
    iconSize?: number; // Kích thước icon (tùy chọn)
    action: () => void; // Hàm sẽ được gọi khi mục được nhấp
}

// Định nghĩa Props cho PlaylistMenu, bao gồm các hàm callback
interface PlaylistMenuProps {
    onAddPlaylist: () => void;
    onShowHiddenVideos: () => void;
    onUpdatePlaylist: () => void;
    onDeletePlaylist: () => void;
    // Thêm các props khác nếu cần
}

const PlaylistMenu: React.FC<PlaylistMenuProps> = ({
    onAddPlaylist,
    onShowHiddenVideos,
    onUpdatePlaylist,
    onDeletePlaylist,
}) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Danh sách các mục menu được định nghĩa dưới dạng dữ liệu
    const menuItems: PlaylistItem[] = [
        {
            id: 'add',
            label: 'Add new playlist',
            icon: GrAdd, iconSize: 20,
            action: onAddPlaylist
        },
        {
            id: 'show-hidden',
            label: 'Show hidden videos',
            icon: BiHide, iconSize: 20,
            action: onShowHiddenVideos
        },
        {
            id: 'update',
            label: 'Update playlist',
            icon: GrUpdate, iconSize: 20,
            action: onUpdatePlaylist
        },
        {
            id: 'delete',
            label: 'Delete playlist',
            icon: RiDeleteBin6Line, iconSize: 20,
            action: onDeletePlaylist
        },
    ];

    // Hàm để mở/đóng dropdown
    const toggleDropdown = () => {
        setDropdownVisible(prev => !prev);
    };

    // Đóng dropdown khi nhấn ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Hàm xử lý khi một mục menu được nhấp
    const handleItemClick = (itemAction: () => void) => {
        itemAction(); // Thực thi hành động tương ứng
        setDropdownVisible(false); // Đóng dropdown
    };

    return (
        <div className="playlist-menu" ref={dropdownRef}>
            <Button className="playlist-menu-button" onClick={toggleDropdown}>
                {/* Sử dụng kích thước mặc định hoặc tùy chỉnh nếu cần */}
                <CiMenuBurger className="playlist-menu-icon" size={24} />
            </Button>

            {isDropdownVisible && (
                <div className={`playlist-menu-dropdown ${isDropdownVisible ? 'show' : ''}`}>
                    <ul className="playlist-menu-list">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <li
                                    key={item.id} // Sử dụng id làm key
                                    className="playlist-menu-item"
                                    onClick={() => handleItemClick(item.action)} // Gọi hàm xử lý chung
                                >
                                    <IconComponent
                                        className="playlist-menu-icon"
                                        size={item.iconSize || 20} // Sử dụng kích thước từ item hoặc mặc định 20
                                    />
                                    <span className="playlist-menu-text">
                                        {item.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PlaylistMenu;