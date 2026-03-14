const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini if key exists
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Symptom to Specialization mapping (Fallback & reference for AI)
 */
const symptomMap = [
    {
        keywords: ['heart', 'chest', 'breath', 'cardio', 'palpitation', 'cholesterol', 'blood pressure', 'stroke'],
        specialization: 'Cardiologist',
        message: 'Based on your symptoms, I recommend consulting a Cardiologist who specializes in heart health.'
    },
    {
        keywords: ['skin', 'rash', 'itch', 'acne', 'pimple', 'allergy', 'hair fall', 'eczema', 'psoriasis'],
        specialization: 'Dermatologist',
        message: 'For skin, hair, or nail-related concerns, a Dermatologist is the right choice.'
    },
    {
        keywords: ['bone', 'fracture', 'joint', 'muscle', 'back', 'spine', 'ortho', 'injury', 'arthritis', 'knee'],
        specialization: 'Orthopedic',
        message: 'Your symptoms suggest an issue with bones or joints. You should see an Orthopedic specialist.'
    },
    {
        keywords: ['brain', 'nerve', 'seizure', 'dizzy', 'memory', 'neuro', 'headache', 'migraine', 'paralysis'],
        specialization: 'Neurologist',
        message: 'Neurological symptoms like these should be evaluated by a Neurologist.'
    },
    {
        keywords: ['child', 'baby', 'infant', 'kid', 'pediatric', 'vaccine', 'pedia'],
        specialization: 'Pediatrician',
        message: 'For children and infants, a Pediatrician provides specialized care.'
    },
    {
        keywords: ['woman', 'pregnancy', 'period', 'menstrual', 'gynae', 'maternity', 'female', 'uterus'],
        specialization: 'Gynecologist',
        message: 'I recommend consulting a Gynecologist for women\'s health and reproductive concerns.'
    },
    {
        keywords: ['ear', 'nose', 'throat', 'sinus', 'tonsil', 'hear', 'voice', 'ent'],
        specialization: 'ENT Specialist',
        message: 'An ENT Specialist (Otolaryngologist) can help with ear, nose, and throat issues.'
    },
    {
        keywords: ['stomach', 'digestion', 'acidity', 'gas', 'liver', 'constipation', 'diarrhea', 'gastro', 'gut'],
        specialization: 'Gastroenterologist',
        message: 'For digestive system or liver issues, a Gastroenterologist is the expert.'
    },
    {
        keywords: ['mental', 'stress', 'anxiety', 'depress', 'sleep', 'behavior', 'psycho', 'therapy'],
        specialization: 'Psychiatrist',
        message: 'If you are experiencing mental health struggles, a Psychiatrist can provide professional help.'
    },
    {
        keywords: ['fever', 'cold', 'cough', 'flu', 'general', 'weakness', 'body pain', 'sore throat'],
        specialization: 'General Physician',
        message: 'These are general symptoms. A General Physician is usually the best first point of contact.'
    }
];

const suggestDoctor = async (req, res) => {
    try {
        const { message, age, gender } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Please describe your symptoms' });
        }

        // Use AI if available
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                
                const prompt = `
                    You are a Medical Assistant AI for the MediBook Healthcare system.
                    Analyze the following user symptoms and determine the best medical specialization.
                    
                    User Profile:
                    - Age: ${age || 'Not specified'}
                    - Gender: ${gender || 'Not specified'}
                    - Symptoms: "${message}"

                    Available Specializations: ${symptomMap.map(s => s.specialization).join(', ')}

                    Strict Rules:
                    1. Recommending a Pediatrician for any user age 14 or below with general symptoms.
                    2. Recommending a Gynecologist for female users with pregnancy or reproductive issues.
                    3. If the specialization is not in the list, choose 'General Physician'.
                    
                    Respond ONLY in the following JSON format:
                    {
                        "specialization": "The exact name from the list",
                        "message": "A brief, 1-sentence supportive explanation for the user."
                    }
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                // Clean the response (sometimes AI wraps in ```json ... ```)
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResult = JSON.parse(jsonStr);

                return res.json({
                    specialization: aiResult.specialization,
                    message: aiResult.message
                });
            } catch (err) {
                console.error('Gemini AI failed, falling back to keywords:', err);
                // Continue to keyword fallback
            }
        }

        // --- KEYWORD FALLBACK LOGIC ---
        const input = message.toLowerCase();
        let found = null;

        // Demographic Logic First (e.g., Pregnancy-related for females)
        if (gender === 'Female' && (input.includes('pregnancy') || input.includes('pregnant') || input.includes('period') || input.includes('menstrual') || input.includes('maternity'))) {
            found = symptomMap.find(s => s.specialization === 'Gynecologist');
        } 
        
        // Pediatric logic for children
        if (!found && age <= 14 && (input.includes('fever') || input.includes('cold') || input.includes('cough') || input.includes('growth'))) {
            found = symptomMap.find(s => s.specialization === 'Pediatrician');
        }

        // Generic keyword matching if no demographic match
        if (!found) {
            for (const item of symptomMap) {
                if (item.keywords.some(keyword => input.includes(keyword))) {
                    found = item;
                    break;
                }
            }
        }

        if (!found) {
            return res.json({
                specialization: 'General Physician',
                message: "I'm not sure which specialist would be best for that. I recommend consulting a General Physician for an initial check-up."
            });
        }

        res.json({
            specialization: found.specialization,
            message: found.message
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Server error in chatbot' });
    }
};

module.exports = { suggestDoctor };
