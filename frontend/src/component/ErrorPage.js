import './ErrorPage.css'

import { useEffect, useRef } from 'react';

function ErrorPage({ errorMessage }) {
    const eyeRef1 = useRef(null);
    const eyeRef2 = useRef(null);

    useEffect(() => {
        const handleMouseMove = (event) => {
            const moveEye = (eye) => {
                const x = eye.offsetLeft + (eye.offsetWidth / 2);
                const y = eye.offsetTop + (eye.offsetHeight / 2);
                const rad = Math.atan2(event.pageX - x, event.pageY - y);
                const rot = (rad * (180 / Math.PI) * -1) + 180;
                eye.style.transform = `rotate(${rot}deg)`;
            };

            if (eyeRef1.current && eyeRef2.current) {
                moveEye(eyeRef1.current);
                moveEye(eyeRef2.current);
            }
        };

        document.body.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div id="error-page">
            <div>
                <span className='error-num'>5</span>
                <div className='error-eye' ref={eyeRef1}></div>
                <div className='error-eye' ref={eyeRef2}></div>
                <p className='error-text'>Error: {errorMessage}.</p>
                <a id="error-home-link" href='./' draggable="false">Go back</a>
            </div>
        </div>
    )
}

export default ErrorPage;
