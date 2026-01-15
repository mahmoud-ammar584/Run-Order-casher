import React from 'react';
import clsx from 'clsx';
import './Badge.css';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
    size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className, size = 'md' }) => {
    return (
        <span className={clsx('badge', `badge-${variant}`, `badge-${size}`, className)}>
            {children}
        </span>
    );
};

export default Badge;
