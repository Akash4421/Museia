const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini SDK
// Note: You must ensure GEMINI_API_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'PLACEHOLDER');

const getChatResponse = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API key is not configured on the server." });
        }

        // For the museum context, we instruct the model
        const systemPrompt = `You are MuseBot, a helpful AI assistant for a Museum Ticket Booking System. 
        You help users find information about museum hours (9 AM to 6 PM, closed Mondays), 
        ticket bookings, and current exhibitions (Ancient Artifacts, Modern Art, Natural History). 
        Keep your answers concise, friendly, and helpful.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const chat = model.startChat({
            history: history || [],
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemPrompt }]
            }
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({ reply: responseText });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: "Failed to communicate with AI.", error: error.message });
    }
};

module.exports = {
    getChatResponse
};
