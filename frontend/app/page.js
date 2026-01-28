// app/(auth)/page.js
import { redirect } from 'next/navigation';

export default function RootPage() {
  // ส่งผู้ใช้ไปที่ /login ทันที
  redirect('/login');
}