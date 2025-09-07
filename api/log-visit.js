import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
});
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection("logs").orderBy("timestamp", "desc").get();
    const logs = snapshot.docs.map(doc => ({
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString()
    }));
    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
