import './InputForm.css'

function InputForm({
    type,
    input,
    setInput,
    onSubmit
}) {
    return (
        <form id='main' onSubmit={onSubmit}>
            <div id="search-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    height="24"
                    fill="none"
                    className="feather feather-search"
                >
                    <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                    <line
                        stroke="url(#searchl)"
                        y2="16.65"
                        y1="22"
                        x2="16.65"
                        x1="22"
                    ></line>
                    <defs>
                        <linearGradient gradientTransform="rotate(50)" id="search">
                            <stop stopColor="#f8e7f8" offset="0%"></stop>
                            <stop stopColor="#b6a9b7" offset="50%"></stop>
                        </linearGradient>
                        <linearGradient id="searchl">
                            <stop stopColor="#b6a9b7" offset="0%"></stop>
                            <stop stopColor="#837484" offset="50%"></stop>
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <input placeholder="Search..." className="input"
                type={type}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
            />

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