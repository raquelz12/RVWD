import Link from 'next/link';
import { BreadcrumbItem } from '../../src/utils/breadcrumbs';
import './Breadcrumbs.css';

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Migas de pan">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumb-item">
              {item.href ? (
                <Link href={item.href} className="breadcrumb-link" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb-label" aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              )}

              {!isLast && (
                <span className="breadcrumb-separator" aria-hidden="true">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
