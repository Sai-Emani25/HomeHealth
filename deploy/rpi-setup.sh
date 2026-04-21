
#!/bin/bash
# HomeHealth Guardian - Edge Hub Setup Script
# Target: Raspberry Pi 5 (Debian Bookworm)

echo "--- Initializing HomeHealth Edge Hub ---"

# 1. Update System
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install MQTT Broker (Mosquitto)
sudo apt-get install mosquitto mosquitto-clients -y
sudo systemctl enable mosquitto

# 3. Install Docker & Compose
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 4. Install Bluetooth dependencies
sudo apt-get install bluez libbluetooth-dev libcap2-bin -y

# 5. Set up Python for TFLite Inference
sudo apt-get install python3-pip -y
pip3 install tflite-runtime paho-mqtt numpy

# 6. Deploy Edge AI Service
mkdir -p ~/homehealth/edge_ai
cat <<EOF > ~/homehealth/edge_ai/main.py
import tflite_runtime.interpreter as tflite
import paho.mqtt.client as mqtt
import json
import numpy as np

# Load local TFLite model
interpreter = tflite.Interpreter(model_path="lstm_anomaly.tflite")
interpreter.allocate_tensors()

def on_message(client, userdata, msg):
    data = json.loads(msg.payload)
    # Perform local inference...
    # If anomaly, publish to /alerts
    print(f"Processing edge data: {data}")

client = mqtt.Client()
client.on_message = on_message
client.connect("localhost", 1883)
client.subscribe("sensors/+")
client.loop_forever()
EOF

echo "--- Setup Complete. Please restart the Pi. ---"
