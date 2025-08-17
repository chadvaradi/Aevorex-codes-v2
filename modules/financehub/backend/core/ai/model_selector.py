from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

from modules.financehub.backend.config import settings


ModelChoice = dataclass

@dataclass
class SelectedModel:
    provider: Literal["openrouter"]
    model_id: str
    temperature: float
    max_output_tokens: int


def select_model(
    *,
    query_type: Literal["summary", "indicator", "news", "hybrid"],
    expected_context_tokens: int,
    plan: Literal["free", "pro", "team", "enterprise"],
) -> SelectedModel:
    """Pick a cost‑efficient model based on query type and context size.

    v1 heuristic:
    - summary/rapid → primary model
    - deep / large context → fallback to long‑context if configured, else primary
    """
    provider = "openrouter"
    primary = settings.AI.MODEL_NAME_PRIMARY or "openai/gpt-4o-mini"
    fallback = settings.AI.MODEL_NAME_FALLBACK or primary

    # crude threshold for large context selection
    large_ctx = expected_context_tokens >= 120_000
    model_id = fallback if large_ctx or query_type == "hybrid" else primary

    # temperature tuning by plan / type (conservative defaults)
    temp = (settings.AI.TEMPERATURE_PRIMARY or 0.35) if not large_ctx else (settings.AI.TEMPERATURE or 0.3)

    # output caps per plan
    if plan == "free":
        max_out = 700
    elif plan == "pro":
        max_out = 1500
    else:
        max_out = 2500

    return SelectedModel(provider=provider, model_id=model_id, temperature=temp, max_output_tokens=max_out)

