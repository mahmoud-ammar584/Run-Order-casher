import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import './Button.css'; // We will create this or use inline styles with vars

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    leftIcon,
    rightIcon,
    ...props
}) => {
    return (
        <button
            className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="btn-spinner" size={18} />}
            {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
        </button>
    );
};

export default Button;
