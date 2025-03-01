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

  // Collect form data
  const formData = {
    slider1: document.getElementById("slider1").value,
    slider2: document.getElementById("slider2").value,
    slider3: document.getElementById("slider3").value,
    seedCount: document.getElementById("seed-count").value
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
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
});