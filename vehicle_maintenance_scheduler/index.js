const express = require('express');
const axios = require('axios');

const app = express();

const logger = require('../logging_middleware/logger');
app.use(logger);

app.use(express.json());

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJtdDczMTZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMzg2NSwiaWF0IjoxNzc3NzAyOTY1LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMmRmYWI2ZTktOGZjMi00YzJjLTg5MTgtZGE3NDM5MTFmYzQ5IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibWF5YW5rIHRoYXdhbmkiLCJzdWIiOiIwMDBmOWE3YS04NjNjLTQzY2MtODM3Zi1jOWRiZTY3NTg1Y2YifSwiZW1haWwiOiJtdDczMTZAc3JtaXN0LmVkdS5pbiIsIm5hbWUiOiJtYXlhbmsgdGhhd2FuaSIsInJvbGxObyI6InJhMjMxMTAzMDAxMDIxOSIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6IjAwMGY5YTdhLTg2M2MtNDNjYy04MzdmLWM5ZGJlNjc1ODVjZiIsImNsaWVudFNlY3JldCI6InlKellOd2VGSHJodld1aFkifQ.yijLl9KlQQ-nhLhxbdXs5sDFr1l8vsc8Mf9z9l0IKhk";

const AUTH = {
  headers: {
    Authorization: `Bearer ${TOKEN}`
  }
};

const DEPOT_API = "http://20.207.122.201/evaluation-service/depots";
const VEHICLE_API = "http://20.207.122.201/evaluation-service/vehicles";

function selectTasks(tasks, capacity) {
  tasks.sort((a, b) => (b.Impact / b.Duration) - (a.Impact / a.Duration));

  let totalTime = 0;
  let totalImpact = 0;
  let selectedTasks = [];

  for (let task of tasks) {
    if (totalTime + task.Duration <= capacity) {
      selectedTasks.push(task);
      totalTime += task.Duration;
      totalImpact += task.Impact;
    }
  }

  return { selectedTasks, totalImpact };
}

app.get('/schedule', async (req, res) => {
  try {
    const depotResponse = await axios.get(DEPOT_API, AUTH);
    const depots = depotResponse.data.depots;

    const vehicleResponse = await axios.get(VEHICLE_API, AUTH);
    const vehicles = vehicleResponse.data.vehicles;

    let finalResult = [];

    for (let depot of depots) {
      const capacity = depot.MechanicHours;
      const result = selectTasks([...vehicles], capacity);

      finalResult.push({
        depotId: depot.ID,
        totalImpact: result.totalImpact,
        selectedTasks: result.selectedTasks
      });
    }

    res.json({
      success: true,
      data: finalResult
    });

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Error fetching or processing data"
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});