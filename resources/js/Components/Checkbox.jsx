export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-brand-light/50 text-brand-primary shadow-sm focus:ring-brand-primary ' +
                className
            }
        />
    );
}
