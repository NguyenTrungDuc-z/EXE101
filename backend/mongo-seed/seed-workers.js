import { MongoClient } from 'mongodb';

const uri = "mongodb://127.0.0.1:27017/viecnhanh";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("viecnhanh");
    const users = db.collection("users");
    const profiles = db.collection("candidateprofiles");

    const workers = [
      // CAT-PLUMB (3)
      { code: "USR-CAN-003", name: "Nguyễn Văn Hùng", email: "hung.plumb@example.com", category: "CAT-PLUMB", skills: ["Sửa ống nước", "Lắp đặt thiết bị vệ sinh"], headline: "Chuyên gia điện nước 10 năm kinh nghiệm" },
      { code: "USR-CAN-004", name: "Trần Minh Tuấn", email: "tuan.plumb@example.com", category: "CAT-PLUMB", skills: ["Thông tắc cống", "Sửa rò rỉ nước"], headline: "Thợ sửa ống nước tận tâm, giá rẻ" },
      { code: "USR-CAN-005", name: "Lê Hoàng Nam", email: "nam.plumb@example.com", category: "CAT-PLUMB", skills: ["Lắp máy bơm", "Sửa đường ống"], headline: "Kỹ thuật viên nước chuyên nghiệp" },
      
      // CAT-CLEAN (4)
      { code: "USR-CAN-006", name: "Phạm Thị Lan", email: "lan.clean@example.com", category: "CAT-CLEAN", skills: ["Dọn dẹp nhà cửa", "Vệ sinh công nghiệp"], headline: "Dịch vụ dọn nhà sạch sẽ, tỉ mỉ" },
      { code: "USR-CAN-007", name: "Nguyễn Thu Hà", email: "ha.clean@example.com", category: "CAT-CLEAN", skills: ["Giặt sofa", "Lau kính"], headline: "Chuyên gia vệ sinh nội thất" },
      { code: "USR-CAN-008", name: "Trần Thị Mai", email: "mai.clean@example.com", category: "CAT-CLEAN", skills: ["Dọn dẹp văn phòng", "Khử khuẩn"], headline: "Thợ dọn dẹp chuyên nghiệp" },
      { code: "USR-CAN-009", name: "Lê Văn Đức", email: "duc.clean@example.com", category: "CAT-CLEAN", skills: ["Vệ sinh sau xây dựng", "Đánh bóng sàn"], headline: "Đội ngũ vệ sinh công nghiệp uy tín" },

      // CAT-AC (3)
      { code: "USR-CAN-010", name: "Vũ Minh Quang", email: "quang.ac@example.com", category: "CAT-AC", skills: ["Vệ sinh máy lạnh", "Nạp gas điều hòa"], headline: "Thợ điện lạnh tay nghề cao" },
      { code: "USR-CAN-011", name: "Đặng Hoàng Long", email: "long.ac@example.com", category: "CAT-AC", skills: ["Sửa máy giặt", "Sửa tủ lạnh"], headline: "Chuyên sửa chữa điện lạnh gia dụng" },
      { code: "USR-CAN-012", name: "Bùi Anh Tuấn", email: "tuan.ac@example.com", category: "CAT-AC", skills: ["Lắp đặt điều hòa", "Bảo trì hệ thống lạnh"], headline: "Kỹ sư điện lạnh chuyên nghiệp" },
    ];

    for (const w of workers) {
      try {
        // Generate unique phone based on code
        const phoneNum = "090" + w.code.split("-")[2].padStart(7, '0').slice(-7);
        
        // Insert User with upsert
        const userResult = await users.updateOne(
          { code: w.code },
          {
            $set: {
              code: w.code,
              name: w.name,
              email: w.email,
              phone: phoneNum,
              role: "candidate",
              status: "active",
              city: "Hồ Chí Minh",
              avatar: `https://i.pravatar.cc/150?u=${w.code}`,
              walletBalance: 0,
              createdAt: new Date()
            }
          },
          { upsert: true }
        );

        // Insert Candidate Profile
        const profileResult = await profiles.updateOne(
          { userCode: w.code },
          {
            $set: {
              userCode: w.code,
              headline: w.headline,
              skills: w.skills,
              rating: parseFloat((Math.random() * (5.0 - 4.5) + 4.5).toFixed(1)),
              verified: true,
              completedJobs: Math.floor(Math.random() * 50) + 10,
              availability: "available"
            }
          },
          { upsert: true }
        );

        console.log(`✓ ${w.code} - ${w.name}`);
      } catch (error) {
        console.error(`✗ Error seeding ${w.code}:`, error.message);
      }
    }

    console.log("\n✅ Successfully seeded 10 professional workers!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);