import './SearchInput.css';
import { InputHTMLAttributes, useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Loading from './loading/loading';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
    loading?: boolean;
    onClear?: () => void;
}

const CSS_CLASS = "search-input";

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    loading = false,
    onClear,
    ...props
}: SearchInputProps) => {
    const [inputValue, setInputValue] = useState(value || '');

    // Hàm thay đổi dữ liệu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onChange?.(e);
    };

    // Hàm xóa dữ liệu
    const handleClear = () => {
        setInputValue('');

        // Tạo event
        const event = {
            target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>;

        // Gọi hàm thay đổi dữ liệu
        onChange?.(event);
        onClear?.();

        // Focus vào input
        const inputElement = document.querySelector('input');
        if (inputElement) {
            inputElement.focus();
        }
    };

    return (
        <div className={`search-container `}>
            <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    value={inputValue}
                    onChange={handleChange}
                    {...props}
                />
                {loading ? (
                    <div className="loading-icon">
                        <Loading size="16px" color="#94a3b8" />
                    </div>
                ) : inputValue ? (
                    <FaTimes
                        className="clear-icon"
                        onClick={handleClear}
                    />
                ) : null}
            </div>
        </div>
    )
}

export default SearchInput;
