# Endpoint ⇔ Frontend Call Matrix (Updated)
*Generated: 2025-01-22*

## Backend Endpoints Found

### Authentication
- `GET /api/v1/auth/status` → `useAuth.tsx:29`
- `POST /api/v1/auth/logout` → `useAuth.tsx:56`
- `GET /api/v1/auth/login` → (manual redirect)
- `GET /api/v1/auth/callback` → (OAuth callback)

### AI & Models
- `GET /api/v1/ai/models` → `useModelList.ts:16`

### Stock Data
- `GET /api/v1/stock/search` → `useSearchData.ts:18`
- `GET /api/v1/stock/ticker-tape` → `useTickerTape.ts:17`
- `GET /api/v1/stock/{ticker}/fundamentals` → `useFundamentals.ts:13`
- `GET /api/v1/stock/{ticker}/chart` → `useChartData.ts:26`
- `GET /api/v1/stock/{ticker}/news` → `useNews.ts:24`
- `GET /api/v1/stock/premium/{ticker}/summary` → `useAISummary.ts:15`
- `POST /api/v1/stock/chat/{ticker}` → (not used in frontend)
- `GET /api/v1/stock/chat/{ticker}/stream` → `useChatStream.ts` (SSE)

### Macro Data
- `GET /api/v1/macro/rates/all` → `useMacroRates.ts:27`
- `GET /api/v1/macro/ecb/rates` → (not directly used)
- `GET /api/v1/macro/ecb/yield-curve` → `useECBYieldCurve.ts:73`
- `GET /api/v1/macro/ecb/historical-yield-curve` → `useHistoricalYieldCurve.ts:18`
- `GET /api/v1/macro/bubor` → (covered by rates/all)
- `GET /api/v1/macro/forex/pairs` → (not used in frontend)
- `GET /api/v1/macro/forex/{pair}` → (not used in frontend)

### Market Data
- `GET /api/v1/market/news` → (not used in frontend)

### Health Check
- `GET /api/v1/health` → (referenced in Footer)

## Status Summary

✅ **Well Connected**: 12 endpoints with active frontend usage
⚠️ **Backend Only**: 8 endpoints without frontend integration
🔄 **SSE Streaming**: 1 endpoint using Server-Sent Events

## Recommendations

1. **Forex Integration**: Connect forex endpoints to frontend components
2. **Market News**: Integrate market news into dashboard
3. **Chat API**: Implement POST chat endpoint for user queries
4. **Cleanup**: Consider removing unused endpoints or document their purpose

## Architecture Notes

- All hooks use SWR for caching and revalidation
- Authentication uses session-based flow with Google OAuth
- Real-time data via SSE for AI chat streaming
- Consistent error handling across all API calls 