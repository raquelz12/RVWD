import './SearchBar.css';

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
    className?: string;
}

export default function SearchBar({ placeholder = 'Buscar...', value = '', onChange = (): void => {}, autoFocus, className = '' }: SearchBarProps) {
    return (
        <div className={`search-bar ${className}`}>
            <img src="/magnifying-glass-solid-full.svg" alt="" className="search-icon" />
            {/* El placeholder desaparece al escribir: aria-label para que el campo siga teniendo nombre */}
            <input type="text" className="search-input" placeholder={placeholder} aria-label={placeholder} value={value} onChange={onChange} autoFocus={autoFocus} />
        </div>
    );
}