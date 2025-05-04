interface ManagementPageHeaderProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const ManagementPageHeader = ({ title, description, children }: ManagementPageHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            {children}
        </div>
    );
};

export default ManagementPageHeader;
