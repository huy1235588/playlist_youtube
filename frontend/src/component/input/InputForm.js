import './InputForm.css'
import { useRef, useState } from 'react';

function InputForm({
    placeholder,
    type,
    input,
    setInput,
    onSubmit
}) {
    const [showReset, setShowReset] = useState(false);
    const inputRef = useRef(null);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        setShowReset(e.target.value.length > 0);
    };

    const handleReset = () => {
        setInput('');
        setShowReset(false);
        inputRef.current.focus();
    };

    return (
        <form id='form-input' onSubmit={onSubmit}>
            <input id="messageInput"
                className="input"
                placeholder={placeholder}
                type={type}
                value={input}
                onChange={handleInputChange}
                ref={inputRef}
                required
            />

            {showReset && (
                <button id="resetButton" type='button' onClick={handleReset}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>
            )}

            <button id="sendButton" type='submit'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
                    <path
                        fill="none"
                        d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
                    ></path>
                    <path
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="33.67"
                        stroke="#6c6c6c"
                        d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
                    ></path>
                </svg>
            </button>

        </form>
    )
}

export default InputForm;