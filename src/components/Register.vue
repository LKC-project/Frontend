<script setup>
import { ref, onMounted } from 'vue'
import { VParallax } from 'vuetify/components'
import { useRouter } from 'vue-router'
import { Auth, User } from "@/api/index.js"
import axios from "axios"
import { GoogleLogin } from "vue3-google-login"
import Swal from 'sweetalert2'

const router = useRouter()
const agreement = ref(false)
const name = ref()
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
      {theme: "outline", size: "large"}
  )
})


const rules = {
  name: v => !!v || 'Username is required',
  email: v => !!(v || '').match(/@/) || 'Please enter a valid email',
  length: len => v => (v || '').length >= len || `Minimum ${len} characters required`,
  password: v => !!(v || '').match(/^[A-Za-z0-9]+$/) ||
      'Password can only contain letters and numbers',
  required: v => !!v || 'This field is required',
}

const goToSignUp = () => router.push('/signup')

const registerChain = async () => {
  try {
    isLoading.value = true

    await Auth.register({
      name: name.value,
      email: email.value,
      password: password.value
    })

    await Auth.login({
      email: email.value,
      password: password.value
    })

    await User.me().then(user => {
      console.log(user)
    })

    await Swal.fire({
      icon: 'success',
      title: 'Registration Successful!',
      text: 'Welcome to our platform!',
      timer: 2000,
      showConfirmButton: false
    })

    await router.push('/files')
    setTimeout(() => {
      window.location.reload()
    }, 100)

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: error.message || 'An error occurred during registration. Please try again.',
    })
  } finally {
    isLoading.value = false
  }
}

const submitForm = () => {
  if (isValid.value) {
    registerChain()
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Form',
      text: 'Please fill out all required fields correctly.',
    })
  }
}

const callback = async (response) => {
  try {
    isLoading.value = true
    await Auth.google({credential: response.credential})

    await Swal.fire({
      icon: 'success',
      title: 'Google Registration Successful!',
      text: 'Welcome to our platform!',
      timer: 2000,
      showConfirmButton: false
    })

    await router.push('/files')
    window.location.reload()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Google Registration Failed',
      text: error.message || 'Failed to register with Google. Please try again.',
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
    <v-container class="register-container">
      <v-card class="register-card">
        <v-toolbar class="register-toolbar" color="indigo-lighten-1" dark flat>
          <v-card-title class="text-h6 font-weight-regular">
            Register
          </v-card-title>
        </v-toolbar>

        <v-form ref="form" v-model="isValid" class="form-content">
          <v-text-field
              v-model="name"
              :rules="[rules.name, rules.length(6)]"
              color="deep-purple"
              counter="6"
              label="Name"
              type="text"
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
          <v-text-field
              v-model="email"
              :rules="[rules.email]"
              color="deep-purple"
              label="Email address"
              type="email"
              variant="filled"
          />
          <v-checkbox v-model="agreement" :rules="[rules.required]" color="deep-purple">
            <template v-slot:label>
              <div class="checkbox-label">
                I agree to the
                <a href="#" @click.stop.prevent="dialog = true">Terms of Service</a> and
                <a href="#" @click.stop.prevent="dialog = true">Privacy Policy</a>*
              </div>
            </template>
          </v-checkbox>
        </v-form>

        <v-divider>or</v-divider>

        <div class="google-login-container">
          <GoogleLogin :callback="callback"/>
        </div>

        <v-card-actions>
          <v-btn variant="text" @click="goToSignUp">Sign In</v-btn>
          <v-spacer></v-spacer>
          <v-btn
              :loading="isLoading"
              color="deep-purple-accent-4"
              @click="submitForm"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-parallax>
</template>


<style scoped>
.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.register-card {
  padding: 24px;
  width: 400px;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: var(--v-theme-shadow-10);
  background-color: rgba(255, 255, 255, 1);
  backdrop-filter: blur(10px);
}

.register-toolbar {
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

.checkbox-label {
  font-size: 0.875rem;
  line-height: 1.4;
}
</style>