export default function InputError({ message, className = '', ...props }) {
    const text = !message
        ? ''
        : Array.isArray(message)
          ? message[0]
          : message;
    return text ? (
        <p
            {...props}
            className={'text-sm text-red-600 ' + className}
        >
            {text}
        </p>
    ) : null;
}
