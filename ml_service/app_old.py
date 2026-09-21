from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI(title="Real Estate ML Service")

class PredictionRequest(BaseModel):
    region_id: int
    historical_prices: list[float]
    months_ahead: int = 3

class PredictionResponse(BaseModel):
    region_id: int
    current_price: float
    predicted_price: float
    confidence: float
    factors: list[str]

@app.get("/")
def health():
    return {"status": "ML service running"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(request: PredictionRequest):

    # ✅ VALIDATION
    if len(request.historical_prices) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 historical prices are required"
        )

    try:
        prices = np.array(request.historical_prices, dtype=float)

        X = np.arange(len(prices)).reshape(-1, 1)
        y = prices

        model = LinearRegression()
        model.fit(X, y)

        future_X = np.array([[len(prices) + request.months_ahead - 1]])
        predicted_price = float(model.predict(future_X)[0])

        confidence = max(model.score(X, y), 0.0) * 100
        trend = model.coef_[0]

        return PredictionResponse(
            region_id=request.region_id,
            current_price=float(prices[-1]),
            predicted_price=predicted_price,
            confidence=confidence,
            factors=[
                f"Monthly trend: ${trend:.2f}",
                f"Model accuracy: {confidence:.1f}%",
                f"Based on {len(prices)} data points",
            ],
        )

    except Exception as e:
        # 🔥 REAL ERROR LOG
        print("ML ERROR:", repr(e))
        raise HTTPException(status_code=500, detail="Prediction failed")
