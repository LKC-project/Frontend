
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
      src="https://images.pexels.com/photos/30829216/pexels-photo-30829216/free-photo-of-abstract-blue-textured-painting-background-art.jpeg"
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
                  src="public\images\2_1.png"
                  height="200"
                  class="mb-2"
              ></v-img>
            </div>
          </v-card>
          <v-card flat class="feature-preview" v-else-if="index === 1">
            <v-img
                src="public\images\1_1.png"
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
                src="public\images\2_2.png"
                height="200"
                class="rounded-lg"
            ></v-img>
          </v-card>
          <v-card flat class="feature-preview" v-else>
            <v-img
                src="public\images\photo_2025-05-23_10-50-471.jpg"
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

<!--  <v-container class="category-section py-16">-->
<!--    <div class="text-center mb-4">-->
<!--      <span class="text-white">LKC is used by:</span>-->
<!--    </div>-->

<!--    <v-carousel-->
<!--        v-model="activeSlide"-->
<!--        hide-delimiters-->
<!--        :show-arrows="false"-->
<!--        height="600"-->
<!--        interval="5000"-->
<!--        cycle-->
<!--    >-->
<!--      <v-carousel-item-->
<!--          v-for="category in categories"-->
<!--          :key="category.id"-->
<!--      >-->
<!--        <v-container class="category-text text-center mb-4">-->
<!--          <h2 class="text-h3 text-white font-weight-medium">-->
<!--            {{ category.title }}-->
<!--          </h2>-->

<!--          &lt;!&ndash;          <v-chip&ndash;&gt;-->
<!--          &lt;!&ndash;              class="category-chip mt-2 mb-6"&ndash;&gt;-->
<!--          &lt;!&ndash;              variant="text"&ndash;&gt;-->
<!--          &lt;!&ndash;          >&ndash;&gt;-->
<!--          &lt;!&ndash;            {{ category.name }}&ndash;&gt;-->
<!--          &lt;!&ndash;          </v-chip>&ndash;&gt;-->

<!--          <div class="mt-6 mb-8">-->
<!--            <v-btn-->
<!--                color="white"-->
<!--                variant="outlined"-->
<!--                class="rounded-pill px-8"-->
<!--                @click="goToRegister"-->
<!--            >-->
<!--              Find out how-->
<!--            </v-btn>-->
<!--          </div>-->
<!--        </v-container>-->

<!--        <v-card-->
<!--            class="mx-auto overflow-hidden"-->
<!--            max-width="900"-->
<!--            elevation="8"-->
<!--        >-->
<!--          <v-img-->
<!--              :src="category.image"-->
<!--              height="400"-->
<!--              cover-->
<!--          ></v-img>-->
<!--        </v-card>-->
<!--      </v-carousel-item>-->
<!--    </v-carousel>-->
<!--  </v-container>-->
  <footer>
    <p>Розроблено Харченко Марією, 2025</p>
  </footer>

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
    title: 'Нотатки та зображення в одному місці',
    description: 'Просте редагування тексту та зручне управління завданнями допоможуть легко фіксувати думки й ідеї на дошці'
  },
  {
    title: 'Збереження вмісту',
    description: 'Зберігайте дані у форматі .lkc на пристрої або в Google Drive для швидкого доступу з будь-якого місця',
    description2: ' Також можна зберігати натхнення та ідеї з будь-якого сайту одним кліком.'
  },
  {
    title: 'Інтелектуальний чат з AI',
    description: 'Штучний інтелект аналізує ваші записи на дошці та допомагає працювати з інформацією ефективніше'
  },
  {
    title: 'Додавайте нотатки та фото з телефону',
    description: 'Керуйте своєю дошкою прямо з мобільного пристрою',
    description2: ' Уся інформація буде синхронізована та готова до подальшої роботи, коли ви повернетеся до комп’ютера'
  },
]

const categories = [
  {
    id: 'designers',
    name: 'Дизайнери',
    title: 'Дизайнери використовують LKC для створення дивовижних речей',
    image: 'https://plus.unsplash.com/premium_photo-1676117273692-a04252d1a3b7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'directors',
    name: 'Креативні директори',
    title: 'Креативні директори втілюють бачення в реальність',
    image: 'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'marketers',
    name: 'Маркетологи',
    title: 'Маркетологи планують успішні кампанії',
    image: 'https://plus.unsplash.com/premium_photo-1676070096504-f49698ed74be?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'writers',
    name: 'Письменники',
    title: 'Письменники створюють захопливі історії',
    image: 'https://plus.unsplash.com/premium_photo-1676654935937-109c7936b8ff?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'agencies',
    name: 'Агенції',
    title: 'Агенції працюють разом без перешкод',
    image: 'https://images.unsplash.com/photo-1506463108611-88834e9f6169?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'startups',
    name: 'Стартапи',
    title: 'Стартапи використовують LKC, щоб визначити, що далі',
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

footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: #666;
  background-color: #f9f9f9;
}

</style>