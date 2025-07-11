# Aevorex_codes/modules/financehub/backend/core/mappers/eodhd/news.py
from __future__ import annotations

import pandas as pd
from typing import TYPE_CHECKING

from modules.financehub.backend.core.mappers._mapper_base import logger
from modules.financehub.backend.core.helpers import _clean_value, normalize_url

if TYPE_CHECKING:
    from ....models import NewsItem

def map_eodhd_news_data_to_models(
    news_df: pd.DataFrame | None,
    request_id: str
) -> list['NewsItem'] | None:
    from ....models import NewsItem
    func_name = "map_eodhd_news_data_to_models"
    log_prefix = f"[{request_id}][{func_name}]"

    if not isinstance(news_df, pd.DataFrame) or news_df.empty:
        logger.info(f"{log_prefix} Input news_df is invalid or empty. Returning empty list.")
        return []

    news_models: list[NewsItem] = []
    
    expected_cols = {'date', 'title', 'content', 'link'}
    if not expected_cols.issubset(news_df.columns):
        missing_cols = expected_cols - set(news_df.columns)
        logger.error(f"{log_prefix} Missing expected columns in news DataFrame: {missing_cols}. Cannot process.")
        return None

    for index, row in news_df.iterrows():
        try:
            news_date_str = row['date']
            title = _clean_value(row['title'])
            content = _clean_value(row['content'])
            link = normalize_url(row['link'])
            
            if not all([news_date_str, title, content, link]):
                logger.warning(f"{log_prefix} Skipping news item at index {index} due to missing data.")
                continue

            news_data = {
                "article_date": pd.to_datetime(news_date_str).date(),
                "title": title,
                "summary": content,
                "article_url": link,
                "data_source": "eodhd"
            }
            news_models.append(NewsItem(**news_data))
        except Exception as e:
            logger.error(f"{log_prefix} Error processing news row at index {index}: {e}", exc_info=True)

    logger.info(f"{log_prefix} Successfully mapped {len(news_models)} news items.")
    return news_models 