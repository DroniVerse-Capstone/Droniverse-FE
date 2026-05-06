// mqttClient.ts — Browser-compatible MQTT via dynamic import (Next.js safe)

const MQTT_URL = 'wss://broker.hivemq.com:8884/mqtt';

type MqttInstance = any;

class MQTTClient {
  private client: MqttInstance = null;
  private droneId: string | null = null;
  private statusCallback: ((status: any) => void) | null = null;
  private discoveryCallback: ((discovery: any) => void) | null = null;

  async connect() {
    if (this.client?.connected) return;

    // Dynamic import để tránh lỗi SSR/Node.js APIs trong browser
    const mqtt = (await import('mqtt')).default;

    this.client = mqtt.connect(MQTT_URL, {
      clean: true,
      connectTimeout: 6000,
      reconnectPeriod: 3000,
      protocol: 'wss',
    });

    this.client.on('connect', () => {
      console.log('✅ [MQTT] Connected:', MQTT_URL);
      this.client.subscribe('drone/discovery', (err: any) => {
        if (!err) console.log('📡 [MQTT] Subscribed → drone/discovery');
      });
    });

    this.client.on('reconnect', () => {
      console.log('🔄 [MQTT] Reconnecting...');
    });

    this.client.on('close', () => {
      console.log('❌ [MQTT] Connection closed');
    });

    this.client.on('error', (err: any) => {
      console.error('⚠️ [MQTT] Error:', err.message);
    });

    this.client.on('message', (topic: string, message: Buffer) => {
      const msgStr = message.toString();
      console.log(`📥 [MQTT] [${topic}]:`, msgStr);

      try {
        const payload = JSON.parse(msgStr);

        if (topic === 'drone/discovery') {
          console.log(`🔍 [MQTT] Drone found: ${payload.droneId}`);
          if (this.discoveryCallback) this.discoveryCallback(payload);
          if (payload.droneId) {
            this.client.subscribe(`drone/${payload.droneId}/status`);
          }
        } else if (topic.startsWith('drone/') && topic.endsWith('/status')) {
          if (this.statusCallback) this.statusCallback(payload);
        }
      } catch (e) {
        console.error('⚠️ [MQTT] Parse error:', e);
      }
    });
  }

  setDroneId(id: string) {
    this.droneId = id;
    if (this.client?.connected) {
      this.client.subscribe(`drone/${id}/status`);
    }
  }

  publishCommand(droneId: string, commands: any) {
    if (!this.client?.connected || !droneId) {
      console.warn('[MQTT] Cannot publish: not connected or no droneId provided');
      return false;
    }

    const topic = `drone/${droneId}/mission`;
    const payload = JSON.stringify({ commands });

    this.client.publish(topic, payload, { qos: 1 });
    console.log(`🚀 [MQTT] Published → ${topic}:`, payload);
    return true;
  }

  publishRaw(topic: string, payload: any) {
    if (!this.client?.connected) return false;
    this.client.publish(topic, JSON.stringify(payload), { qos: 0 });
    return true;
  }

  onStatus(callback: (status: any) => void) {
    this.statusCallback = callback;
  }

  onDiscovery(callback: (discovery: any) => void) {
    this.discoveryCallback = callback;
  }

  disconnect() {
    this.client?.end(true);
    this.client = null;
    console.log('🔌 [MQTT] Disconnected');
  }
}

export const mqttClient = new MQTTClient();
