
import React from 'react';

const DeploymentDocs: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <header className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Production Deployment Guide</h2>
        <p className="text-slate-500">Infrastructure instructions for the 6-person engineering team.</p>
      </header>

      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</span>
          Raspberry Pi 5 Edge Hub Setup
        </h3>
        <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-sm overflow-x-auto">
          <pre>{`# HomeHealth Guardian Edge Setup Script
# Run on Raspberry Pi 5 (Ubuntu/Raspberry Pi OS)

sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y python3-pip mosquitto mosquitto-clients bluez

# Install Edge AI Runtime
pip3 install tflite-runtime paho-mqtt pandas

# Setup MQTT Bridge to AWS IoT Core
cat <<EOF > /etc/mosquitto/conf.d/bridge.conf
connection awsiot
address \${AWS_IOT_ENDPOINT}:8883
bridge_cafile /etc/mosquitto/certs/AmazonRootCA1.pem
bridge_certfile /etc/mosquitto/certs/certificate.pem.crt
bridge_keyfile /etc/mosquitto/certs/private.pem.key
topic health/telemetry/# out 1
EOF

# Deploy TFLite Anomaly Detector
mkdir -p /opt/edge-ai
curl -L https://api.homehealth.io/models/latest_lstm.tflite -o /opt/edge-ai/model.tflite

sudo systemctl restart mosquitto`}</pre>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</span>
          Backend Stack (1-Click Docker)
        </h3>
        <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-sm overflow-x-auto">
          <pre>{`# docker-compose.yml
version: '3.8'
services:
  api-gateway:
    image: homehealth/node-api:latest
    ports: ["3000:3000"]
    environment:
      - INFLUXDB_URL=http://influxdb:8086
      - AWS_IOT_CORE_CLIENT_ID=gateway-blr-01
  
  ml-service:
    build: ./fastapi-federated
    command: uvicorn main:app --host 0.0.0.0
    deploy:
      resources:
        reservations:
          devices: [{driver: nvidia, count: 1, capabilities: [gpu]}]

  influxdb:
    image: influxdb:2.0
    volumes: ["influx_data:/var/lib/influxdb2"]

volumes:
  influx_data:`}</pre>
        </div>
      </section>

      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h3 className="text-blue-800 font-bold mb-2">HIPAA Compliance Data Flow</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-2 text-sm">
          <li><strong>Edge Level:</strong> BLE data is encrypted using AES-CCM. Local TFLite inference avoids raw data upload to cloud unless anomaly detected.</li>
          <li><strong>Transit:</strong> TLS 1.3 for all MQTT/REST communications between Pi and AWS/Azure.</li>
          <li><strong>Storage:</strong> InfluxDB encrypted volumes at rest (AES-256).</li>
          <li><strong>Access:</strong> IAM with Least Privilege; separate VPCs for Bengaluru deployment clusters.</li>
        </ul>
      </section>
    </div>
  );
};

export default DeploymentDocs;
