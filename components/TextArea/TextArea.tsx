import './TextArea.css';

/* Acepta cualquier atributo de <textarea> (id, maxLength, aria-label, required...), como Input */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextArea({ rows = 4, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`textarea ${className}`.trim()}
      rows={rows}
      {...props}
    />
  );
}
