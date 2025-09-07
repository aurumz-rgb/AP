export default async function handler(req, res) {
  const { password } = req.body || {};
  if(password === process.env.DASHBOARD_PASSWORD){
    res.status(200).json({ success: true });
  } else {
    res.status(200).json({ success: false });
  }
}

