import './SearchBar.css';

interface SearchBarProps {
    placeholder?: string;
}

export default function SearchBar({ placeholder = "Busca canciones, usuarios, ..." }: SearchBarProps) {
    return (
        <div className="search-bar">
            <img src="/magnifying-glass-solid-full.svg" alt="Buscar" className="search-icon" />
            <input type="text" className="search-input" placeholder={placeholder} />
        </div>
    );
}