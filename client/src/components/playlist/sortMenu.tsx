import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { BsSortAlphaDown, BsSortAlphaUpAlt, BsCalendarDate, BsCalendarDateFill } from "react-icons/bs";
import './sortMenu.css'; // Import CSS file for styling
import { MdSort } from "react-icons/md";
import { BsSortDown, BsSortUp } from "react-icons/bs";

interface SortMenuProps {
    onSortChange: (column: string, order: string) => void;
    defaultColumn: string;
    defaultOrder: string;
}

const SortMenu: React.FC<SortMenuProps> = ({ onSortChange, defaultColumn, defaultOrder }) => {
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

    // Hàm xử lý khi nhấn vào một mục
    const handleSortChange = (column: string, order: string) => {
        onSortChange(column, order);
        setDropdownVisible(false); // Đóng dropdown sau khi chọn
    };

    // Kiểm tra mục nào đang được chọn
    const isActive = (column: string, order: string) => {
        return column === defaultColumn && order === defaultOrder;
    };

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
                        <li className={`sort-menu-item ${isActive('AddedAt', 'desc') ? 'active' : ''}`} onClick={() => handleSortChange('AddedAt', 'desc')}>
                            <BsSortUp
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Ngày thêm (Mới nhất)
                            </span>
                        </li>

                        <li className={`sort-menu-item ${isActive('AddedAt', 'asc') ? 'active' : ''}`} onClick={() => handleSortChange('AddedAt', 'asc')}>
                            <BsSortDown
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Ngày thêm (Cũ nhất)
                            </span>
                        </li>

                        <li className={`sort-menu-item ${isActive('ViewCount', 'desc') ? 'active' : ''}`} onClick={() => handleSortChange('ViewCount', 'desc')}>
                            <MdSort
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Phổ biến nhất
                            </span>
                        </li>

                        <li className={`sort-menu-item ${isActive('VideoTitle', 'asc') ? 'active' : ''}`} onClick={() => handleSortChange('VideoTitle', 'asc')}>
                            <BsSortAlphaDown
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Tên (A-Z)
                            </span>
                        </li>

                        <li className={`sort-menu-item ${isActive('VideoTitle', 'desc') ? 'active' : ''}`} onClick={() => handleSortChange('VideoTitle', 'desc')}>
                            <BsSortAlphaUpAlt
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Tên (Z-A)
                            </span>
                        </li>

                        <li className={`sort-menu-item ${isActive('publishedAt', 'desc') ? 'active' : ''}`} onClick={() => handleSortChange('publishedAt', 'desc')}>
                            <BsCalendarDate
                                className="sort-menu-icon"
                                size={20}
                            />

                            <span className="sort-menu-text">
                                Ngày phát hành (Mới nhất)
                            </span>
                        </li>

                        <li className={`sort-menu-item ${isActive('publishedAt', 'asc') ? 'active' : ''}`} onClick={() => handleSortChange('publishedAt', 'asc')}>
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