
const ErrorMessage = ({ message, className }) => {
    if (!message) return null;
    return (
        <div className={`error-message ${className}`}>
            <p>{message}</p>
        </div>
    );
}
export default ErrorMessage;