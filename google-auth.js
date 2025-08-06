// Load when Google script is ready
window.onload = function () {
  google.accounts.id.initialize({
    client_id: "435023168805-a4cd2catcmd0hbanbn6tenab3hl3no1m.apps.googleusercontent.com",
    callback: handleGoogleResponse
  });

  const googleSignup = document.getElementById("google-signup");
  const googleLogin = document.getElementById("google-login");

  if (googleSignup) {
    google.accounts.id.renderButton(googleSignup, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
    });
  }

  if (googleLogin) {
    google.accounts.id.renderButton(googleLogin, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
    });
  }
};

// Google callback
async function handleGoogleResponse(response) {
  try {
    const decoded = parseJwt(response.credential);
    const name = decoded.name;
    const email = decoded.email;

    // Determine page type
    const isSignup = !!document.getElementById("google-signup");
    const endpoint = isSignup ? "register.php" : "login.php";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        login_type: "google"
      }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      // You can store token or user info here
      localStorage.setItem("userEmail", email);
      window.location.href = "dashboard.html"; // Change as needed
    }
  } catch (err) {
    alert("Google login failed.");
  }
}

// Decode Google JWT
function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
  return JSON.parse(json);
}
