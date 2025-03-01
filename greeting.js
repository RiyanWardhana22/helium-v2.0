document.getElementById("greeting").textContent = getGreeting();

function getGreeting() {
  const hour = new Date().getHours(); // Mendapatkan jam saat ini (0-23)
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "Pagi 🌞";
  } else if (hour >= 12 && hour < 15) {
    greeting = "Siang ☀️";
  } else if (hour >= 15 && hour < 18) {
    greeting = "Sore 🌇";
  } else {
    greeting = "Malam 🌙";
  }
  return greeting;
}
