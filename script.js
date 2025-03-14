const sliderValues = ["Vanilla", "Normal", "High", "Extreme"];

function updateSliderValue(sliderId) {
  const slider = document.getElementById(sliderId);
  const valueSpan = document.getElementById(sliderId + "Value");
  valueSpan.textContent = sliderValues[slider.value];
}

document.querySelectorAll('input[type="range"]').forEach(slider => {
  slider.addEventListener('input', () => updateSliderValue(slider.id));
  updateSliderValue(slider.id); // Initialize the value
});

document.getElementById("settings-form").addEventListener("submit", async function(event) {
  event.preventDefault();  // Prevent page reload

  const fileInput = document.getElementById("file-upload");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const FILE_NAME = crypto.randomUUID();

  const reader = new FileReader();
  reader.readAsDataURL(file); // Read file as Base64
  reader.onload = async function () {

    const response = await fetch("https://bbmyb5o2db.execute-api.us-east-2.amazonaws.com/default/uploadToS3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"fileName": FILE_NAME})
    });

    const presignedUrl = await response.text();

    const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { 
          "Content-Type": "application/octet-stream"
        }
    });

    if (uploadResponse.ok) {
        console.log("File uploaded successfully to S3!");

        // Collect form data
        const formData = {
            "slider1": document.getElementById("slider1").value,
            "slider2": document.getElementById("slider2").value,
            "slider3": document.getElementById("slider3").value,
            "seedCount": document.getElementById("seed-count").value,
            "fileName": FILE_NAME
        };

        try {
            const response = await fetch("https://bbmyb5o2db.execute-api.us-east-2.amazonaws.com/default/stadiumRandomizer", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log("Response:", data.status);

            const downloadUrl = data.link;

            if (!downloadUrl) {
                throw new Error("No download URL returned from server.");
            }

            // Automatically trigger the file download
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "new-seed.z64"; // Suggested filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error:", error);
        }
    } else {
        console.error("Failed to upload file.");
    }
  }
});
