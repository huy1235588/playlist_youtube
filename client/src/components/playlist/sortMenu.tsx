import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { BsSortAlphaDown, BsSortAlphaUpAlt, BsCalendarDate, BsCalendarDateFill } from "react-icons/bs";
import './sortMenu.css'; // Import CSS file for styling
import { MdSort } from "react-icons/md";
import { BsSortDown, BsSortUp } from "react-icons/bs";

const SortMenu = () => {
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
        <div className="sort-menu" ref={dropdownRef}>
            <Button className="sort-menu-button" onClick={toggleDropdown}>
                <MdSort
                    className="sort-menu-icon"
                    size={20}
                />
                <span className="sort-menu-text">
                    Sắp xếp
                </span>
            </Button>
            {isDropdownVisible && (
                <div className={`sort-menu-dropdown ${isDropdownVisible ? 'show' : ''}`}>
                    <ul className="sort-menu-list">
                        <li className="sort-menu-item">
                            <BsSortUp
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Ngày thêm (Mới nhất)
                            </span>
                        </li>

                        <li className="sort-menu-item">
                            <BsSortDown
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Ngày thêm (Cũ nhất)
                            </span>
                        </li>

                        <li className="sort-menu-item">
                            <MdSort
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Phổ biến nhất
                            </span>
                        </li>

                        <li className="sort-menu-item">
                            <BsSortAlphaDown
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Tên (A-Z)
                            </span>
                        </li>

                        <li className="sort-menu-item">
                            <BsSortAlphaUpAlt
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Tên (Z-A)
                            </span>
                        </li>

                        <li className="sort-menu-item">
                            <BsCalendarDate
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Ngày phát hành (Mới nhất)
                            </span>
                        </li>
                        
                        <li className="sort-menu-item">
                            <BsCalendarDateFill
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Ngày phát hành (Cũ nhất)
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default SortMenu;