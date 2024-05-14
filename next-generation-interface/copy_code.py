import os

def write_file_with_comment(src, output_file):
    # Check if the source is a file and read content
    if os.path.isfile(src):
        with open(src, 'r') as file:
            content = file.readlines()
        
        # Write the content to the output file with a comment about the file path
        with open(output_file, 'a') as file:
            file.write(f"# {src}\n")
            file.writelines(content)
            file.write("\n\n")

def write_directory_contents(src_dir, output_file):
    # Process each file in the directory
    for filename in os.listdir(src_dir):
        src_path = os.path.join(src_dir, filename)
        write_file_with_comment(src_path, output_file)

def main():
    # Base folder
    base_folder = os.getcwd()

    # Files to copy
    files_to_copy = ['next.config.msj', 'package.json']
    
    # Directories to copy
    directories_to_copy = ['app', 'components']

    # Output file
    output_file = os.path.join(base_folder, 'collected_code.txt')

    # Ensure the output file is empty
    open(output_file, 'w').close()

    # Process individual files
    for file_name in files_to_copy:
        src_file_path = os.path.join(base_folder, file_name)
        write_file_with_comment(src_file_path, output_file)

    # Process directories
    for dir_name in directories_to_copy:
        src_dir_path = os.path.join(base_folder, dir_name)
        write_directory_contents(src_dir_path, output_file)

if __name__ == "__main__":
    main()