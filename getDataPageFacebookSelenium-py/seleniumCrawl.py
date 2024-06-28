import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.expected_conditions import presence_of_element_located
from selenium.webdriver.firefox.options import Options

options = Options()
options.add_argument('--headless')

driver = webdriver.Firefox(options=options)
processed_contents = set()

# Specify the URL of the Facebook group
url = 'https://www.facebook.com/groups/shipperdanang'

# Navigate to the Facebook group page
driver.get(url)

# Loop to continuously fetch data every second
try:
    while True:
        # Example: Fetch post contents with dir="auto"
        posts = driver.find_elements(
            By.CSS_SELECTOR, 'div.html-div[dir="auto"]')
        posts_span = driver.find_elements(
            By.XPATH, '//span[contains(@class, "html-span")]//a[@role="link"]')
        span_elements = driver.find_elements(By.XPATH, "//strong/span")

        for post, post_span, span_element in zip(posts, posts_span, span_elements):
            href_feeds = post_span.get_attribute('href')
            content = post.text.strip()
            unwanted_phrases = [
                "Nơi để các chủ shop và các shipper Đà Nẵng tìm nhau.",
                "Group chỉ tiếp nhận thành viên vào đăng bài tìm ship hoặc tìm đơn để ship, còn bất cứ thể… Xem thêm"
            ]
            if not any(phrase in content for phrase in unwanted_phrases):
                if content not in processed_contents:
                    processed_contents.add(content)
                    print('name>>>>:', span_element.text.strip())
                    print('content>>>>:', content)
                    print('link_Posts>>>>:', href_feeds)

        # Sleep for 1 second before the next fetch
        time.sleep(1)

        # Refresh the page to get new data
        driver.refresh()


except KeyboardInterrupt:
    print("Stopping the crawler...")

finally:
    driver.quit()
