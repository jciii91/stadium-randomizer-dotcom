document.getElementById("settings-form").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent page reload

  const fileInput = document.getElementById("file-upload");
  const file = fileInput.files[0];
  const submitButton = document.querySelector('input[type="submit"]');
  const statusMessage = document.getElementById("statusMessage");

  function updateStatus(message, isError = false) {
      statusMessage.textContent = message;
      statusMessage.style.color = isError ? "red" : "black";
      statusMessage.style.display = "block";
  }

  if (!file) {
      updateStatus("Please select a file to upload.", true);
      return;
  }

  // Validate file extension
  if (!file.name.toLowerCase().endsWith(".z64")) {
      updateStatus("Invalid file type. Please upload a .z64 file.", true);
      return;
  }

  // Read first 100 bytes for backend validation
  const reader = new FileReader();
  reader.onload = async function(event) {
      const buffer = new Uint8Array(event.target.result);
      const base64Header = btoa(String.fromCharCode(...buffer)); // Convert to Base64 for easy transmission

      await requestUploadLink(file, base64Header, submitButton, updateStatus);
  };

  // Read the first 100 bytes
  const blob = file.slice(0, 100);
  reader.readAsArrayBuffer(blob);
});

// Function to request upload link and proceed with file upload
async function requestUploadLink(file, fileHeader, submitButton, updateStatus) {
  submitButton.disabled = true;
  updateStatus("Validating file... Please wait.");

  const FILE_NAME = crypto.randomUUID();

  try {
      const response = await fetch("https://bbmyb5o2db.execute-api.us-east-2.amazonaws.com/default/uploadToS3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "fileName": FILE_NAME, "fileHeader": fileHeader }) // Send file header
      });

      const data = await response.json();
      if (!data.presignedUrl) {
          throw new Error(data.error || "Failed to obtain upload link.");
      }

      await uploadFile(file, data.presignedUrl, FILE_NAME, submitButton, updateStatus);
  } catch (error) {
      updateStatus("Error: " + error.message, true);
      submitButton.disabled = false;
  }
}

// Function to upload file using pre-signed URL
async function uploadFile(file, presignedUrl, FILE_NAME, submitButton, updateStatus) {
  updateStatus("Uploading file... Please wait.");

  try {
      const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": "application/octet-stream" }
      });

      if (!uploadResponse.ok) {
          throw new Error("File upload failed.");
      }

      updateStatus("File uploaded successfully. Processing...");

      // Prepare form data for processing
      const formData = {
          "slider1": document.getElementById("slider1").value,
          "slider2": document.getElementById("slider2").value,
          "slider3": document.getElementById("slider3").value,
          "seedCount": document.getElementById("seed-count").value,
          "fileName": FILE_NAME
      };

      const result = await processFile(formData);
      if (result.success) {
          updateStatus("Download ready! Click the link below.");
          triggerDownload(result.downloadUrl);
      } else {
          updateStatus("Error: " + result.error, true);
      }
  } catch (error) {
      updateStatus("Error: " + error.message, true);
  } finally {
      submitButton.disabled = false;
  }
}
