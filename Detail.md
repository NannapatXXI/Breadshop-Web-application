โครงสร้างโฟลเดอร์ Backend (Spring Boot) ฉบับจัดระเบียบใหม่

นี่คือโครงสร้างโฟลเดอร์ backend ของคุณ หลังจากที่เรา "แยก" คลาสทั้งหมด (ที่เคยรวมอยู่ใน XxiApplication.java) ออกมาเป็นไฟล์ของตัวเองตามหลักการ Single Responsibility Principle ครับ

(สัญลักษณ์ ⭐️ หมายถึง โฟลเดอร์ หรือ ไฟล์ ที่ "เพิ่มเข้ามาใหม่" หรือ "ถูกแยกออกมา" จากโค้ดเดิม)

backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/breadShop/XXI/
│   │   │       │
│   │   │       │ // --- 1. ไฟล์หลัก (ไฟล์เดิม) ---
│   │   │       ├── XxiApplication.java
│   │   │       │
│   │   │       │ // --- 2. ส่วนตั้งค่า Security ---
│   │   │       ├── config/                  <-- ⭐️ โฟลเดอร์ใหม่
│   │   │       │   └── SecurityConfig.java    <-- ⭐️ ไฟล์ใหม่ (ย้ายคลาส SecurityConfig มาที่นี่)
│   │   │       │
│   │   │       │ // --- 3. ส่วนรับ-ส่ง Request (ด่านหน้า) ---
│   │   │       ├── controller/              <-- ⭐️ โฟลเดอร์ใหม่
│   │   │       │   └── AuthController.java    <-- ⭐️ ไฟล์ใหม่ (ย้ายคลาส AuthController มาที่นี่)
│   │   │       │
│   │   │       │ // --- 4. ส่วน "กล่องพัสดุ" (รับส่ง JSON) ---
│   │   │       ├── dto/                     <-- ⭐️ โฟลเดอร์ใหม่
│   │   │       │   ├── LoginRequest.java    <-- ⭐️ ไฟล์ใหม่ (ย้าย record LoginRequest มาที่นี่)
│   │   │       │   ├── RegisterRequest.java <-- ⭐️ ไฟล์ใหม่ (ย้าย record RegisterRequest มาที่นี่)
│   │   │       │   ├── LoginResponse.java   <-- ⭐️ ไฟล์ใหม่ (ย้าย record LoginResponse มาที่นี่)
│   │   │       │   ├── ErrorResponse.java   <-- ⭐️ ไฟล์ใหม่ (ย้าย record ErrorResponse มาที่นี่)
│   │   │       │   └── MessageResponse.java <-- ⭐️ ไฟล์ใหม่ (ย้าย record MessageResponse มาที่นี่)
│   │   │       │
│   │   │       │ // --- 5. ส่วน "พิมพ์เขียว" Database ---
│   │   │       ├── entity/                  <-- ⭐️ โฟลเดอร์ใหม่
│   │   │       │   └── User.java            <-- ⭐️ ไฟล์ใหม่ (ย้ายคลาส User มาที่นี่)
│   │   │       │
│   │   │       │ // --- 6. ส่วนคุยกับ Database ---
│   │   │       ├── repository/              <-- ⭐️ โฟลเดอร์ใหม่
│   │   │       │   └── UserRepository.java  <-- ⭐️ ไฟล์ใหม่ (ย้าย interface UserRepository มาที่นี่)
│   │   │       │
│   │   │       │ // --- 7. ส่วน "สมอง" (Logic) ---
│   │   │       └── service/                 <-- ⭐️ โฟลเดอร์ใหม่
│   │   │           └── AuthService.java     <-- ⭐️ ไฟล์ใหม่ (ย้ายคลาส AuthService มาที่นี่)
│   │   │
│   │   └── resources/
│   │       ├── application.properties     (ไฟล์เดิม - สำหรับตั้งค่า Database)
│   │       ├── static/
│   │       └── templates/
│   │
│   └── test/
│       └── java/com/breadShop/XXI/
│           └── XxiApplicationTests.java   (ไฟล์เดิม)
│
├── .mvn/ 
├── mvnw
├── mvnw.cmd
└── pom.xml                            (ไฟล์เดิม - สำหรับจัดการ Dependencies)

list สิ่งที่ต้องแก้
- แก้ database มีปัญหาการ reset pass ที่ซ้อนกับการ login หน้าเว็บ กับ google  ทำตารางบอกว่า login เข้ามาด้วยอะไร (pass)
-แก้ การแยก path การดดเข้่าถึงแบบ private และ public
