import functools
import datetime

def log_results(template_type):
    def decorator(func):
        @functools.wraps(func)  # Preserves function metadata
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                
                # Logging with metadata
                timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                input_length = len(args[0]) if args else 0  # Assuming the input text is the first argument
                output_length = len(result)
                
                log_message = f"[{timestamp}] Type: {template_type}, Input Length: {input_length}, Output Length: {output_length}, Result: {result}"
                # You can replace the print statement with any other logging mechanism like writing to a file or a database.
                print(log_message)

                return result
            except Exception as e:
                # Handle exceptions and log them
                print(f"Error processing with template type {template_type}: {e}")
                return None
        return wrapper
    return decorator
