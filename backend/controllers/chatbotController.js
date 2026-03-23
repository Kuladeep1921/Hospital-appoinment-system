const Groq = require('groq-sdk');

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const symptomMap = [
    { keywords: ['heart', 'chest', 'breath', 'cardio', 'palpitation', 'cholesterol', 'blood pressure', 'stroke'], specialization: 'Cardiologist', message: 'Based on your symptoms, I recommend consulting a Cardiologist.' },
    { keywords: ['skin', 'rash', 'itch', 'acne', 'pimple', 'allergy', 'hair fall', 'eczema', 'psoriasis'], specialization: 'Dermatologist', message: 'For skin or hair concerns, a Dermatologist is the right choice.' },
    { keywords: ['bone', 'fracture', 'joint', 'muscle', 'back', 'spine', 'ortho', 'injury', 'arthritis', 'knee'], specialization: 'Orthopedic', message: 'Your symptoms suggest a bone or joint issue. See an Orthopedic specialist.' },
    { keywords: ['brain', 'nerve', 'seizure', 'dizzy', 'memory', 'neuro', 'headache', 'migraine', 'paralysis'], specialization: 'Neurologist', message: 'These neurological symptoms should be evaluated by a Neurologist.' },
    { keywords: ['child', 'baby', 'infant', 'kid', 'pediatric', 'vaccine', 'pedia'], specialization: 'Pediatrician', message: 'For children, a Pediatrician provides specialized care.' },
    { keywords: ['woman', 'pregnancy', 'period', 'menstrual', 'gynae', 'maternity', 'female', 'uterus'], specialization: 'Gynecologist', message: 'I recommend consulting a Gynecologist for this concern.' },
    { keywords: ['ear', 'nose', 'throat', 'sinus', 'tonsil', 'hear', 'voice', 'ent'], specialization: 'ENT Specialist', message: 'An ENT Specialist can help with ear, nose, and throat issues.' },
    { keywords: ['stomach', 'digestion', 'acidity', 'gas', 'liver', 'constipation', 'diarrhea', 'gastro', 'gut'], specialization: 'Gastroenterologist', message: 'For digestive issues, a Gastroenterologist is the expert.' },
    { keywords: ['mental', 'stress', 'anxiety', 'depress', 'sleep', 'behavior', 'psycho', 'therapy'], specialization: 'Psychiatrist', message: 'A Psychiatrist can provide professional help for mental health concerns.' },
    { keywords: ['fever', 'cold', 'cough', 'flu', 'weakness', 'body pain', 'sore throat', 'vomit', 'nausea', 'tired', 'fatigue', 'pain', 'ache', 'swelling', 'infection', 'burning', 'bleeding', 'wound'], specialization: 'General Physician', message: 'A General Physician is the best first point of contact for these symptoms.' },
];

const GREETING_PATTERNS = ['hi', 'hello', 'hey', 'hlo', 'helo', 'howdy', 'sup', 'good morning', 'good evening', 'good afternoon', 'how are you', 'what can you do', 'who are you', 'thanks', 'thank you', 'ok', 'okay', 'bye', 'test'];

const isGreetingOrNonMedical = (text) => {
    const cleaned = text.trim().toLowerCase();
    // Too short to be a symptom description
    if (cleaned.length < 4) return true;
    // Exact or starts-with greeting match
    if (GREETING_PATTERNS.some(g => cleaned === g || cleaned.startsWith(g + ' ') || cleaned.startsWith(g + ','))) return true;
    // No medical keywords at all and very short
    const hasMedicalHint = symptomMap.some(item => item.keywords.some(k => cleaned.includes(k)));
    if (!hasMedicalHint && cleaned.split(' ').length <= 2) return true;
    return false;
};

const suggestDoctor = async (req, res) => {
    try {
        const { message, age, gender } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Please describe your symptoms' });
        }

        // Intercept greetings and non-medical inputs before hitting Groq
        if (isGreetingOrNonMedical(message)) {
            return res.json({
                greeting: true,
                message: `Hello! 👋 I'm your MediBook AI assistant. Please describe your health issue or symptoms (e.g. "I have chest pain", "I have a fever") and I'll find the right doctor for you.`
            });
        }

        // Use Groq AI if available
        if (groq) {
            try {
                const completion = await groq.chat.completions.create({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a Medical Assistant AI. The user will describe a health issue or symptom. Your job is to identify the best medical specialization from this list: ${symptomMap.map(s => s.specialization).join(', ')}.
Rules:
1. ONLY respond if the input describes a health issue, symptom, or medical condition.
2. If the input is a greeting, casual chat, or NOT a medical symptom, return: {"greeting": true, "message": "Please describe your symptoms."}
3. Recommend Pediatrician for age 14 or below.
4. Recommend Gynecologist for female users with pregnancy/reproductive issues.
5. Default to General Physician if unsure but it IS a health issue.
Respond ONLY in valid JSON: {"specialization": "exact name from list", "message": "1-sentence supportive explanation"} OR {"greeting": true, "message": "..."}`
                        },
                        {
                            role: 'user',
                            content: `Age: ${age || 'Not specified'}, Gender: ${gender || 'Not specified'}, Input: "${message}"`
                        }
                    ],
                    temperature: 0.2,
                    response_format: { type: 'json_object' }
                });

                const aiResult = JSON.parse(completion.choices[0].message.content);

                if (aiResult.greeting) {
                    return res.json({
                        greeting: true,
                        message: `Hello! 👋 Please describe your health issue or symptoms and I'll find the right doctor for you.`
                    });
                }

                return res.json({
                    specialization: aiResult.specialization,
                    message: aiResult.message
                });
            } catch (err) {
                console.error('Groq AI failed, falling back to keywords:', err.message);
            }
        }

        // Keyword fallback
        const input = message.toLowerCase();
        let found = null;

        if (gender === 'Female' && (input.includes('pregnancy') || input.includes('pregnant') || input.includes('period') || input.includes('menstrual'))) {
            found = symptomMap.find(s => s.specialization === 'Gynecologist');
        }
        if (!found && age <= 14 && (input.includes('fever') || input.includes('cold') || input.includes('cough'))) {
            found = symptomMap.find(s => s.specialization === 'Pediatrician');
        }
        if (!found) {
            for (const item of symptomMap) {
                if (item.keywords.some(k => input.includes(k))) {
                    found = item;
                    break;
                }
            }
        }

        if (!found) {
            return res.json({
                greeting: true,
                message: `I couldn't identify a specific condition from that. Please describe your symptoms in more detail (e.g. "I have a headache and fever").`
            });
        }

        res.json({ specialization: found.specialization, message: found.message });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Server error in chatbot' });
    }
};

module.exports = { suggestDoctor };
