const HF_API = 'https://router.huggingface.co/hf-inference/models';

const MODEL_SENTIMENT = 'distilbert/distilbert-base-uncased-finetuned-sst-2-english';
const MODEL_EMOTION = 'j-hartmann/emotion-english-distilroberta-base';
const MODEL_TOXICITY = 'unitary/toxic-bert';

// Helper function with Auto-Retry for sleeping models
async function hfInfer(model, inputs, token, retries = 2) {
    const res = await fetch(`${HF_API}/${model}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs }),
    });

    const result = await res.json();

    // If the model is sleeping, Hugging Face returns an "estimated_time"
    if (result.error && result.estimated_time && retries > 0) {
        console.log(`[AI] ${model} is waking up. Waiting ${Math.round(result.estimated_time)} seconds...`);
        const waitTime = Math.min(result.estimated_time * 1000, 15000); // Capped at 15 seconds
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return await hfInfer(model, inputs, token, retries - 1);
    }

    if (!res.ok) {
        throw new Error(`${model}: ${res.status} ${result.error || 'Unknown error'}`);
    }

    return result;
}

function parseSentiment(hfResult) {
    if (Array.isArray(hfResult) && hfResult.length > 0) {
        const first = hfResult[0];
        if (Array.isArray(first) && first[0]?.label) {
            const top = first.reduce((a, b) => (a.score > b.score ? a : b));
            return { label: top.label, score: top.score };
        }
        if (first?.label && typeof first.score === 'number') {
            const top = hfResult.reduce((a, b) => (a.score > b.score ? a : b));
            return { label: top.label, score: top.score };
        }
    }
    if (hfResult?.label && typeof hfResult.score === 'number') {
        return { label: hfResult.label, score: hfResult.score };
    }
    return { label: 'NEUTRAL', score: 0.5 };
}

function parseEmotion(hfResult) {
    if (Array.isArray(hfResult) && hfResult[0]?.length) {
        const scores = hfResult[0];
        const top = scores.reduce((a, b) => (a.score > b.score ? a : b));
        return { label: top.label.toLowerCase(), score: top.score };
    }
    if (hfResult?.label) {
        return { label: String(hfResult.label).toLowerCase(), score: hfResult.score ?? 0 };
    }
    return { label: 'neutral', score: 0 };
}

function parseToxicity(hfResult) {
    const row = Array.isArray(hfResult) ? hfResult[0] : hfResult;
    if (!row) return 0;
    const labels = Array.isArray(row) ? row : [row];
    const toxic = labels.find((l) => l.label?.toLowerCase() === 'toxic');
    
    if (toxic && typeof toxic.score === 'number') {
        return Math.min(1, Math.max(0, toxic.score));
    }
    
    const maxScore = labels.reduce((m, l) => Math.max(m, l.score ?? 0), 0);
    return Math.min(1, Math.max(0, maxScore));
}

/**
 * Runs analysis and returns fields for comment_analysis row.
 * On HF failure, returns safe defaults so the app does not crash.
 */
export async function analyzeCommentText(text) {
    const token = process.env.HUGGINGFACE_API_KEY;
    const trimmed = (text || '').trim().slice(0, 2000);
    
    if (!trimmed) {
        return {
            sentiment: 'unknown',
            sentiment_score: null,
            toxicity_score: null,
            emotion: 'unknown',
        };
    }

    if (!token) {
        console.warn('HUGGINGFACE_API_KEY not set; skipping AI analysis.');
        return {
            sentiment: 'unknown',
            sentiment_score: null,
            toxicity_score: null,
            emotion: 'unknown',
        };
    }

    try {
        // 1. Fetch sentiment and emotion in parallel
        const [sentRaw, emoRaw] = await Promise.all([
            hfInfer(MODEL_SENTIMENT, trimmed, token),
            hfInfer(MODEL_EMOTION, trimmed, token),
        ]);

        const { label: sentiment, score: sentimentScore } = parseSentiment(sentRaw);
        const { label: emotion } = parseEmotion(emoRaw);

        const isNegative = String(sentiment).toLowerCase() === 'negative';
        const isBadEmotion = ['anger', 'disgust'].includes(emotion);

        let toxicityScore = null;
        
        // 2. Only run toxicity model if sentiment is negative or emotion is bad
        if (isNegative || isBadEmotion) {
            try {
                const toxRaw = await hfInfer(MODEL_TOXICITY, trimmed, token);
                toxicityScore = Math.min(1, parseToxicity(toxRaw));
            } catch (e) {
                console.error('Toxicity model failed:', e.message);
                // Fallback heuristic if toxicity API fails
                toxicityScore = Math.min(1, 0.35 + (1 - (sentimentScore ?? 0.5)) * 0.5);
            }
        } else {
            toxicityScore = 0;
        }

        return {
            sentiment: String(sentiment).toLowerCase(),
            sentiment_score: sentimentScore ?? null,
            toxicity_score: toxicityScore,
            emotion: emotion,
        };
    } catch (e) {
        console.error('Hugging Face analysis failed:', e.message);
        return {
            sentiment: 'unknown',
            sentiment_score: null,
            toxicity_score: null,
            emotion: 'unknown',
        };
    }
}