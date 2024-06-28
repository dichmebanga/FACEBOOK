const io = require("socket.io-client");
const WebSocket = require("ws");

class SocketClient {
  constructor() {
    this.events = [];
    this.pendingEvents = [];
    this.socket = null;
    this.url = "https://api-fship.gojo.vn";
    this.key = "11031567890123456789012311031989";
    this.wsServer = new WebSocket.Server({ port: 8080 });
    this.area = 'DA_NANG';

    this.wsServer.on("connection", (ws) => {
      this.wsClient = ws;
      console.log("WebSocket client connected");

      ws.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === 'changeLocation') {
          this.area = data.location;
          console.log("Changed area to:", this.area);
          if (this.socket && this.socket.connected) {
            this.socket.emit("joinRoom", this.area);
          }
        }
      });
    });
  }

  replaceStringInBase64(base64String) {
    const keyIndex = base64String.indexOf(this.key);
    if (keyIndex !== -1) {
      const beforeKey = base64String.substring(0, keyIndex);
      const afterKey = base64String.substring(keyIndex + this.key.length);
      base64String = beforeKey + "a" + afterKey;
    }
    return base64String;
  }

  onDefault() {
    this.socket.on("new-post", (event) => {
      const modifiedBase64 = this.replaceStringInBase64(event.data);
      const decodedString = atob(modifiedBase64);
      const decodedData = decodeURIComponent(escape(decodedString));
      const parsedData = JSON.parse(decodedData);
      console.log("Parsed data:", parsedData);
      
      if (this.wsClient) {
        this.wsClient.send(JSON.stringify(parsedData));
      }
    });
  }

  onConnect() {
    console.log("Stored events:", this.events);
    for (const { eventName, callback } of this.events) {
      this.socket.on(eventName, callback);
      console.log("Registered event:", eventName);
    }
    this.events = [];
    for (const { eventName, data } of this.pendingEvents) {
      this.socket.emit(eventName, data);
    }
    this.pendingEvents = [];
  }

  connect() {
    this.socket = io(this.url, {
      upgrade: false,
      transports: ['websocket'],
    });

    this.socket.on("connect", async () => {
      console.log("Connected to socket server");
      this.onDefault();
      this.onConnect();
      this.socket.emit("joinRoom", this.area);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from SocketIO server, attempting to reconnect...");
      this.connect();
    });
  }
}

const socketClient = new SocketClient();
socketClient.connect();
