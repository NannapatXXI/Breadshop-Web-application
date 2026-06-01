// [Claude] DTO สำหรับรับข้อมูลที่ user ต้องการแก้ไขในหน้า Profile
package com.breadShop.XXI.dto;

public class UpdateProfileRequest {

    private String username;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
