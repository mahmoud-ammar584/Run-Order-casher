import React from 'react';
import clsx from 'clsx';
import './Table.css';

interface TableProps {
    headers: string[];
    children: React.ReactNode;
    className?: string;
}

const Table: React.FC<TableProps> = ({ headers, children, className }) => {
    return (
        <div className={clsx('table-container', className)}>
            <table className="custom-table">
                <thead>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
