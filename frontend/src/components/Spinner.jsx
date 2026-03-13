const Spinner = ({ size = 'md' }) => {
    const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizes[size]} animate-spin rounded-full border-4 border-primary-200 border-t-primary-500`}
            />
        </div>
    );
};

export default Spinner;
