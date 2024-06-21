from flask import Flask, request, send_file
from flask_cors import CORS
import os
import io
import zipfile

import stadium_randomizer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit

@app.route('/process', methods=['POST'])
def process_file():
    try:
        file = request.files['file']
        file_content = file.read()

        baseStats_slider_val = request.form.get('baseStatsSliderValue')
        attack_sliders_val = request.form.get('attacksSliderValue')
        seed_count_val = request.form.get('seedCountValue')
        settings_dict = {
            'base' : baseStats_slider_val,
            'attack' : attack_sliders_val,
        }
        
        file_path = os.path.join('uploads', 'baseROM.z64')
        with open(file_path, 'wb') as f:
            f.write(file_content)
        print('File saved:', file_path)
        
        processed_dir_path = os.path.join('processed')
        # Run the randomizer function for each seed
        for i in range(int(seed_count_val)):
            seed_file_path = os.path.join(processed_dir_path, f'seed_{i + 1}.z64')
            stadium_randomizer.randomizer_func(file_path, seed_file_path, settings_dict)

        # Create a zip file in memory
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add the processed files to the zip file
            for root, _, files in os.walk(processed_dir_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    zipf.write(file_path, os.path.relpath(file_path, processed_dir_path))
        
        memory_file.seek(0)
        
        #processed_file_path = os.path.join('processed', 'PKseed.z64')
        #print('File processed and saved:', processed_file_path)
        #return send_file(processed_file_path)
        # Send the zip file as a response
        # delete files here, maybe (if it doesn't break anything)
        return send_file(
            memory_file,
            mimetype='application/zip'
        )
    except Exception as e:
        print('Error processing file:', e)
        return "Error processing file", 500

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    if not os.path.exists('processed'):
        os.makedirs('processed')
    app.run(port=5000)
