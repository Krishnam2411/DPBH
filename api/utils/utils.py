import os
import csv
from pathlib import Path

# Saves scraped data to ../data/{filename}
def save_to_csv(folder_path, filename, data):
    file_path = os.path.join(folder_path, filename)
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile, delimiter='\n', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow(data)

    print(f'Data successfully saved to {file_path} in CSV format')

# Creates filename for scraped data
def url_to_filename(url):
    filename = ''.join(c for c in url if c.isalnum() or c in ['_', '-'])
    # Ensure the filename is not empty
    if not filename:
        filename = "default_filename"
    # Ensure the filename length limits to 30 chars
    filename = filename[:30]
    return filename




# file_path = Path("example.txt")
# contents = "This is the content of the file."

# # Check if the file exists
# if file_path.exists():
#     print(f"The file {file_path} already exists. Overwriting.")

# # Open the file in write mode ('w')
# with file_path.open('w') as file:
#     # Write the contents to the file
#     file.write(contents)

# print(f"File {file_path} created/overwritten successfully.")
