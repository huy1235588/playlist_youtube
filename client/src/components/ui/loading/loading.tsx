import './loading.css';

interface LoadingProps {
    size?: string; // Kích thước của spinner
    speed?: number; // Tốc độ quay của spinner
    color?: string; // Màu sắc của spinner
}

const Loading: React.FC<LoadingProps> = ({
    size = "2.8rem",
    speed = 1, // Tốc độ quay của spinner
    color = "#000"
}) => {
    return (
        <div className="dot-spinner"
            style={{
                "--uib-size": `${size}`, // Kích thước của spinner
                "--uib-speed": `${speed}s`, // Tốc độ quay của spinner
                "--uib-color": color, // Màu sắc của spinner
            } as React.CSSProperties}
        >
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
            <div className="dot-spinner__dot"></div>
        </div>
    );
}

export default Loading;