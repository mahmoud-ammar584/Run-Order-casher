import React from 'react';
import clsx from 'clsx';
import './Skeleton.css';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, width, height, circle }) => {
    const style = {
        width,
        height,
        borderRadius: circle ? '50%' : undefined,
    };

    return <div className={clsx('skeleton', className)} style={style} />;
};

export default Skeleton;
