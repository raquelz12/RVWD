import './Input.css';

/*Acepta cualquier atributo de <input> (id, name, autoComplete, required...), como Button*/
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    type: string;
}

export default function Input({ className = '', ...props }: InputProps) {
    return (
        <input
            className={`input ${className}`.trim()}
            {...props}
        />
    );
}
