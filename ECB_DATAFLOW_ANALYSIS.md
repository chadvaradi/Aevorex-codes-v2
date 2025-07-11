# ECB Adatforrások Elemzése - 2025.07.12

## Jelenlegi Használat

### Használt ECB Dataflow-k a FinanceHub-ban:

1. **FM (Financial Markets)** - Pénzügyi piacok
   - Használt series: Policy rates (MRR, DFR, MLFR)
   - Adatok: Alapkamat, betéti kamat, marginális hitelezési kamat

2. **YC (Yield Curves)** - Hozamgörbék
   - Használt series: Különböző lejáratú hozamok
   - Adatok: 1Y, 2Y, 3Y, 5Y, 10Y hozamok

3. **EXR (Exchange Rates)** - Árfolyamok
   - Használt series: Főbb valuták EUR ellen
   - Adatok: USD, GBP, JPY, CHF árfolyamok

4. **BSI (Balance Sheet Items)** - Mérlegadatok
   - Használt series: M1, M2, M3 monetáris aggregátumok
   - Adatok: Pénzmennyiség mutatók

5. **ICP (Index of Consumer Prices)** - Fogyasztói árak
   - Használt series: HICP overall, core, energy
   - Adatok: Infláció mutatók

6. **MIR (Monetary & Financial Institutions Interest Rates)** - Kamatstatisztikák
   - Használt series: Háztartási és vállalati betéti/hitelkamatok
   - Adatok: Banki kamatok különböző szegmensekben
7. **BOP (Balance of Payments)** - Fizetési mérleg
   - Használt series: Current account balance, trade balance
   - Adatok: Import, export, finanszírozási tranzakciók
8. **STS (Short-Term Statistics)** - Rövid távú statisztikák
   - Használt series: GDP, employment, PMI
   - Adatok: Gazdasági aktivitás mutatók
9. **SEC (Securities)** - Értékpapír statisztikák
   - Használt series: Debt securities issuance
   - Adatok: Bond market volumes
10. **IVF (Investment Funds)** - Befektetési alapok
    - Használt series: AUM, flows
    - Adatok: Alap eszközallokáció
11. **CBD (Consolidated Banking Data)** - Konszolidált banki adatok
    - Használt series: Tier1 ratio, ROE
    - Adatok: Banki stabilitás mutatók
12. **RPP (Residential Property Prices)** - Lakásárak
    - Használt series: Price index
    - Adatok: Housing market árak
13. **CPP (Commercial Property Prices)** - Kereskedelmi ingatlanárak
    - Használt series: Price index
    - Adatok: Iroda / retail ingatlan árak
14. **BLS (Bank Lending Survey)** - Banki hitelezési felmérés
    - Használt series: Lending conditions index
    - Adatok: Credit supply/demand
15. **SPF (Survey of Professional Forecasters)** - Előrejelzések
    - Használt series: Inflation expectations
    - Adatok: Forecasts
16. **CISS (Composite Indicator of Systemic Stress)** - Pénzügyi stressz
    - Használt series: Systemic stress index
    - Adatok: Stressz szint
17. **TRD (External Trade)** - Külső kereskedelem
    - Használt series: Exports, imports
    - Adatok: Trade statistics
18. **PSS (Payment Systems Statistics)** - Fizetési rendszer statisztikák
    - Használt series: Payments volume
    - Adatok: Fizetési rendszer aktivitás
19. **IRS (Interest Rate Statistics)** - Kamatstatisztikák
    - Használt series: Swap rates
    - Adatok: Piaci kamatok

## Elérhető de Nem Használt ECB Dataflow-k

### Magas Prioritású (Azonnal Implementálható):

1. **BOP (Balance of Payments)** - Fizetési mérleg
   - Lehetőség: Külkereskedelmi adatok, tőkeáramlások
   - Használat: Makrogazdasági elemzések

2. **STS (Short-Term Statistics)** - Rövid távú statisztikák
   - Lehetőség: GDP, foglalkoztatás, üzleti mutatók
   - Használat: Gazdasági növekedés tracking

3. **SEC (Securities)** - Értékpapírok
   - Lehetőség: Kötvény kibocsátások, értékpapír statisztikák
   - Használat: Tőkepiaci elemzések

4. **IVF (Investment Funds)** - Befektetési alapok
   - Lehetőség: Alap statisztikák, eszközallokáció
   - Használat: Befektetési trend elemzések

5. **CBD (Consolidated Banking Data)** - Konszolidált banki adatok
   - Lehetőség: Banki szektor egészségügyi mutatók
   - Használat: Pénzügyi stabilitás elemzések

### Közepes Prioritású:

6. **RPP (Residential Property Prices)** - Lakásárak
   - Lehetőség: Ingatlanpiaci trendek
   - Használat: Ingatlan befektetési elemzések

7. **CPP (Commercial Property Prices)** - Kereskedelmi ingatlanárak
   - Lehetőség: Kereskedelmi ingatlan trendek
   - Használat: Kereskedelmi ingatlan elemzések

8. **BLS (Bank Lending Survey)** - Banki hitelezési felmérés
   - Lehetőség: Hitelezési kondíciók, kereslet/kínálat
   - Használat: Hitelpiaci elemzések

9. **SPF (Survey of Professional Forecasters)** - Szakértői előrejelzések
   - Lehetőség: Makrogazdasági várakozások
   - Használat: Előrejelzési modellek

10. **CISS (Composite Indicator of Systemic Stress)** - Szisztémás stressz mutató
    - Lehetőség: Pénzügyi stressz mérése
    - Használat: Kockázatelemzés

### Speciális Területek:

11. **EST (Euro Short-Term Rate)** - ESTR kamat
    - Lehetőség: Rövid távú referencia kamat
    - Használat: Pénzpiaci elemzések

12. **EON (EONIA)** - EONIA kamat (megszűnt)
    - Lehetőség: Történelmi adatok
    - Használat: Történelmi elemzések

13. **IRS (Interest Rate Statistics)** - Kamatstatisztikák
    - Lehetőség: Részletes kamat bontások
    - Használat: Kamatpiaci elemzések

14. **TRD (External Trade)** - Külkereskedelem
    - Lehetőség: Import/export adatok
    - Használat: Kereskedelmi elemzések

15. **PSS (Payment Systems Statistics)** - Fizetési rendszer statisztikák
    - Lehetőség: Fizetési forgalom adatok
    - Használat: Fizetési trend elemzések

## Tesztelt API Válaszok

### Működő Endpointok:
- ✅ FM (Financial Markets): Policy rates adatok elérhetők
- ✅ EXR (Exchange Rates): Árfolyam adatok elérhetők
- ✅ BSI (Balance Sheet Items): Monetáris aggregátumok elérhetők
- ✅ ICP (Consumer Prices): Inflációs adatok elérhetők
- ✅ MIR (Interest Rates): Banki kamatok elérhetők

### API Formátum:
```
https://data-api.ecb.europa.eu/service/data/{DATAFLOW}/{SERIES_KEY}?startPeriod={START}&endPeriod={END}&format=jsondata
```

## Implementációs Javaslatok

### 1. Azonnali Bővítések (1-2 hét):
- BOP (Balance of Payments) integráció
- STS (Short-Term Statistics) GDP és foglalkoztatási adatok
- SEC (Securities) kötvénypiaci adatok

### 2. Közepes távú fejlesztések (1 hónap):
- RPP/CPP ingatlanpiaci adatok
- BLS hitelezési felmérés
- SPF előrejelzési adatok

### 3. Hosszú távú lehetőségek (3 hónap):
- CISS stressz indikátor
- Részletes szektorális bontások
- Országspecifikus adatok

## Technikai Megjegyzések

- Minden dataflow támogatja a JSON formátumot
- SDMX series key struktúra konzisztens
- Rate limiting: ~100 request/perc
- Historikus adatok: 1999-től elérhetők a legtöbb sorozatban
- Frissítési gyakoriság: naponta, hetente, havonta (series függő)

## Következő Lépések

1. ✅ Jelenlegi rendszer tesztelése
2. 🔄 Prioritásos dataflow-k implementálása
3. ⏳ Új endpointok létrehozása
4. ⏳ Frontend integráció
5. ⏳ Dokumentáció frissítése 