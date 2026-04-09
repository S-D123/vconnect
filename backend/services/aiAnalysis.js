require('dotenv').config();

// Helper function with Auto-Retry for sleeping models
async function queryHuggingFace(modelUrl, data, retries = 2) {
    try {
        const response = await fetch(modelUrl, {
            headers: { 
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify(data),
        });
        
        const result = await response.json();

        // If the model is sleeping, Hugging Face returns an "estimated_time"
        if (result.error && result.estimated_time && retries > 0) {
            console.log(`[AI] Model is waking up. Waiting ${Math.round(result.estimated_time)} seconds...`);
            // Wait for the estimated time (capped at 15 seconds to not hang your server forever)
            const waitTime = Math.min(result.estimated_time * 1000, 15000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            // Try again!
            return await queryHuggingFace(modelUrl, data, retries - 1);
        }

        // If there's a different API error (like a bad token), print it
        if (result.error) {
            console.error("[AI] Hugging Face Error:", result.error);
        }

        return result;
    } catch (err) {
        console.error("[AI] Network Error:", err);
        return null;
    }
}

async function analyzeComment(text) {
    const sentimentModel = "https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english";
    const emotionModel = "https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base";
    // 1. Get Sentiment (Positive/Negative)
    const sentimentResult = await queryHuggingFace(sentimentModel, { inputs: text });
    
    // 2. Get Emotion (Joy, Anger, Sadness, etc.)
    const emotionResult = await queryHuggingFace(emotionModel, { inputs: text });

    let sentiment = "neutral";
    let sentiment_score = 0.5;
    let emotion = "neutral";
    let toxicity_score = 0.0;

    // Safely parse sentiment
    if (sentimentResult && Array.isArray(sentimentResult[0])) {
        const topSentiment = sentimentResult[0].reduce((prev, current) => (prev.score > current.score) ? prev : current);
        sentiment = topSentiment.label.toLowerCase();
        sentiment_score = topSentiment.score;
        
        if (sentiment === 'negative') {
            toxicity_score += (sentiment_score * 0.4); 
        }
    }

    // Safely parse emotion
    if (emotionResult && Array.isArray(emotionResult[0])) {
        const topEmotion = emotionResult[0].reduce((prev, current) => (prev.score > current.score) ? prev : current);
        emotion = topEmotion.label.toLowerCase();
        
        if (emotion === 'anger' || emotion === 'disgust') {
            toxicity_score += 0.5;
        }
    }

    toxicity_score = Math.min(toxicity_score, 1.0);

    return { sentiment, sentiment_score, toxicity_score, emotion };
}

module.exports = { analyzeComment };