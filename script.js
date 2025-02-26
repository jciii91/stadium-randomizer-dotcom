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
