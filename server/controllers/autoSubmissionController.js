// controllers/autoSubmissionController.js
const cron = require("node-cron");
const InvoiceForm = require("../models/InvoiceForm");
const SubmissionSchedule = require("../models/SubmissionSchedule");
const axios = require("axios");

let autoSubmissionJob;
let scheduledSubmissionJob;

const submitToZATCA = async (invoice) => {
  const payload = {
    invoiceHash: invoice.hashKey,
    uuid: invoice.UUID,
    invoice: invoice.base64XML,
  };

  const username =
    "TUlJRDNqQ0NBNFNnQXdJQkFnSVRFUUFBT0FQRjkwQWpzL3hjWHdBQkFBQTRBekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVVscEZTVTVXVDBsRFJWTkRRVFF0UTBFd0hoY05NalF3TVRFeE1Ea3hPVE13V2hjTk1qa3dNVEE1TURreE9UTXdXakIxTVFzd0NRWURWUVFHRXdKVFFURW1NQ1FHQTFVRUNoTWRUV0Y0YVcxMWJTQlRjR1ZsWkNCVVpXTm9JRk4xY0hCc2VTQk1WRVF4RmpBVUJnTlZCQXNURFZKcGVXRmthQ0JDY21GdVkyZ3hKakFrQmdOVkJBTVRIVlJUVkMwNE9EWTBNekV4TkRVdE16azVPVGs1T1RrNU9UQXdNREF6TUZZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUFvRFFnQUVvV0NLYTBTYTlGSUVyVE92MHVBa0MxVklLWHhVOW5QcHgydmxmNHloTWVqeThjMDJYSmJsRHE3dFB5ZG84bXEwYWhPTW1Obzhnd25pN1h0MUtUOVVlS09DQWdjd2dnSURNSUd0QmdOVkhSRUVnYVV3Z2FLa2daOHdnWnd4T3pBNUJnTlZCQVFNTWpFdFZGTlVmREl0VkZOVWZETXRaV1F5TW1ZeFpEZ3RaVFpoTWkweE1URTRMVGxpTlRndFpEbGhPR1l4TVdVME5EVm1NUjh3SFFZS0NaSW1pWlB5TEdRQkFRd1BNems1T1RrNU9UazVPVEF3TURBek1RMHdDd1lEVlFRTURBUXhNVEF3TVJFd0R3WURWUVFhREFoU1VsSkVNamt5T1RFYU1CZ0dBMVVFRHd3UlUzVndjR3g1SUdGamRHbDJhWFJwWlhNd0hRWURWUjBPQkJZRUZFWCtZdm1tdG5Zb0RmOUJHYktvN29jVEtZSzFNQjhHQTFVZEl3UVlNQmFBRkp2S3FxTHRtcXdza0lGelZ2cFAyUHhUKzlObk1Ic0dDQ3NHQVFVRkJ3RUJCRzh3YlRCckJnZ3JCZ0VGQlFjd0FvWmZhSFIwY0RvdkwyRnBZVFF1ZW1GMFkyRXVaMjkyTG5OaEwwTmxjblJGYm5KdmJHd3ZVRkphUlVsdWRtOXBZMlZUUTBFMExtVjRkR2RoZW5RdVoyOTJMbXh2WTJGc1gxQlNXa1ZKVGxaUFNVTkZVME5CTkMxRFFTZ3hLUzVqY25Rd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWgvcWxaWVhaaEQ0Q0FXUUNBUkl3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdNR0NDc0dBUVVGQndNQ01DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3TXdDZ1lJS3dZQkJRVUhBd0l3Q2dZSUtvWkl6ajBFQXdJRFNBQXdSUUloQUxFL2ljaG1uV1hDVUtVYmNhM3ljaThvcXdhTHZGZEhWalFydmVJOXVxQWJBaUE5aEM0TThqZ01CQURQU3ptZDJ1aVBKQTZnS1IzTEUwM1U3NWVxYkMvclhBPT0=";
  const password = "CkYsEXfV8c1gFHAtFWoZv73pGMvh/Qyo4LzKM2h/8Hg=";
  const apiUrl =
    "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/reporting/single";
  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const headers = {
    accept: "application/json",
    "accept-language": "en",
    Authorization: `Basic ${auth}`,
    "Accept-Version": "V2",
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(apiUrl, payload, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error submitting invoice ${invoice.ID}:`, error.message);
    return null;
  }
};

const processPendingInvoices = async () => {
  try {
    const pendingInvoices = await InvoiceForm.find({
      submissionStatus: "PENDING_SUBMISSION",
    });

    let submittedCount = 0;
    for (const invoice of pendingInvoices) {
      const result = await submitToZATCA(invoice);
      if (result && result.reportingStatus === "REPORTED") {
        await InvoiceForm.findByIdAndUpdate(invoice._id, {
          submissionStatus: "SUBMITTED",
          clearanceStatus: result.reportingStatus,
          responseData: result,
        });
        submittedCount++;
        console.log(`Successfully submitted invoice ${invoice.ID}`);
      } else {
        console.log(`Failed to submit invoice ${invoice.ID}`);
      }
    }

    return {
      totalPending: pendingInvoices.length,
      submitted: submittedCount,
      remaining: pendingInvoices.length - submittedCount,
    };
  } catch (error) {
    console.error("Error processing pending invoices:", error);
    throw error;
  }
};

exports.startAutoSubmission = async (req, res) => {
  const { hour, minute, scheduleType } = req.body;

  if (
    hour === undefined ||
    minute === undefined ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return res.status(400).json({ error: "Invalid time format" });
  }

  try {
    if (scheduleType === "auto") {
      if (autoSubmissionJob) {
        autoSubmissionJob.stop();
      }

      autoSubmissionJob = cron.schedule(`${minute} ${hour} * * *`, async () => {
        console.log(`Auto submission started at ${new Date()}`);
        try {
          const result = await processPendingInvoices();
          console.log(`Auto submission completed: ${JSON.stringify(result)}`);
        } catch (error) {
          console.error("Error in auto submission:", error);
        }
      });

      await SubmissionSchedule.findOneAndUpdate(
        { scheduleType: "auto" },
        {
          scheduleType: "auto",
          hour,
          minute,
          lastUpdated: new Date(),
          isActive: true,
        },
        { upsert: true, new: true }
      );
    } else if (scheduleType === "manual") {
      if (scheduledSubmissionJob) {
        scheduledSubmissionJob.stop();
      }

      scheduledSubmissionJob = cron.schedule(
        `${minute} ${hour} * * *`,
        async () => {
          console.log(`Scheduled submission started at ${new Date()}`);
          try {
            const result = await processPendingInvoices();
            console.log(
              `Scheduled submission completed: ${JSON.stringify(result)}`
            );
          } catch (error) {
            console.error("Error in scheduled submission:", error);
          }
        }
      );

      await SubmissionSchedule.findOneAndUpdate(
        { scheduleType: "manual" },
        {
          scheduleType: "manual",
          hour,
          minute,
          lastUpdated: new Date(),
          isActive: true,
        },
        { upsert: true, new: true }
      );
    } else {
      return res.status(400).json({ error: "Invalid schedule type" });
    }

    console.log(`${scheduleType} submission set for ${hour}:${minute}`);
    res.status(200).json({
      message: `${scheduleType} submission set successfully for ${hour}:${minute}`,
    });
  } catch (error) {
    console.error(`Error setting up ${scheduleType} submission:`, error);
    res
      .status(500)
      .json({ error: `Error setting up ${scheduleType} submission` });
  }
};

exports.stopAutoSubmission = async (req, res) => {
  const { scheduleType } = req.body;

  try {
    if (scheduleType === "auto") {
      if (autoSubmissionJob) {
        autoSubmissionJob.stop();
        autoSubmissionJob = null;
        await SubmissionSchedule.findOneAndUpdate(
          { scheduleType: "auto" },
          { isActive: false },
          { new: true }
        );
        console.log("Auto submission stopped");
        res
          .status(200)
          .json({ message: "Auto submission stopped successfully" });
      } else {
        res
          .status(400)
          .json({ error: "No auto submission job is currently running" });
      }
    } else if (scheduleType === "manual") {
      if (scheduledSubmissionJob) {
        scheduledSubmissionJob.stop();
        scheduledSubmissionJob = null;
        await SubmissionSchedule.findOneAndUpdate(
          { scheduleType: "manual" },
          { isActive: false },
          { new: true }
        );
        console.log("Scheduled submission stopped");
        res
          .status(200)
          .json({ message: "Scheduled submission stopped successfully" });
      } else {
        res
          .status(400)
          .json({ error: "No scheduled submission job is currently running" });
      }
    } else {
      res.status(400).json({ error: "Invalid schedule type" });
    }
  } catch (error) {
    console.error(`Error stopping ${scheduleType} submission:`, error);
    res
      .status(500)
      .json({ error: `Error stopping ${scheduleType} submission` });
  }
};

exports.manualSubmission = async (req, res) => {
  console.log("Manual submission started");
  try {
    const result = await processPendingInvoices();
    console.log(`Manual submission completed: ${JSON.stringify(result)}`);
    res.status(200).json({
      message: "Manual submission completed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error in manual submission:", error);
    res.status(500).json({ error: "Error processing manual submission" });
  }
};

exports.getPendingInvoicesCount = async (req, res) => {
  try {
    const totalPendingInvoices = await InvoiceForm.countDocuments({
      submissionStatus: "PENDING_SUBMISSION",
    });

    res.status(200).json({ totalPendingInvoices });
  } catch (error) {
    console.error("Error fetching pending invoices count:", error);
    res.status(500).json({ error: "Error fetching pending invoices count" });
  }
};

exports.getSubmissionSchedule = async (req, res) => {
  try {
    const schedules = await SubmissionSchedule.find();
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching submission schedules:", error);
    res.status(500).json({ error: "Error fetching submission schedules" });
  }
};
