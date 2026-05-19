const SUBMISSION_URL = "https://script.google.com/macros/s/AKfycbwIQBtuuPCsBAr27TyXdYEAzrwkidqYWGtaOjFZRydbr0gQ6txnSiXtQCK2FkZM33iG/exec";

const form = document.getElementById("complaint-form");
const statusEl = document.getElementById("status");
const submitBtn = form.querySelector(".submit-btn");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    setStatus("Please fill out every field before submitting.", "error");
    form.reportValidity();
    return;
  }

  const payload = {
    segment: form.segment.value,
    category: form.category.value,
    details: form.details.value.trim(),
    website: form.website.value, // honeypot
    userAgent: navigator.userAgent,
  };

  if (!SUBMISSION_URL) {
    console.log("Complaint (no endpoint configured yet):", payload);
    setStatus("Submission endpoint not configured yet — logged to console.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Submitting…");

  try {
    const res = await fetch(SUBMISSION_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.ok === false) {
      throw new Error(result.error || `HTTP ${res.status}`);
    }
    setStatus("Thanks — your complaint was submitted.", "success");
    form.reset();
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong. Please try again in a moment.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = kind ? `status ${kind}` : "status";
}
