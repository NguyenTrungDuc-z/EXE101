import { MongoClient } from 'mongodb';

const uri = "mongodb://127.0.0.1:27017/viecnhanh";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("viecnhanh");
    
    console.log("🔄 Dropping unique indexes...");
    try {
      await db.collection("users").dropIndex("code_1");
      console.log("✓ Dropped code index");
    } catch (e) {
      console.log("⚠ Code index not found");
    }
    
    try {
      await db.collection("users").dropIndex("email_1");
      console.log("✓ Dropped email index");
    } catch (e) {
      console.log("⚠ Email index not found");
    }

    console.log("\n🗑️  Clearing candidate users (USR-CAN-003 to USR-CAN-012)...");
    const result = await db.collection("users").deleteMany({
      code: { $in: [
        "USR-CAN-003", "USR-CAN-004", "USR-CAN-005",
        "USR-CAN-006", "USR-CAN-007", "USR-CAN-008",
        "USR-CAN-009", "USR-CAN-010", "USR-CAN-011", "USR-CAN-012"
      ]}
    });
    console.log(`✓ Deleted ${result.deletedCount} users`);

    console.log("\n🗑️  Clearing candidate profiles...");
    const profileResult = await db.collection("candidateprofiles").deleteMany({
      userCode: { $in: [
        "USR-CAN-003", "USR-CAN-004", "USR-CAN-005",
        "USR-CAN-006", "USR-CAN-007", "USR-CAN-008",
        "USR-CAN-009", "USR-CAN-010", "USR-CAN-011", "USR-CAN-012"
      ]}
    });
    console.log(`✓ Deleted ${profileResult.deletedCount} profiles`);

    console.log("\n🔄 Recreating unique indexes...");
    await db.collection("users").createIndex({ code: 1 }, { unique: true });
    console.log("✓ Created code index");
    
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("✓ Created email index");

    console.log("\n✅ Database cleaned successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);