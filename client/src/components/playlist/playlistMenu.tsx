import { CiMenuBurger } from "react-icons/ci";
import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from "react";
import './playlistMenu.css'; // Đảm bảo file CSS này tồn tại và được import
import Button from "../ui/Button"; // Giả sử Button component đã được import đúng
import { BiHide } from "react-icons/bi";
import { GrAdd, GrUpdate } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";
import { usePopup } from "@/contexts/PopupContext";
import { Video } from "@/types/youtube";

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
    setVideos: Dispatch<SetStateAction<Video[]>>; // Hàm để cập nhật danh sách video
    setLoading?: Dispatch<SetStateAction<boolean>>; // Hàm để cập nhật trạng thái loading (tùy chọn)
    setError?: Dispatch<SetStateAction<string | null>>; // Hàm để cập nhật trạng thái lỗi (tùy chọn)
}

const PlaylistMenu: React.FC<PlaylistMenuProps> = ({
    setVideos, // Hàm để cập nhật danh sách video
    setLoading, // Hàm để cập nhật trạng thái loading (tùy chọn)
    setError, // Hàm để cập nhật trạng thái lỗi (tùy chọn)
}) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        openPopup,
        closePopup,
    } = usePopup();

    // Hàm xử lý thêm playlist mới
    const handleAddPlaylist = useCallback(() => {
        console.log("Add new playlist clicked");
        // Logic thêm playlist mới ở đây
    }, []);

    // Hàm xử lý hiển thị video ẩn
    const handleShowHidden = useCallback(() => {
        console.log("Show hidden videos clicked");
        // Logic hiển thị video ẩn ở đây
    }, []);


    const updatePlaylist = useCallback(async () => {
        try {
            setLoading && setLoading(true);

            await new Promise((resolve) => setTimeout(resolve, 2000)); // Giả lập thời gian tải dữ liệu


        } catch (error) {
            console.error("Error updating playlist:", error);
            if (setError) {
                setError("Có lỗi xảy ra khi cập nhật playlist.");
            }
        } finally {
            if (setLoading) {
                setLoading(false); // Đặt trạng thái loading về false sau khi hoàn thành
            }
        }
    }, []);

    // Hàm xử lý cập nhật playlist
    const handleUpdatePlaylist = useCallback(async () => {
        // Mở popup khi nhấn vào "Update playlist"
        openPopup(
            (
                <div className="popup-content">
                    <p className="popup-message">
                        Bạn có muốn cập nhật playlist không?
                    </p>

                    <div className="popup-actions">
                        <button
                            className="confirm-button"
                            onClick={updatePlaylist}
                        >
                            Có
                        </button>

                        <button
                            className="cancel-button"
                            onClick={closePopup}
                        >
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            ),
            "Cập nhật playlist"
        );

    }, []);

    // Hàm xử lý xóa playlist
    const handleDeletePlaylist = useCallback(() => {
        console.log("Delete playlist clicked");
        // Logic xóa playlist ở đây
    }, []);

    // Danh sách các mục menu được định nghĩa dưới dạng dữ liệu
    const menuItems: PlaylistItem[] = [
        {
            id: 'add',
            label: 'Add new playlist',
            icon: GrAdd, iconSize: 20,
            action: handleAddPlaylist
        },
        {
            id: 'show-hidden',
            label: 'Show hidden videos',
            icon: BiHide, iconSize: 20,
            action: handleShowHidden
        },
        {
            id: 'update',
            label: 'Update playlist',
            icon: GrUpdate, iconSize: 20,
            action: handleUpdatePlaylist
        },
        {
            id: 'delete',
            label: 'Delete playlist',
            icon: RiDeleteBin6Line, iconSize: 20,
            action: handleDeletePlaylist
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