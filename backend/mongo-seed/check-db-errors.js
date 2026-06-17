import { MongoClient } from 'mongodb';

const uri = "mongodb://127.0.0.1:27017/viecnhanh";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("viecnhanh");
    
    console.log("📊 Database Status Check\n");
    
    // Check users collection
    console.log("👥 Users Collection:");
    const userCount = await db.collection("users").countDocuments();
    console.log(`   Total users: ${userCount}`);
    
    const duplicateEmails = await db.collection("users").aggregate([
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicateEmails.length > 0) {
      console.log(`   ⚠️  Duplicate emails found: ${duplicateEmails.length}`);
      duplicateEmails.forEach(d => console.log(`      - ${d._id}: ${d.count} times`));
    } else {
      console.log("   ✓ No duplicate emails");
    }
    
    const duplicateCodes = await db.collection("users").aggregate([
      { $group: { _id: "$code", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicateCodes.length > 0) {
      console.log(`   ⚠️  Duplicate codes found: ${duplicateCodes.length}`);
      duplicateCodes.forEach(d => console.log(`      - ${d._id}: ${d.count} times`));
    } else {
      console.log("   ✓ No duplicate codes");
    }
    
    // Check indexes
    console.log("\n🔑 Indexes:");
    const indexes = await db.collection("users").getIndexes();
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`   - ${name}:`, spec);
    });
    
    // Check candidate profiles
    console.log("\n👷 Candidate Profiles:");
    const profileCount = await db.collection("candidateprofiles").countDocuments();
    console.log(`   Total profiles: ${profileCount}`);
    
    // Sample users
    console.log("\n📋 Sample Users:");
    const samples = await db.collection("users").find({}).limit(5).toArray();
    samples.forEach(u => {
      console.log(`   - ${u.code}: ${u.name} (${u.email})`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);