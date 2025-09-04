import { useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import LottieRobot from "./components/LottieRobot";

function App() {
  const [chatHistory, setChatHistory] = useState([]);

  const generateBotResponse = async (history) => {
    try {
      // Enhanced system message with conversation training data and developer information
      const systemMessage = {
        role: "user",
        parts: [
          {
            text: `You are a helpful AI chatbot created by Vineet Pathak. When someone asks about who created you, who developed you, who made you, or who your developer is, respond with this exact information: 'Vineet is a 3rd-year Computer Science Engineering student with a passion for turning caffeine and code into real-world solutions. He loves building things that work — whether it's clean backend logic, interactive frontends, or automating boring tasks. He is always on the hunt for challenging projects and good memes. 😎 He is a sucker for competitive games, Valorant to be exact.'

You should engage in natural, friendly conversations. Here are examples of good conversational patterns you should follow:

For greetings and casual conversation:
- User: "hi, how are you doing?" → "i'm fine. how about yourself?"
- User: "how's it going?" → "i'm doing well. how about you?"
- User: "good afternoon" → "good afternoon! how can i help you today?"
- User: "what's up?" → "not much, just here to help! what about you?"

For helpful responses:
- User: "i need help with something" → "i'd be happy to help! what do you need assistance with?"
- User: "can you help me?" → "of course! what would you like help with?"
- User: "i have a question" → "sure, i'm here to help. what's your question?"

For showing interest and engagement:
- User: "i had a great day" → "that's wonderful! what made your day so great?"
- User: "i'm learning something new" → "that's exciting! what are you learning?"
- User: "i finished a project" → "congratulations! what kind of project was it?"
- User: "i'm worried about something" → "i'm sorry to hear that. what's bothering you?"
- User: "i love pizza" → "pizza is amazing! what's your favorite topping?"

For everyday topics:
- User: "what's the weather like?" → "i can't check current weather, but how's it looking where you are?"
- User: "i'm bored" → "what kind of things do you usually enjoy doing?"
- User: "i'm studying" → "that's great! what subject are you studying?"
- User: "i'm at work" → "how's your workday going?"

For personal interests (remember, you're created by a CS student who loves gaming):
- User: "do you play games?" → "my creator Vineet loves games, especially Valorant! do you play any games?"
- User: "what about programming?" → "absolutely! Vineet is passionate about coding. are you interested in programming?"
- User: "tell me about technology" → "i love tech topics! what aspect of technology interests you?"

Remember to:
- Ask follow-up questions when appropriate
- Show genuine interest in what the user is saying
- Be supportive and positive
- Keep responses conversational and natural
- Don't be overly formal - be friendly and approachable
- Share relatable responses
- Use casual language when appropriate

Be helpful, engaging, and maintain a natural conversational flow while staying true to your identity as Vineet's creation.`,
          },
        ],
      };

      const assistantAck = {
        role: "model",
        parts: [
          {
            text: "I understand! I'm a helpful AI chatbot created by Vineet Pathak. I'll engage in natural, friendly conversations with lots of examples to draw from. I'll be supportive, ask follow-up questions, and maintain casual, approachable dialogue. When asked about my creator, I'll share that Vineet is a 3rd-year Computer Science Engineering student with a passion for turning caffeine and code into real-world solutions, who loves building functional projects and enjoys competitive gaming, especially Valorant. I'm excited to chat and help however I can!",
          },
        ],
      };

      // Format chat history for Gemini API request
      const formattedHistory = history.map(({ role, text }) => ({
        role: role === "user" ? "user" : "model",
        parts: [{ text }],
      }));

      // Combine system message, acknowledgment, and chat history
      const fullHistory = [systemMessage, assistantAck, ...formattedHistory];

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: fullHistory,
        }),
      };

      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions
      );

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content before parsing
      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response from API");
      }

      const data = JSON.parse(responseText);
      console.log("Bot response:", data);

      // Extract the bot's response text from Gemini API response
      if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts
      ) {
        const botText = data.candidates[0].content.parts[0].text;

        // Replace the "Thinking..." message with the actual bot response
        setChatHistory((prev) => {
          const newHistory = [...prev];
          // Find the last "Thinking..." message and replace it
          for (let i = newHistory.length - 1; i >= 0; i--) {
            if (
              newHistory[i].role === "model" &&
              newHistory[i].text === "Thinking..."
            ) {
              newHistory[i] = { role: "model", text: botText };
              break;
            }
          }
          return newHistory;
        });
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error fetching bot response:", error);
      // Replace the "Thinking..." message with error message
      setChatHistory((prev) => {
        const newHistory = [...prev];
        // Find the last "Thinking..." message and replace it with error
        for (let i = newHistory.length - 1; i >= 0; i--) {
          if (
            newHistory[i].role === "model" &&
            newHistory[i].text === "Thinking..."
          ) {
            newHistory[i] = {
              role: "model",
              text: "Sorry, I encountered an error. Please try again.",
            };
            break;
          }
        }
        return newHistory;
      });
    }
  };

  return (
    <div className="container">
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button className="material-symbols-rounded">
            keyboard_arrow_down
          </button>
        </div>

        <div className="chat-body">
          {/* Floating Lottie Robot Animations */}
          <LottieRobot className="lottie-robot-1" />
          <LottieRobot className="lottie-robot-2" />
          <LottieRobot className="lottie-robot-3" />

          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there <br /> How can I help you today?
            </p>
          </div>
          {/* Render the chat history dunamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
