import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button"; // Giả sử Button component đã được import đúng
import {
    BsSortAlphaDown,
    BsSortAlphaUpAlt,
    BsCalendarDate,
    BsCalendarDateFill,
    BsSortDown,
    BsSortUp
} from "react-icons/bs";
import { MdSort } from "react-icons/md";
import './sortMenu.css'; // Đảm bảo file CSS này tồn tại và được import

// Định nghĩa kiểu cho một tùy chọn sắp xếp
interface SortOption {
    column: string;
    order: string;
    label: string;
    icon: React.ElementType; // Sử dụng React.ElementType cho component icon
}

// Mảng chứa các tùy chọn sắp xếp
const sortOptions: SortOption[] = [
    { column: 'AddedAt', order: 'desc', label: 'Ngày thêm (Mới nhất)', icon: BsSortUp },
    { column: 'AddedAt', order: 'asc', label: 'Ngày thêm (Cũ nhất)', icon: BsSortDown },
    { column: 'ViewCount', order: 'desc', label: 'Phổ biến nhất', icon: MdSort }, // Sử dụng MdSort cho phổ biến nhất
    { column: 'VideoTitle', order: 'asc', label: 'Tên (A-Z)', icon: BsSortAlphaDown },
    { column: 'VideoTitle', order: 'desc', label: 'Tên (Z-A)', icon: BsSortAlphaUpAlt },
    { column: 'publishedAt', order: 'desc', label: 'Ngày phát hành (Mới nhất)', icon: BsCalendarDate },
    { column: 'publishedAt', order: 'asc', label: 'Ngày phát hành (Cũ nhất)', icon: BsCalendarDateFill },
];

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
        setDropdownVisible(prev => !prev); // Sử dụng callback để đảm bảo state luôn mới nhất
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
    }, []); // Dependency array rỗng đảm bảo effect chỉ chạy một lần khi mount

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
                <MdSort className="sort-menu-icon" size={20} />
                <span className="sort-menu-text">Sắp xếp</span>
            </Button>

            {isDropdownVisible && (
                // Có thể thêm animation class nếu cần, ví dụ dùng thư viện như framer-motion
                <div className={`sort-menu-dropdown ${isDropdownVisible ? 'show' : ''}`}>
                    <ul className="sort-menu-list">
                        {sortOptions.map((option) => {
                            // Lấy component Icon từ định nghĩa
                            const IconComponent = option.icon;
                            return (
                                <li
                                    // Sử dụng key duy nhất và ổn định
                                    key={`${option.column}-${option.order}`}
                                    className={`sort-menu-item ${isActive(option.column, option.order) ? 'active' : ''}`}
                                    onClick={() => {
                                        if (!isActive(option.column, option.order)) {
                                            handleSortChange(option.column, option.order);
                                        }
                                    }}
                                >
                                    <IconComponent
                                        className="sort-menu-icon"
                                        size={20}
                                    />
                                    <span className="sort-menu-text">
                                        {option.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default SortMenu;