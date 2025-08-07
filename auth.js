// ----- SIGN UP -----
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const phone = document.getElementById('phone')?.value.trim();

    if (!name || !email || !password || !phone) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, login_type: 'manual' }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        window.location.href = 'login.html';
      }
    } catch (err) {
      alert('Error during sign-up.');
    }
  });
}

// ----- LOGIN -----
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        // Save user in localStorage if needed
        window.location.href = 'dashboard.html'; // Change to your dashboard
      }
    } 
    catch (err) {
      alert('Error during login.');
    }
  });
}

// ----- FORGOT PASSWORD - STEP 1: Send OTP -----
const otpRequestForm = document.getElementById('otp-request-form');
const resetForm = document.getElementById('reset-form');

if (otpRequestForm && resetForm) {
  otpRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email')?.value.trim();
    if (!email) {
      alert('Please enter your email.');
      return;
    }

    try {
      const res = await fetch('send_otp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        otpRequestForm.style.display = 'none';
        resetForm.style.display = 'flex';
      }
    } catch (err) {
      alert('Failed to send OTP.');
    }
  });

  // ----- STEP 2: Reset Password -----
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email')?.value.trim(); // reuse previous email
    const otp = document.getElementById('otp')?.value.trim();
    const newPassword = document.getElementById('new-password')?.value;

    if (!otp || !newPassword) {
      alert('Please fill all fields.');
      return;
    }

    try {
      const res = await fetch('reset_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        window.location.href = 'login.html';
      }
    } catch (err) {
      alert('Failed to reset password.');
    }
  });
}
