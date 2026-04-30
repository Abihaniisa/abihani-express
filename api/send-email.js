export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    var body = req.body;
    var to = body.to;
    var subject = body.subject;
    var html = body.html;
    if (!to || !subject || !html) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }
    try {
        var response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
            },
            body: JSON.stringify({
                from: 'Abihani Express <support@abihaniexpress.com.ng>',
                to: Array.isArray(to) ? to : [to],
                subject: subject,
                html: html,
                reply_to: 'bayeroisa2003@gmail.com'
            })
        });
        var data = await response.json();
        if (response.ok) {
            res.status(200).json({ success: true, id: data.id });
        } else {
            res.status(response.status).json({ error: data.message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}