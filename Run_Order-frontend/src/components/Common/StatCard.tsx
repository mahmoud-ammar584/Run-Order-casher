import React from 'react';
import Card from './Card';
import './StatCard.css';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    delta?: {
        value: string;
        trend: 'up' | 'down' | 'neutral';
    };
    subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, delta, subtext }) => {
    return (
        <Card className="stat-card" noPadding>
            <div className="stat-card-content">
                <div className="stat-card-top">
                    <div className="stat-card-info">
                        <span className="stat-card-title">{title}</span>
                        <div className="stat-card-value">{value}</div>
                    </div>
                    <div className="stat-card-icon-wrapper">
                        {icon}
                    </div>
                </div>

                {(delta || subtext) && (
                    <div className="stat-card-bottom">
                        {delta && (
                            <div className={`stat-delta ${delta.trend}`}>
                                {delta.trend === 'up' && <ArrowUpRight size={14} />}
                                {delta.trend === 'down' && <ArrowDownRight size={14} />}
                                <span>{delta.value}</span>
                            </div>
                        )}
                        {subtext && <span className="stat-subtext">{subtext}</span>}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatCard;
