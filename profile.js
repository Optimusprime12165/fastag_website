document.addEventListener("DOMContentLoaded", () => {
  fetch("profile.php")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const u = data.user;
        document.getElementById("name").value = u.name || "";
        document.getElementById("email").value = u.email || "";
        document.getElementById("phone").value = u.phone || "";
        document.getElementById("house_no").value = u.house_no || "";
        document.getElementById("landmark").value = u.landmark || "";
        document.getElementById("city").value = u.city || "";
        document.getElementById("pincode").value = u.pincode || "";
      } else {
        document.getElementById("status-message").innerText = data.message;
      }
    });

  document.getElementById("profile-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    fetch("update_profile.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById("status-message").innerText = data.message;
      });
  });
});
