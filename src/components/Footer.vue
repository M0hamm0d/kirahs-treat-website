<template>
  <footer class="footer-container">
    <div class="footer-main">
      <div class="footer-col brand-info">
        <div class="logo-wrapper">
          <img src="/kirah_treat_logo_trans.png" alt="Kirah's Treat Logo" />
        </div>
        <p>
          Bringing sweetness and savory delights to your doorstep with love.
        </p>
      </div>

      <div class="footer-col">
        <ul class="footer-links">
          <li><RouterLink to="/">Home</RouterLink></li>
          <!-- <li><RouterLink to="/">About us</RouterLink></li> -->
          <li><RouterLink to="/menu">Our Menu</RouterLink></li>
          <li><RouterLink to="/cart">Cart</RouterLink></li>
          <!-- <li><RouterLink to="/">Testimonials</RouterLink></li> -->
        </ul>
      </div>

      <div class="footer-col contact-details">
        <a href="tel:+2348064288340">+2348064288340</a>
        <a href="wuraolashakirah4@gmail.com">wuraolashakirah4@gmail.com</a>
      </div>

      <div class="footer-col address">
        <p>
          Available for Delivery Across <br />
          Ilorin, Kwara State, Nigeria.
        </p>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="bottom-content">
        <p>&copy; 2026 Kirah's Treat. All rights reserved.</p>
        <div class="social-icons">
          <a href="#"><i class="fab fa-linkedin"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-facebook"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>
<style scoped>
.footer-container {
  width: 100%;
  padding-top: 60px;
  background-color: #fdf8f0;
  border-top: 1px solid #5d2a18;
  font-family: Satoshi;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  max-width: 90%;
  margin: 0 auto 60px;
  gap: 40px;
  flex-wrap: wrap;
}

.footer-col {
  flex: 1;
  min-width: 200px;
}

.logo-wrapper img {
  height: 50px;
  margin-bottom: 20px;
}

.brand-info p {
  color: #5d2a18;
  line-height: 1.6;
  font-size: 15px;
  max-width: 250px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  /* text-decoration: none; */
  color: #7a4a3a;
  font-size: 15px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #c05c3b;
}

.contact-details {
  display: flex;
  flex-direction: column;
}

.contact-details a {
  margin-bottom: 12px;
  color: #7a4a3a;
  text-decoration: none;
}

.contact-details p,
.address p {
  color: #7a4a3a;
  font-size: 15px;
  margin-bottom: 12px;
}

/* Bottom Bar Styling */
.footer-bottom {
  background-color: #c05c3b; /* Your Burnt Orange */
  padding: 20px 0;
  color: #fff;
}

.bottom-content {
  max-width: 90%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  justify-content: center;
  align-items: center;
}

.bottom-content p {
  margin: 0;
  font-size: 14px;
}

.social-icons {
  display: flex;
  gap: 20px;
  font-size: 20px;
}

.social-icons a {
  color: #fff;
  transition: opacity 0.3s;
}

.social-icons a:hover {
  opacity: 0.7;
}

@media (max-width: 768px) {
  .bottom-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>
