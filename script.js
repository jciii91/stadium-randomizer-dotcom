// Slider value mapping
const sliderValues = ["Vanilla", "Normal", "High", "Extreme"];

function updateSliderValue(sliderId) {
  const slider = document.getElementById(sliderId);
  const valueSpan = document.getElementById(sliderId + "Value");
  valueSpan.textContent = sliderValues[slider.value];
}

// Initialize sliders
document.querySelectorAll('input[type="range"]').forEach(slider => {
  slider.addEventListener('input', () => updateSliderValue(slider.id));
  updateSliderValue(slider.id);
});

// Form submission handler
document.getElementById("settings-form").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent page reload

  const fileInput = document.getElementById("file-upload");
  const file = fileInput.files[0];
  const submitButton = document.querySelector('input[type="submit"]');
  const statusMessage = document.getElementById("statusMessage");

  // Function to update status messages
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

  // Disable submit button and show processing indicator
  submitButton.disabled = true;
  updateStatus("Uploading... Please wait.");

  const FILE_NAME = crypto.randomUUID();
  const reader = new FileReader();

  reader.readAsArrayBuffer(file);
  reader.onload = async function () {
    try {
      const arrayBuffer = reader.result;
      const uint8View = new Uint8Array(arrayBuffer);

      const response = await fetch("https://bbmyb5o2db.execute-api.us-east-2.amazonaws.com/default/uploadToS3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            "fileName": FILE_NAME,
            "fileHeader": Array.from(uint8View.slice(0, 100))
          })
      });

      const presignedUrl = await response.text();
      const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": "application/octet-stream" }
      });

      if (uploadResponse.ok) {
          updateStatus("File uploaded successfully. Processing...");

          // Collect form data
          const formData = {
              "slider1": document.getElementById("slider1").value,
              "slider2": document.getElementById("slider2").value,
              "slider3": document.getElementById("slider3").value,
              "seedCount": document.getElementById("seed-count").value,
              "fileName": FILE_NAME
          };

          // Process file and retrieve download link
          const result = await processFile(formData);
          if (result.success) {
              triggerDownload(result.downloadUrl);
          } else {
              updateStatus("Error: " + result.error, true);
          }
      } else {
          updateStatus("File upload failed. Please try again.", true);
      }
    } catch (error) {
        updateStatus("Error: " + error.message, true);
    } finally {
        submitButton.disabled = false;
        updateStatus("");
    }
  };
});

// Function to process file and return download URL
async function processFile(formData) {
    try {
        const response = await fetch("https://bbmyb5o2db.execute-api.us-east-2.amazonaws.com/default/stadiumRandomizer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        return { success: true, downloadUrl: data.link };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Function to trigger file download
function triggerDownload(downloadUrl) {
    if (!downloadUrl) {
        updateStatus("No download URL returned from server.", true);
        return;
    }

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "new-seed.z64"; // Suggested filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
