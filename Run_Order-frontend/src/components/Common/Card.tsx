import React from 'react';
import clsx from 'clsx';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className,
    title,
    subtitle,
    action,
    noPadding = false
}) => {
    return (
        <div className={clsx('card-container', className)}>
            {(title || action) && (
                <div className="card-header">
                    <div className="card-header-titles">
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {action && <div className="card-action">{action}</div>}
                </div>
            )}
            <div className={clsx('card-content', { 'no-padding': noPadding })}>
                {children}
            </div>
        </div>
    );
};

export default Card;
