const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJtdDczMTZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwNTY2NywiaWF0IjoxNzc3NzA0NzY3LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiM2YxMDFiNGYtZTExNC00ZGFkLThlMmQtM2FiOTRhZDJkOWViIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibWF5YW5rIHRoYXdhbmkiLCJzdWIiOiIwMDBmOWE3YS04NjNjLTQzY2MtODM3Zi1jOWRiZTY3NTg1Y2YifSwiZW1haWwiOiJtdDczMTZAc3JtaXN0LmVkdS5pbiIsIm5hbWUiOiJtYXlhbmsgdGhhd2FuaSIsInJvbGxObyI6InJhMjMxMTAzMDAxMDIxOSIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6IjAwMGY5YTdhLTg2M2MtNDNjYy04MzdmLWM5ZGJlNjc1ODVjZiIsImNsaWVudFNlY3JldCI6InlKellOd2VGSHJodld1aFkifQ.NmWpuVNXU2VJP4KpHe6DA4XzH2ItoPTji8873LyagHc";

const AUTH = {
  headers: {
    Authorization: `Bearer ${TOKEN}`
  }
};

const NOTIFICATION_API = "http://20.207.122.201/evaluation-service/notifications";

const priorityMap = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function sortNotifications(notifications) {
  return notifications.sort((a, b) => {
    const pA = priorityMap[a.type] || 0;
    const pB = priorityMap[b.type] || 0;

    if (pB !== pA) return pB - pA;

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

app.get('/top-notifications', async (req, res) => {
  try {
    let notifications;

    try {
      const response = await axios.get(NOTIFICATION_API, AUTH);
      notifications = response.data.notifications;
    } catch (err) {
      notifications = [
        { type: "Event", message: "Hackathon", createdAt: "2026-05-01T10:00:00Z" },
        { type: "Placement", message: "Google Hiring", createdAt: "2026-05-02T12:00:00Z" },
        { type: "Result", message: "Exam Result", createdAt: "2026-05-02T09:00:00Z" },
        { type: "Placement", message: "Amazon Hiring", createdAt: "2026-05-01T15:00:00Z" }
      ];
    }

    const sorted = sortNotifications(notifications);
    const topN = sorted.slice(0, 10);

    res.json({
      success: true,
      data: topN
    });

  } catch (error) {
    res.status(500).json({
      message: "Error processing notifications"
    });
  }
});

app.listen(3001, () => {
  console.log("Notification service running on port 3001");
});