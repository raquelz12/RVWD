import './Rvw.css';

interface RvwProps {
    /** La palabra de la marca tal cual, con R normal: "RVW", "RVWS" o "RVWD" */
    children: string;
    /** Clases extra; siempre lleva .RVWS (fuente de títulos, en globals.css) */
    className?: string;
}

/* Marca RVW / RVWS / RVWD con la R al revés.
   La R se gira con CSS en vez de escribir la Я cirílica: los lectores de pantalla leen
   la copia invisible ("RVWS") y no "ya-uve-uve-ese", y Ctrl+F encuentra la palabra */
export default function Rvw({ children, className = '' }: RvwProps) {
    const startsWithR = /^r/i.test(children);

    return (
        <span className={`RVWS ${className}`.trim()}>
            <span aria-hidden="true">
                {startsWithR ? (
                    <>
                        <span className="rvw-reversed-r">{children[0]}</span>
                        {children.slice(1)}
                    </>
                ) : children}
            </span>
            <span className="sr-only rvw-sr-text">{children}</span>
        </span>
    );
}
