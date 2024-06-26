from flask import Flask, request, jsonify
from deepface import DeepFace
import os
import tempfile
import traceback

app = Flask(__name__)

# Define the path to the face database
db_path = "./face_db"

@app.route('/compare_faces', methods=['POST'])
def compare_faces():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files['image']
    
    # Use tempfile to create a temporary file
    temp_dir = tempfile.gettempdir()
    image_path = os.path.join(temp_dir, image.filename)
    image.save(image_path)
 
    try:
        result = DeepFace.find(img_path=image_path, db_path=db_path)
        final = []
        images = []

        for i in range(len(result[0]['identity'])):
            entry = {
                "image": result[0]['identity'][i],
                "similarity": result[0]['distance'][i] * 2 if result[0]['distance'][i] < 0.5 else result[0]['distance'][i]
            }
            if result[0]['identity'][i] in images:
                continue
            images.append(result[0]['identity'][i])
            final.append(entry)

        return jsonify(final)

    except Exception as e:
        error_message = str(e)
        trace = traceback.format_exc()
        print(f"Error: {error_message}\nTraceback: {trace}")
        return jsonify({"error": error_message}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)