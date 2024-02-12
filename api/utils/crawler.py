import requests
from bs4 import BeautifulSoup
from utils.utils import save_to_csv, url_to_filename
import re
import os

CSV_FOLDER_PATH = os.path.join(os.getcwd(), "data/raw")


def simple_web_crawler(url):
    try:
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            print(f'crawled data from {url}')
            # Parse the HTML content of the page
            soup = BeautifulSoup(response.text, 'html.parser')
            # Extract the inner text
            inner_text = soup.get_text()

            # Extract inner text from specific HTML elements
            # inner_text = '\n'.join(element.get_text(strip=True) for element in relevant_elements)


            save_to_csv(CSV_FOLDER_PATH, url_to_filename(url)+'.csv', split_text_elements(url, inner_text))
        else:
            print(f"Failed to retrieve the page. Status code: {response.status_code}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

def split_text_elements(url, text):
  empty_line_split = re.split(r"\s*\n\s*", text)  # Split on empty lines with surrounding spaces
  filtered_elements = [element.strip() for element in empty_line_split]  # Remove leading/trailing spaces
  return [url]+[element for element in filtered_elements if len(element.split()) > 2] # Filter elements with 3+ words

def crawl(file_path):
    try:
        # Read URLs from the file
        with open(file_path, 'r') as file:
            urls = [line.strip() for line in file.readlines()]
        # Process each URL
        for url in urls:
            simple_web_crawler(url)
        # # Delete the contents of the file
        # with open(file_path, 'w') as file:
        #     file.truncate(0)
        print(f"All URLs processed from {file_path}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")