import React from 'react';

interface SectionNavItem {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
}

interface SectionNavProps {
  items: SectionNavItem[];
  onItemClick?: (item: SectionNavItem) => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({ 
  items, 
  onItemClick 
}) => {
  return (
    <nav className="section-nav">
      <ul className="section-nav__list">
        {items.map((item) => (
          <li key={item.id} className="section-nav__item">
            <a
              href={item.href || `#${item.id}`}
              className={`section-nav__link ${item.active ? 'section-nav__link--active' : ''}`}
              onClick={(e) => {
                if (onItemClick) {
                  e.preventDefault();
                  onItemClick(item);
                }
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}; 