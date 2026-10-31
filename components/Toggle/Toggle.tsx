'use client';

import { useState } from 'react';
import './Toggle.css';

export default function Toggle() {
    const [isOn, setIsOn] = useState(false);

    return (
        <div 
            className={`toggle-wrapper ${isOn ? 'active' : ''}`} 
            onClick={() => setIsOn(!isOn)}
        >
            <div className="toggle-handle"></div>
        </div>
    );
}