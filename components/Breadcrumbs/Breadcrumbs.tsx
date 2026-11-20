import Link from 'next/link';
import { BreadcrumbItem } from '../../src/utils/breadcrumbs';
import './Breadcrumbs.css';

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs">
      {items.map((item, index) => (
        <div key={index} className="breadcrumb-item">
          {item.href ? (
            <Link 
              href={item.href} 
              className="breadcrumb-link"
            >
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb-label">{item.label}</span>
          )}
          
          {index < items.length - 1 && (
            <span className="breadcrumb-separator">/</span>
          )}
        </div>
      ))}
    </nav>
  );
}