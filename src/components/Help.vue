<script setup>
import { ref, onMounted } from 'vue';

const windowWidth = ref(window.innerWidth);

onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
});
</script>

<template>
  <v-container class="help-container">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <h1 class="text-h2 text-sm-h3 text-xs-h4 mb-6">Як користуватись LKC?</h1>
      </v-col>
      <v-col cols="12" md="10" lg="8">
        <h2 class="text-h4 text-sm-h5 text-xs-h6 mb-3"> Авторизація користувача</h2>
        <p class="text-body-1 mb-4">Увійдіть у свій обліковий запис або зареєструйтесь, щоб отримати доступ до всіх
          можливостей системи LKC. Після входу ви зможете створювати, зберігати та організовувати дошку.</p>
        <v-img
            src="images\help (4).png"
            alt="Приклад авторизації"
            height="auto"
            max-height="300"
            class="my-4 responsive-image"
            contain
        />
      </v-col>
      <v-col cols="12" md="10" lg="8">
        <h2 class="text-h4 text-sm-h5 text-xs-h6 mb-3">Створення та редагування дошки</h2>
        <p class="text-body-1 mb-4">Після входу ви можете створити нову дошку або відкрити наявну. Дошка — це робочий
          простір, на якому можна розміщувати елементи, редагувати їх, працювати з текстом, зображеннями, нотатками
          тощо. Дошка підтримує:

          перетягування елементів (зображення, текст, нотатки);

          інтерактивне редагування;

          адаптацію інтерфейсу до обраного інструменту.</p>
        <v-img
            src="images\help (2).png"
            alt="Інструменти створення дошки"
            height="auto"
            max-height="500"
            class="my-4 responsive-image"
            contain
        />
        <v-img
            src="images\help (1).png"
            alt="Приклад редагування дошки"
            height="auto"
            max-height="300"
            class="my-4 responsive-image"
            contain
        />
      </v-col>
      <v-col cols="12" md="10" lg="8">
        <h2 class="text-h4 text-sm-h5 text-xs-h6 mb-3">Збереження та керування матеріалами</h2>
        <p class="text-body-1 mb-4">Зміни на дошці зберігаються автоматично, але також доступна ручна функція
          збереження. Ви можете експортувати проєкт як на пристрій, так і безпосередньо на Google Диск. Система дозволяє
          організовувати ваші матеріали у папках для зручності, впорядкування та швидкого доступу до потрібних
          ресурсів.</p>
        <v-img
            src="images\1.png"
            alt="Система організації матеріалів"
            height="auto"
            max-height="500"
            class="my-4 responsive-image"
            contain
        />
      </v-col>
      <v-col cols="12" md="10" lg="8">
        <h2 class="text-h4 text-sm-h5 text-xs-h6 mb-3">Керування інструментами</h2>
        <v-row>
          <v-col cols="12" md="6">
            <p class="text-body-1">Панель інструментів містить усі необхідні засоби для роботи на дошці:</p>
            <ul class="tool-list pl-4">
              <li class="mb-2">Мишка — інструмент навігації та вибору елементів;</li>
              <li class="mb-2">Пензлик — малювання від руки;</li>
              <li class="mb-2">Гумка — видалення об'єктів або малюнків;</li>
              <li class="mb-2">Текст — вставлення та редагування текстові блоки;</li>
              <li class="mb-2">Зображення — дає змогу завантажувати й вставляти зображення;</li>
              <li class="mb-2">Нотатка — додає примітки до дошки;</li>
              <li class="mb-2">Експорт на пристрій — збереження поточної дошки у файл;</li>
              <li class="mb-2">Імпорт з пристрою — відкриття збережених файлів з комп'ютера;</li>
              <li class="mb-2">Експорт на Google Диск — збереження проєкту у ваш акаунт Google;</li>
              <li class="mb-2">Імпорт з Google Диску — завантаження проєктів з Google Drive;</li>
              <li class="mb-2">Відміна дії (Undo) — скасування останньої дії;</li>
              <li class="mb-2">Повтор дії (Redo) — повернення скасованої дії.</li>
            </ul>
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center">
            <v-img
                src="images\help (3).png"
                alt="Панель інструментів"
                height="auto"
                max-height="400"
                class="responsive-image"
                contain
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="10" lg="8">
        <h2 class="text-h4 text-sm-h5 text-xs-h6 mb-3">Використання чату з AI</h2>
        <p class="text-body-1 mb-4">На дошці доступна кнопка виклику AI-чату. Натиснувши її, ви відкриєте чат, де можете
          ставити запитання або отримувати допомогу. Штучний інтелект також має можливість аналізувати вміст дошки та
          надавати корисні підказки відповідно до контексту.</p>
        <v-img
            src="images\2.png"
            alt="Система організації матеріалів"
            height="auto"
            max-height="500"
            class="my-4 responsive-image"
            contain
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.help-container {
  padding: 16px;
}

.responsive-image {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
}

h1, h2 {
  font-weight: 600;
  line-height: 1.3;
}

p {
  line-height: 1.6;
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
}

@media (max-width: 600px) {
  .help-container {
    padding: 12px 8px;
  }

  .my-4 {
    margin-top: 12px !important;
    margin-bottom: 12px !important;
  }

  .mb-4 {
    margin-bottom: 12px !important;
  }

  .mb-6 {
    margin-bottom: 16px !important;
  }

  .mb-3 {
    margin-bottom: 8px !important;
  }
}
</style>