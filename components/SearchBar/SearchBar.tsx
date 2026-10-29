import './SearchBar.css';

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ placeholder = 'Buscar...', value = '', onChange = (): void => {} }: SearchBarProps) {
    return (
        <div className="search-bar">
            <img src="/magnifying-glass-solid-full.svg" alt="Buscar" className="search-icon" />
            <input type="text" className="search-input" placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    );
}