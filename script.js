const form = document.getElementById("complaint-form");
const status = document.getElementById("status");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    status.textContent = "Please fill out every field before submitting.";
    status.className = "status error";
    form.reportValidity();
    return;
  }

  const payload = {
    segment: form.segment.value,
    category: form.category.value,
    details: form.details.value.trim(),
    submittedAt: new Date().toISOString(),
  };

  console.log("Complaint submitted:", payload);

  status.textContent = "Thanks — your complaint was logged to the browser console.";
  status.className = "status success";
  form.reset();
});
