from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import sys
import asyncio
import warnings
warnings.filterwarnings('ignore', category=UserWarning, message='TypedStorage is deprecated')

class ArticleRequest(BaseModel):
    url: str

model_name = "google/pegasus-cnn_dailymail"
tokenizer = PegasusTokenizer.from_pretrained(model_name)
model = PegasusForConditionalGeneration.from_pretrained(model_name)

async def fetch_article(url: str) -> str:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        results = soup.find_all(['h1', 'p'])
        article_text = ' '.join([r.get_text() for r in results])
        return article_text
    except requests.RequestException as e:
        raise Exception(f"Error fetching article: {str(e)}")

def summarize_article(text: str) -> str:
    tokens = tokenizer(text, truncation=True, padding='longest', return_tensors="pt")
    summary_ids = model.generate(
        tokens['input_ids'],
        min_length=50,
        max_length=150,
        length_penalty=2.0,
        num_beams=10,  
        early_stopping=True
    )
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

async def summarize_article_endpoint(article: ArticleRequest):
    article_text = await fetch_article(article.url)
    summary = summarize_article(article_text)
    summary = summary.replace('<n>', '')
    return  summary

async def main(url):
    try:
        article_request = ArticleRequest(url=url)
        summary = await summarize_article_endpoint(article_request)
        print(summary)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
    
url = sys.argv[1]
asyncio.run(main(url))
