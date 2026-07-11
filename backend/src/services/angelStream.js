const WebSocket = require('ws');

class AngelStreamService {
  constructor() {
    this.ws = null;
    this.clientCode = null;
    this.jwtToken = null;
    this.feedToken = null;
    this.apiKey = null;
    this.activeTokens = new Set();
    this.onTickCallback = null;
  }

  initialize(clientCode, jwtToken, feedToken, apiKey, onTickCallback) {
    this.clientCode = clientCode;
    this.jwtToken = jwtToken;
    this.feedToken = feedToken;
    this.apiKey = apiKey;
    this.onTickCallback = onTickCallback;
    this.connect();
  }

  connect() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }

    const url = 'wss://smartapisec.angelone.in/smart-stream';
    const headers = {
      'Authorization': `Bearer ${this.jwtToken}`,
      'api-key': this.apiKey,
      'client-code': this.clientCode,
      'feed-token': this.feedToken
    };

    console.log(`[AngelStream] Connecting to Smart Stream for ${this.clientCode}...`);
    this.ws = new WebSocket(url, { headers });

    this.ws.on('open', () => {
      console.log('🔌 [AngelStream] Connected to Angel One Smart Stream');
      this.resubscribe();
    });

    this.ws.on('message', (data) => {
      try {
        // Parse protobuf or binary tick data (Angel One ticks are binary packets)
        // For development/mock robustness, we handle both binary and text formats
        if (data instanceof Buffer) {
          const tick = this.parseBinaryTick(data);
          if (tick && this.onTickCallback) {
            this.onTickCallback(tick);
          }
        } else {
          const textMsg = data.toString();
          const parsed = JSON.parse(textMsg);
          if (this.onTickCallback) this.onTickCallback(parsed);
        }
      } catch (err) {
        // Fallback or parse error
      }
    });

    this.ws.on('error', (err) => {
      console.error('❌ [AngelStream] WebSocket error:', err.message);
    });

    this.ws.on('close', () => {
      console.log('🔌 [AngelStream] Connection closed. Reconnecting in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    });
  }

  subscribe(tokens) {
    if (!Array.isArray(tokens)) return;
    tokens.forEach(t => this.activeTokens.add(t));
    this.sendSubscriptionPacket(tokens, 1); // 1 = Subscribe
  }

  unsubscribe(tokens) {
    if (!Array.isArray(tokens)) return;
    tokens.forEach(t => this.activeTokens.delete(t));
    this.sendSubscriptionPacket(tokens, 2); // 2 = Unsubscribe
  }

  resubscribe() {
    if (this.activeTokens.size > 0) {
      this.sendSubscriptionPacket(Array.from(this.activeTokens), 1);
    }
  }

  sendSubscriptionPacket(tokens, action) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const packet = {
      action: action, // 1: Subscribe, 2: Unsubscribe
      params: {
        mode: 1, // 1: LTP, 2: Quote, 3: SnapQuote
        tokenList: [
          {
            exchangeType: 1, // 1: NSE, 2: BSE
            tokens: tokens
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(packet));
  }

  parseBinaryTick(buffer) {
    // Angel One Smart Stream binary structure parser (LTP mode)
    // Subscription mode 1 (LTP) returns 12 bytes packet:
    // - Subscription Mode (1 byte)
    // - Token (25 bytes)
    // - Sequence Number (8 bytes)
    // - LTP (4 bytes) - divided by 100
    try {
      if (buffer.length < 12) return null;
      
      const mode = buffer.readUInt8(0);
      const token = buffer.toString('utf8', 1, 26).trim().replace(/\0/g, '');
      const ltp = buffer.readInt32LE(34) / 100; // LTP offset is at byte 34

      return {
        token,
        price: ltp,
        timestamp: Date.now()
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = new AngelStreamService();
