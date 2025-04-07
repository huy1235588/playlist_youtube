import './SearchInput.css';
import { InputHTMLAttributes, useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> { }

const SearchInput = ({ value, onChange, ...props }: SearchInputProps) => {
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

        // Focus vào input
        const inputElement = document.querySelector('input');
        if (inputElement) {
            inputElement.focus();
        }
    };

    return (
        <div className="search-container">
            <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    value={inputValue}
                    onChange={handleChange}
                    {...props}
                />
                {inputValue && (
                    <FaTimes
                        className="clear-icon"
                        onClick={handleClear}
                    />
                )}
            </div>
        </div>
    )
}

export default SearchInput;
