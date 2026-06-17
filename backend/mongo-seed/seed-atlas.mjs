import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

const ATLAS_URI = "mongodb+srv://root:123@cluster0.ys5urdi.mongodb.net/viecnhanh?appName=Cluster0";

const collections = [
  { col: "users",             file: "users.json" },
  { col: "employerprofiles",  file: "employerProfiles.json" },
  { col: "candidateprofiles", file: "candidateProfiles.json" },
  { col: "categories",        file: "categories.json" },
  { col: "jobposts",          file: "jobPosts.json" },
  { col: "applications",      file: "applications.json" },
  { col: "orders",            file: "orders.json" },
  { col: "payments",          file: "payments.json" },
  { col: "complaints",        file: "complaints.json" },
  { col: "operationtasks",    file: "operationTasks.json" },
];

async function seedAll() {
  const client = new MongoClient(ATLAS_URI);
  try {
    console.log("🔌 Đang kết nối MongoDB Atlas...");
    await client.connect();
    console.log("✅ Kết nối thành công!\n");

    const db = client.db("viecnhanh");

    for (const { col, file } of collections) {
      const filePath = join(__dir, file);
      const data = JSON.parse(readFileSync(filePath, "utf-8"));

      // Drop collection cũ rồi insert mới
      await db.collection(col).drop().catch(() => {}); // bỏ qua nếu chưa tồn tại
      const result = await db.collection(col).insertMany(data);
      console.log(`✅ [${col}] → đã import ${result.insertedCount} documents (từ ${file})`);
    }

    console.log("\n🎉 Seed Atlas hoàn tất! Tất cả collections đã được cập nhật.");
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  } finally {
    await client.close();
    console.log("🔒 Đã đóng kết nối.");
  }
}

seedAll();
