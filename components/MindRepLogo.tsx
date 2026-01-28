import React from 'react';

interface MindRepLogoProps {
    className?: string;
    variant?: 'dark' | 'light';
}

const MindRepLogo: React.FC<MindRepLogoProps> = ({ className = "w-8 h-8", variant = 'light' }) => {
    const mainColor = variant === 'light' ? 'black' : 'white';
    const accentColor = '#1d4ed8'; // blue-700

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Left Block */}
            <path
                d="M20 80L35 20H45L30 80H20Z"
                fill={mainColor}
            />
            {/* Right Block */}
            <path
                d="M80 80L65 20H55L70 80H80Z"
                fill={mainColor}
            />
            {/* Center Link (Mind-Body Connection) */}
            <rect
                x="48"
                y="25"
                width="4"
                height="50"
                fill={accentColor}
            />
        </svg>
    );
};

export default MindRepLogo;
