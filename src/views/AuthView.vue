<script setup>
import { ref, computed } from "vue";
import { supabase } from "@/supabase";

const mode = ref("signin");
const isLoading = ref(false);
import { useRouter } from "vue-router";

const router = useRouter();
const form = ref({
  email: "",
  password: "",
  name: "",
});

const emailIsValid = computed(() => {
  return form.value.email.includes("@") && form.value.email.includes(".");
});

function handleMode(param) {
  form.value = {
    email: "",
    password: "",
    name: "",
  };
  mode.value = param;
}

const handleSignUp = async () => {
  isLoading.value = true;
  try {
    let { data, error: supabaseError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
    });
    if (supabaseError) {
      throw supabaseError;
    }
    const userId = data?.user?.id;
    if (userId) {
      await supabase.from("profile").insert({
        id: userId,
        user_name: form.value.name,
        user_email: form.value.email,
      });
    }
    console.log(data);
    router.push("/");
  } catch (err) {
    console.log(err);
  } finally {
    isLoading.value = false;
  }
  //   console.log(`${mode.value} attempt for:`, form.value.email);
};
async function handleSignIn() {
  isLoading.value = true;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password,
    });
    if (error) {
      throw error;
    }
    router.push("/");
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
}
</script>
<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Welcome {{ mode == "signin" ? "Back" : "to Kirah's Treat" }}</h2>
      <p class="subtitle" v-if="mode == 'signin'">
        Welcome Back, Please enter Your details
      </p>
      <p class="subtitle" v-else>Create an account to get started</p>

      <div class="auth-toggle">
        <button
          :class="{ active: mode === 'signin' }"
          @click="handleMode('signin')"
        >
          Sign In
        </button>
        <button
          :class="{ active: mode === 'signup' }"
          @click="handleMode('signup')"
        >
          Signup
        </button>
      </div>

      <form class="auth-form" @submit.prevent>
        <div class="input-group">
          <!-- <span class="icon">✉️</span> -->
          <div class="input-stack" v-if="mode === 'signup'">
            <label>Name</label>
            <input
              type="text"
              v-model="form.name"
              placeholder="Input your name here"
              required
            />
          </div>
        </div>
        <div class="input-group">
          <!-- <span class="icon">✉️</span> -->
          <div class="input-stack">
            <label>Email Address</label>
            <input
              type="email"
              v-model="form.email"
              placeholder="email@example.com"
              required
            />
          </div>
          <span v-if="emailIsValid" class="success-check">✔️</span>
        </div>
        <div class="password">
          <!-- <span class="icon"></span> -->
          <div class="input-stack">
            <label>Password</label>
            <input
              type="password"
              v-model="form.password"
              placeholder="input your password here"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          class="login"
          v-if="mode == 'signin'"
          @click="handleSignIn"
        >
          {{ isLoading ? "loading..." : "Sign in" }}
        </button>
        <button type="submit" class="signup" @click="handleSignUp" v-else>
          {{ isLoading ? "loading..." : "Sign up" }}
        </button>
      </form>

      <!-- <div class="divider">
        <span>Or Continue With</span>
      </div>

      <div class="social-auth">
        <button class="social-circle google">
          <img src="/google-icon.svg" />
        </button>
        <button class="social-circle apple">
          <img src="/apple-icon.svg" />
        </button>
        <button class="social-circle facebook">
          <img src="/fb-icon.svg" />
        </button>
      </div> -->

      <p class="footer-text">
        Join the lovers of sweets and savories who trust us for their treats.
        {{ mode == "signin" ? "Log in" : "Sign up" }} to track your orders and
        get personalized recommendations.
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 20px;
  margin-top: 90px;
  font-family: Satoshi;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  text-align: center;
}

h2 {
  font-size: 28px;
  color: #000;
  margin-bottom: 8px;
  font-weight: 700;
}
.subtitle {
  color: #999;
  font-size: 14px;
  margin-bottom: 30px;
}

/* Segmented Toggle Styling */
.auth-toggle {
  background: #f2f2f2;
  padding: 5px;
  border-radius: 12px;
  display: flex;
  margin-bottom: 25px;
}

.auth-toggle button {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
}

.auth-toggle button.active {
  background: #fff;
  color: #000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Input Group Styling */
.input-group,
.password {
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #eee;
  padding: 12px 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  text-align: left;
}

.input-stack {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.input-stack label {
  font-size: 11px;
  color: #999;
  font-weight: 600;
}
.input-stack input {
  border: none;
  outline: none;
  font-size: 15px;
  padding: 4px 0;
}

.login,
.signup {
  width: 100%;
  background: #c05c3b; /* Kirah's Burnt Orange */
  color: #fff;
  border: none;
  padding: 18px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 30px;
}

.divider {
  position: relative;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.divider span {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 0 15px;
  font-size: 12px;
  color: #999;
}

/* Social Buttons */
.social-auth {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.social-circle {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: 1px solid #eee;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.social-circle.apple {
  background: #000;
  border: none;
}
.social-circle.facebook {
  background: #1877f2;
  border: none;
}

.footer-text {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
  padding: 0 10px;
}
</style>
