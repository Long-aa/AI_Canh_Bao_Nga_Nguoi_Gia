# SafeGuard AI Frontend - Next.js & TypeScript

Hệ thống giám sát thông minh ứng dụng AI cho người cao tuổi, được xây dựng với Next.js và TypeScript.

## 🚀 Tính năng

- **Đăng nhập an toàn** với giao diện hiện đại
- **Dashboard tổng quan** với các chỉ số quan trọng và biểu đồ
- **Quản lý cảnh báo** với bộ lọc và phân trang
- **Xử lý khẩn cấp** với mô phỏng AI real-time
- **Quản lý thiết bị** theo dõi trạng thái Edge Devices
- **Quản lý hồ sơ** người cao tuổi
- **Cài đặt hệ thống** linh hoạt

## 🛠️ Công nghệ

- **Next.js 14** - React framework với SSR
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Recharts** - Chart library

## 📁 Cấu trúc

```
src/
├── components/
│   └── Layout.tsx          # Layout chính với sidebar
├── pages/
│   ├── index.tsx           # Trang chủ (redirect to login)
│   ├── login.tsx           # Trang đăng nhập
│   ├── dashboard.tsx       # Dashboard tổng quan
│   ├── alerts.tsx          # Danh sách cảnh báo
│   ├── emergency.tsx       # Xử lý khẩn cấp
│   ├── devices.tsx         # Quản lý thiết bị
│   ├── profiles.tsx        # Quản lý hồ sơ
│   └── settings.tsx       # Cài đặt hệ thống
└── pages/api/             # API routes
```

## 🚀 Chạy ứng dụng

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Chạy production
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3001

## 📱 Các trang

### 1. Đăng nhập (/login)
- Giao diện hai cột với branding và form đăng nhập
- Hỗ trợ ẩn/hiện mật khẩu
- Checkbox ghi nhớ đăng nhập

### 2. Dashboard (/dashboard)
- Tổng quan hệ thống với 4 cards chỉ số
- Biểu đồ tần suất cảnh báo trong tuần
- Bảng cảnh báo khẩn cấp gần đây

### 3. Danh sách cảnh báo (/alerts)
- Bộ lọc theo mức độ rủi ro, trạng thái, thời gian
- Bảng cảnh báo với phân trang
- Tìm kiếm và xóa bộ lọc

### 4. Xử lý khẩn cấp (/emergency)
- Mô phỏng AI với video frame
- Chi tiết sự cố và thông tin đối tượng
- Các nút hành động khẩn cấp

### 5. Quản lý thiết bị (/devices)
- Danh sách thiết bị với trạng thái real-time
- CPU và temperature monitoring
- Phân trang và tìm kiếm

### 6. Hồ sơ người già (/profiles)
- Grid cards hiển thị hồ sơ
- Modal thêm hồ sơ mới
- Trạng thái monitoring

### 7. Cài đặt (/settings)
- Cài đặt camera, thông báo, hệ thống
- Bảo mật và tài khoản
- Ngưỡng cảnh báo và lưu trữ dữ liệu

## 🎨 Design System

- **Primary Color**: Blue-600 (#3B82F6)
- **Success Color**: Green-500 (#10B981)
- **Warning Color**: Yellow-500 (#F59E0B)
- **Danger Color**: Red-600 (#DC2626)
- **Typography**: Inter font family
- **Shadows**: Subtle box shadows for depth
- **Border Radius**: 8px for cards, 4px for inputs

## 📝 Notes

- Server đang chạy trên port 3001 (vì port 3000 đã được sử dụng)
- Tất cả components đều được viết với TypeScript
- Responsive design cho mobile và desktop
- Sử dụng TailwindCSS cho styling
- Icons từ Lucide React
