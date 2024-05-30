from flask import Flask, request, send_file
from flask_cors import CORS
import os

import stadium_randomizer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit

@app.route('/process', methods=['POST'])
def process_file():
    try:
        file = request.data
        file_path = os.path.join('uploads', 'baseROM.z64')
        
        with open(file_path, 'wb') as f:
            f.write(file)
        print('File saved:', file_path)
        
        processed_dir_path = os.path.join('processed')
        stadium_randomizer.randomizer_func(file_path, processed_dir_path)
        
        processed_file_path = os.path.join('processed', 'PKseed.z64')
        print('File processed and saved:', processed_file_path)
        return send_file(processed_file_path)
    except Exception as e:
        print('Error processing file:', e)
        return "Error processing file", 500

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    if not os.path.exists('processed'):
        os.makedirs('processed')
    app.run(port=5000)
