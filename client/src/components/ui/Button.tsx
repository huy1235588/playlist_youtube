import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

const Button: React.FC<ButtonProps> = ({
    className = "",
    onClick,
    children,
    ...props
}) => {
    const startRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add("ripple");

        button.appendChild(circle);

        circle.addEventListener('animationend', () => {
            circle.remove();
        });
    };

    return (
        <button
            className={`button ${className}`}
            onClick={onClick}
            onMouseDown={startRipple}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;