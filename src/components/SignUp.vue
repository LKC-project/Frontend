<script setup>
import { ref, onMounted } from 'vue'
import { VParallax } from 'vuetify/components'
import { useRouter } from 'vue-router'
import { Auth, User } from "@/api/index.js"
import { GoogleLogin } from "vue3-google-login"
import Swal from 'sweetalert2'

const router = useRouter()
const agreement = ref(false)
const login = ref(null)
const dialog = ref(false)
const email = ref()
const isValid = ref(false)
const isLoading = ref(false)
const password = ref()
const googleUser = ref(null)


const handleCredentialResponse = (response) => {
  console.log("Google JWT Token: ", response.credential)
  googleUser.value = response.credential
}

onMounted(() => {
  window.google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID",
    callback: handleCredentialResponse
  })
  window.google.accounts.id.renderButton(
      document.getElementById("google-signin-btn"),
      { theme: "outline", size: "large" } 
  )
})


const rules = {
  login: v => !!v || 'Username is required',
  email: v => !!(v || '').match(/@/) || 'Please enter a valid email',
  length: len => v => (v || '').length >= len || `Minimum ${len} characters required`,
  password: v => !!(v || '').match(/^[A-Za-z0-9]+$/) ||
      'Password can only contain letters and numbers',
  required: v => !!v || 'This field is required',
}

const goToRegister = () => router.push('/register')

const submitForm = () => {
  isLoading.value = true

  Auth.login({
    email: email.value,
    password: password.value
  }).then(() => {
    Swal.fire({
      icon: 'success',
      title: 'Login Successful!',
      text: 'Welcome back!',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      router.push('/files');
      setTimeout(() => {window.location.reload()}, 100)
    })
  }).catch(error => {
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: error.message || 'Invalid email or password. Please try again.',
    })
  }).finally(() => {
    isLoading.value = false
  })
}

const callback = async (response) => {
  try {
    isLoading.value = true
    await Auth.google({ credential: response.credential });

    Swal.fire({
      icon: 'success',
      title: 'Google Login Successful!',
      text: 'Welcome back!',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      router.push('/files');
      setTimeout(() => {window.location.reload()}, 100)
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Google Login Failed',
      text: error.message || 'Failed to authenticate with Google. Please try again.',
    })
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <v-parallax
      height="100vh"
      src="https://images.pexels.com/photos/3587347/pexels-photo-3587347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  >
    <v-container class="signup-container">
      <v-card class="signup-card">
        <v-toolbar class="signup-toolbar" color="indigo-lighten-1" dark flat>
          <v-card-title class="text-h6 font-weight-regular">
            Sign up
          </v-card-title>
        </v-toolbar>

        <v-form ref="form" v-model="isValid" class="form-content">
          <v-text-field
              v-model="email"
              :rules="[rules.email]"
              color="deep-purple"
              label="Email address"
              type="email"
              variant="filled"
          />
          <v-text-field
              v-model="password"
              :rules="[rules.password, rules.length(6)]"
              color="deep-purple"
              counter="6"
              label="Password"
              type="password"
              variant="filled"
          />
        </v-form>

        <v-divider>or</v-divider>

        <div class="google-login-container">
          <GoogleLogin :callback="callback" />
        </div>

        <v-card-actions>
          <v-btn variant="text" @click="goToRegister">Register</v-btn>
          <v-spacer></v-spacer>
          <v-btn
              :loading="isLoading"
              color="deep-purple-accent-4"
              @click="submitForm"
              :disabled="!isValid"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-parallax>
</template>


<style scoped>
.signup-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.signup-card {
  padding: 24px;
  width: 400px;
  max-width: 500px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 1);
  backdrop-filter: blur(10px);
}

.signup-toolbar {
  border-radius: 12px;
  background-color: #5C6BC0 !important;
}

.form-content {
  padding: 16px 16px 0 16px;
}

.google-login-container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px 0;
}
</style>