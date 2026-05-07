# Hệ thống Cảnh báo Ngã Người già sử dụng AI

Hệ thống giám sát và cảnh báo ngã người già thời gian thực sử dụng trí tuệ nhân tạo.

## Cấu trúc dự án

```
AI_Canh_Bao_Nga_Nguoi_Gia/
├── edge_device/               # Thiết bị biên chạy mô hình AI
│   ├── ai_models/             # File mô hình .tflite từ Colab
│   │   ├── yolo_model.tflite
│   │   └── lstm_model.tflite
│   ├── core_inference/        # Script chạy inference
│   │   ├── pose_extractor.py  # Trích xuất khung xương với MediaPipe
│   │   └── action_recognizer.py# Nhận diện hành vi với LSTM
│   ├── utils/
│   │   └── backend_sender.py  # Gửi dữ liệu lên backend
│   ├── requirements.txt       # Thư viện Python
│   └── run_camera.py          # File chạy chính
│
├── backend_server/            # Máy chủ backend
│   ├── app/
│   │   ├── controllers/       # Logic xử lý
│   │   ├── models/            # Database models
│   │   └── websockets/        # WebSocket realtime
│   └── server.py              # Server chính
│
└── frontend_webapp/           # React web app
    ├── public/
    ├── src/
    │   ├── components/        # UI components
    │   ├── pages/             # Các trang
    │   ├── services/          # API calls
    │   └── App.jsx
    └── package.json
```

## Hướng dẫn cài đặt

### 1. Edge Device (Jetson Nano/Raspberry Pi/PC)

```bash
cd edge_device
pip install -r requirements.txt

# Copy file mô hình từ Colab vào thư mục ai_models/
# - yolo_model.tflite
# - lstm_model.tflite

# Chạy hệ thống
python run_camera.py
```

### 2. Backend Server

```bash
cd backend_server
pip install fastapi uvicorn sqlalchemy requests

# Chạy server
python server.py
```

### 3. Frontend Web App

```bash
cd frontend_webapp
npm install
npm start
```

## Tính năng

- **Phát hiện ngã thời gian thực**: Sử dụng YOLO + LSTM để nhận diện hành vi ngã
- **Cảnh báo đa kênh**: Email, SMS, push notification
- **Dashboard theo dõi**: Xem lịch sử cảnh báo, trạng thái thiết bị
- **Quản lý hồ sơ**: Thông tin người già, liên hệ khẩn cấp
- **WebSocket realtime**: Cập nhật tức thì khi phát hiện ngã

## Công nghệ sử dụng

- **Edge**: Python, OpenCV, MediaPipe, TensorFlow Lite
- **Backend**: FastAPI, SQLAlchemy, WebSocket
- **Frontend**: React, TailwindCSS, Lucide icons

## Lưu ý

- Cần train mô hình YOLO và LSTM trên Google Colab trước
- Copy file .tflite vào thư mục `edge_device/ai_models/`
- Cấu hình IP address trong file `run_camera.py` để kết nối với backend