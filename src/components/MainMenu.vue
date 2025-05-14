
<template>
  <v-card
      v-if="false"
      class="mx-auto"
  >
    <v-card-item style="background-color: #C5CAE9;">
      <v-card-title>
        LKC
      </v-card-title>

      <template v-slot:append>
        <v-btn
            id="button"
            class="text-none custom-button"
            color="medium-emphasis"
            min-width="92"
            variant="outlined"
            rounded
            @click="goToSignUp"
        >
          Sign In
        </v-btn>

        <v-btn
            id="button"
            class="text-none custom-button"
            color="medium-emphasis"
            min-width="92"
            variant="outlined"
            rounded
            @click="goToRegister"
        >
          Register
        </v-btn>
      </template>
    </v-card-item>
  </v-card>

  <v-parallax
      height="500"
      src="https://images.pexels.com/photos/3587347/pexels-photo-3587347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  >
    <div class="d-flex flex-column fill-height justify-center align-center text-white">
      <h1 class="text-h2 font-weight-thin mb-4">
        Look.Keep.Create.
      </h1>
      <h4 class="text-h6">
        Save your imagination
      </h4>
      <v-btn
          color="white"
          variant="outlined"
          class="rounded-pill px-8 ma-4"
          @click="goToSignUp"
      >
        Sign Up
      </v-btn>

    </div>
  </v-parallax>



  <v-container class="features-section py-16">
    <h2 class="text-h3 text-center font-weight-bold mb-16" style="color: #2d3436">
      Collect everything in one place
    </h2>

    <v-row class="features-grid">
      <v-col cols="12" md="6" lg="3" v-for="(feature, index) in features" :key="index">
        <div class="feature-visual mb-8">
          <v-card flat class="feature-preview" v-if="index === 0">
            <div class="">
              <v-img
                  src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
                  height="200"
                  class="mb-2"
              ></v-img>
            </div>
          </v-card>
          <v-card flat class="feature-preview" v-else-if="index === 1">
            <v-img
                src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
                height="200"
                class="mb-2"
            ></v-img>
            <!--            <div class="pdf-preview pa-2 d-flex align-center">-->
            <!--              <v-icon color="red" class="mr-2">mdi-file-pdf-box</v-icon>-->
            <!--              <span class="text-body-2">Retouched-photos.pdf</span>-->
            <!--              <span class="text-caption text-grey ml-auto">8.6 / 12.5 MB</span>-->
            <!--            </div>-->
          </v-card>
          <v-card flat class="feature-preview" v-else-if="index === 2">
            <v-img
                src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
                height="200"
                class="rounded-lg"
            ></v-img>
          </v-card>
          <v-card flat class="feature-preview" v-else>
            <v-img
                src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
                height="200"
                class="mobile-preview"
            ></v-img>
          </v-card>
        </div>

        <h3 class="text-h5 font-weight-bold mb-3">{{ feature.title }}</h3>
        <p class="text-body-1 text-grey-darken-1">
          {{ feature.description }}
          <span v-if="feature.link" class="red-link">{{ feature.link }}</span>
        </p>
      </v-col>
    </v-row>
  </v-container>

  <v-container class="category-section py-16">
    <div class="text-center mb-4">
      <span class="text-white">LKC is used by:</span>
    </div>

    <v-carousel
        v-model="activeSlide"
        hide-delimiters
        :show-arrows="false"
        height="600"
        interval="5000"
        cycle
    >
      <v-carousel-item
          v-for="category in categories"
          :key="category.id"
      >
        <v-container class="category-text text-center mb-4">
          <h2 class="text-h3 text-white font-weight-medium">
            {{ category.title }}
          </h2>

          <!--          <v-chip-->
          <!--              class="category-chip mt-2 mb-6"-->
          <!--              variant="text"-->
          <!--          >-->
          <!--            {{ category.name }}-->
          <!--          </v-chip>-->

          <div class="mt-6 mb-8">
            <v-btn
                color="white"
                variant="outlined"
                class="rounded-pill px-8"
                @click="goToRegister"
            >
              Find out how
            </v-btn>
          </div>
        </v-container>

        <v-card
            class="mx-auto overflow-hidden"
            max-width="900"
            elevation="8"
        >
          <v-img
              :src="category.image"
              height="400"
              cover
          ></v-img>
        </v-card>
      </v-carousel-item>
    </v-carousel>
  </v-container>


</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {VParallax} from "vuetify/components";

const router = useRouter()
const activeTab = ref('recent')
const show = ref({ 1: false, 2: false, 3: false })

const goToSignUp = () => router.push('/signup')
const goToRegister = () => router.push('/register')

const features = [
  {
    title: 'Write notes & to-do lists',
    description: 'Simple text editing and task management make it easy to add your thoughts to a board.'
  },
  {
    title: 'Upload images & files',
    description: 'Supports all common file types including JPGs, PDFs, Word, Excel, common design files and many more.'
  },
  {
    title: 'Save text, images & links from the web',
    description: 'Supports all common file types including JPGs, PDFs, Word, Excel, common design files and many more.',
    description2: ' lets you save inspiration and ideas from any website with a single click.'
  },
  {
    title: 'Add notes & photos from your phone',
    description: 'Supports all common file types including JPGs, PDFs, Word, Excel, common design files and many more. ',
    link: 'App',
    description2: ' will be ready to organize as soon as youre back at your computer.'
  },
]
const categories = [
  {
    id: 'designers',
    name: 'Designers',
    title: 'Designers use LKC to create amazing things',
    image: 'https://plus.unsplash.com/premium_photo-1676117273692-a04252d1a3b7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'directors',
    name: 'Creative directors',
    title: 'Creative directors bring visions to life',
    image: 'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'marketers',
    name: 'Marketers',
    title: 'Marketers plan successful campaigns',
    image: 'https://plus.unsplash.com/premium_photo-1676070096504-f49698ed74be?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'writers',
    name: 'Writers',
    title: 'Writers craft compelling stories',
    image: 'https://plus.unsplash.com/premium_photo-1676654935937-109c7936b8ff?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'agencies',
    name: 'Agencies',
    title: 'Agencies collaborate seamlessly',
    image: 'https://images.unsplash.com/photo-1506463108611-88834e9f6169?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'startups',
    name: 'Startups',
    title: 'Startups use LKC to figure out whats next',
    image: 'https://images.unsplash.com/photo-1503776768674-0e612f631345?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
]

const activeSlide = ref(0)
const selectedCategory = ref('designers')

const getCurrentCategory = computed(() => {
  return categories.find(cat => cat.id === selectedCategory.value) || categories[0]
})

</script>

<style scoped>
.category-text {
  text-align: center;
  width: 100%;
}

.card {
  padding: 20px;
  margin: 25px;
}

.custom-button {
  margin: 3px 5px 1px 1px;
}
.features-section {
  max-width: 1400px;
}

.feature-preview {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.feature-preview:hover {
  transform: translateY(-4px);
}

.todo-list {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
}

.pdf-preview {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.mobile-preview {
  position: relative;
  transform: perspective(1000px) rotateY(-15deg) rotateX(5deg);
}

.red-link {
  color: #ff5252;
  text-decoration: none;
  cursor: pointer;
}

.red-link:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .features-grid {
    row-gap: 48px;
  }
}
.category-section {
  background-color: #2d3436;
}

.category-chip {
  color: #ffffff80 !important;
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  transition: all 0.3s ease;
}

.category-chip:hover {
  color: white !important;
}

.category-chip.selected {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}
</style>