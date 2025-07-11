# modules/financehub/backend/core/fetchers/macro/fed_yield_curve.py
import httpx
import pandas as pd
import io
# from modules.financehub.backend.core.fetchers.common.base_fetcher import get_latest_from_to_df
from modules.financehub.backend.utils.logger_config import get_logger

logger = get_logger(__name__)

# This is the direct link to the CSV data mentioned in the research paper
DATA_URL = "https://www.federalreserve.gov/data/yield-curve-tables/feds200628.csv"

class FedYieldCurveError(Exception):
    """Custom exception for FED yield curve fetcher."""

# async def fetch_fed_yield_curve_historical(start_date: date, end_date: date) -> list:
#     """
#     Fetch historical daily FED yield curve data from the Treasury.gov API.
#     """
#     return []

async def fetch_fed_yield_curve_historical() -> pd.DataFrame:
    """
    Fetches the entire historical U.S. Treasury yield curve data from the
    Federal Reserve's website as a pandas DataFrame.

    The data is based on the Gürkaynak, Sack, and Wright (2006) model.

    Returns:
        pd.DataFrame: A DataFrame with 'Date' as the index and Treasury
                      maturities as columns.
    """
    logger.info("Fetching historical U.S. Treasury yield curve data from Federal Reserve.")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(DATA_URL, timeout=30.0)
            response.raise_for_status()

            # The CSV is not perfectly formatted, it has header text to skip.
            # We need to find the line where the actual data starts.
            content = response.text
            lines = content.splitlines()
            
            # Find the header row, which starts with "Date"
            header_row_index = -1
            for i, line in enumerate(lines):
                stripped = line.strip()
                # Remove an optional leading quote and compare case-insensitively
                lower_stripped = stripped.lstrip('"').lower()
                if lower_stripped.startswith('date'):
                    header_row_index = i
                    break
            
            if header_row_index == -1:
                raise FedYieldCurveError("Could not find the header row in the CSV data.")

            # Re-join the lines from the header onwards to read into pandas
            csv_data = "\n".join(lines[header_row_index:])

            df = pd.read_csv(io.StringIO(csv_data))
 
            # ------------------------------------------------------------------
            # 1) Normalise column names
            # ------------------------------------------------------------------
            # The official FEDS dataset (Gürkaynak, Sack & Wright model) uses the
            # SVENYxx convention – e.g. SVENY01 = 1-year zero-coupon yield.
            # For front-end consumption we expose the plain tenor ("1Y", "2Y", …).
            rename_map = {
                # Zero-coupon yields (annualised % pa)
                "SVENY01": "1Y",
                "SVENY02": "2Y",
                "SVENY03": "3Y",
                "SVENY05": "5Y",
                "SVENY07": "7Y",
                "SVENY10": "10Y",
                "SVENY20": "20Y",
                "SVENY30": "30Y",
            }

            # Some CSV revisions use lowercase column names – handle case-insensitively
            lowercase_map = {k.lower(): v for k, v in rename_map.items()}
            df.rename(columns=lambda c: rename_map.get(c, lowercase_map.get(c.lower(), c)), inplace=True)

            # ------------------------------------------------------------------
            # 2) Keep only the renamed maturity columns and drop others (e.g. std-dev
            #    columns, metadata) to minimise payload size.
            # ------------------------------------------------------------------
            KEEP_COLS = list(rename_map.values())
            df = df[[c for c in df.columns if c in KEEP_COLS]]

            # ------------------------------------------------------------------
            # 3) Convert Date column to datetime index and coerce numeric values
            # ------------------------------------------------------------------
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
            df.dropna(subset=['Date'], inplace=True)
            df.set_index('Date', inplace=True)

            # Coerce all yield values to float and replace non-finite values with NaN
            df = df.apply(pd.to_numeric, errors='coerce')

            logger.info("Parsed %s rows of UST yield curve data with columns: %s", len(df), list(df.columns))
            return df

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error while fetching FED yield curve data: {e}")
        raise FedYieldCurveError(f"HTTP error fetching data: {e.response.status_code}") from e
    except Exception as e:
        logger.error(f"An unexpected error occurred while fetching FED yield curve data: {e}", exc_info=True)
        raise FedYieldCurveError("An unexpected error occurred.") from e

if __name__ == '__main__':
    import asyncio

    async def main():
        try:
            yield_curve_df = await fetch_fed_yield_curve_historical()
            print("Successfully fetched data:")
            print(yield_curve_df.head())
            print("\nLatest data point:")
            print(yield_curve_df.iloc[-1])
        except FedYieldCurveError as e:
            print(f"Error: {e}")

    asyncio.run(main()) 