import os
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Configure Gemini API
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')

# In-memory message storage - using the correct format for Gemini API
chat_history = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')

        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        # Generate response using Gemini
        # Convert our internal history format to Gemini's format on-the-fly
        gemini_history = []
        for msg in chat_history:
            if msg["role"] == "user":
                gemini_history.append({"role": "user", "parts": [{"text": msg["message"]}]})
            else:
                gemini_history.append({"role": "model", "parts": [{"text": msg["message"]}]})
        
        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(user_message)

        # Format the response text
        formatted_response = response.text

        # Ensure code blocks are properly formatted
        if '```' in formatted_response:
            # Keep code blocks intact but format surrounding text
            parts = formatted_response.split('```')
            for i in range(0, len(parts), 2):
                # Only format non-code parts
                parts[i] = parts[i].replace('*', '**')  # Convert single asterisks to double
                parts[i] = parts[i].replace('_', '*')   # Convert underscores to asterisks
            formatted_response = '```'.join(parts)
        else:
            # Format regular text
            formatted_response = formatted_response.replace('*', '**')
            formatted_response = formatted_response.replace('_', '*')

        # Store messages in our internal history format
        chat_history.append({"role": "user", "message": user_message})
        chat_history.append({"role": "assistant", "message": formatted_response})

        return jsonify({
            'response': formatted_response,
            'timestamp': str(datetime.now())
        })

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({'error': 'Failed to generate response'}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    # Return our internal chat history format to the frontend
    return jsonify(chat_history)

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    try:
        global chat_history
        chat_history = []
        return jsonify({'message': 'Chat history cleared successfully'}), 200
    except Exception as e:
        logger.error(f"Error clearing chat history: {str(e)}")
        return jsonify({'error': 'Failed to clear chat history'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)