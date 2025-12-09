/* * Velaro Labs - Main Script
 * Includes: UI Logic, GSAP Animations, Three.js Sphere, Form Validation
 */

// Регистрируем плагин ScrollTrigger, если GSAP загружен
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализация иконок (Lucide)
  if (window.lucide) {
      lucide.createIcons();
  }

  // 2. Запуск логики UI
  initMobileMenu();
  initHeaderScroll();
  initCookiePopup();
  initContactForm();

  // 3. Запуск анимаций
  // Используем window.load или setTimeout, чтобы убедиться, что верстка и картинки встали на места
  window.addEventListener('load', () => {
      initHeroAnimations();
      initScrollAnimations();
      initThreeJS(); // 3D Сфера

      // ВАЖНО: Обновляем расчеты скролла после полной загрузки
      if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  // Фолбэк на случай, если window.load уже прошел (для быстрой сети)
  setTimeout(() => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
  }, 1000);
});

/* ============================
 1. UI & INTERACTION (Menu, Header, Cookies)
 ============================ */

function initMobileMenu() {
  const burgerBtn = document.querySelector('.header__burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuContent = document.querySelector('.mobile-menu__content');
  const navList = document.querySelector('.nav__list');

  // Клонируем меню для мобильной версии
  if (navList && mobileMenuContent && !mobileMenuContent.querySelector('.nav__list')) {
      const clonedNav = navList.cloneNode(true);
      mobileMenuContent.appendChild(clonedNav);
  }

  // Открытие/Закрытие по кнопке
  if (burgerBtn && mobileMenu) {
      burgerBtn.addEventListener('click', () => {
          const isOpen = mobileMenu.classList.toggle('is-open');
          const icon = burgerBtn.querySelector('i');

          icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
          document.body.style.overflow = isOpen ? 'hidden' : '';

          if (window.lucide) lucide.createIcons();
      });

      // Закрытие при клике на ссылку
      mobileMenu.addEventListener('click', (e) => {
          if (e.target.closest('a')) {
              mobileMenu.classList.remove('is-open');
              burgerBtn.querySelector('i').setAttribute('data-lucide', 'menu');
              document.body.style.overflow = '';
              if (window.lucide) lucide.createIcons();
          }
      });
  }
}

function initHeaderScroll() {
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 50;
      if (scrolled) {
          header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
          header.style.background = "rgba(240, 244, 248, 0.95)";
      } else {
          header.style.boxShadow = "none";
          header.style.background = "rgba(240, 244, 248, 0.85)";
      }
  });
}

function initCookiePopup() {
  const popup = document.getElementById('cookiePopup');
  const btn = document.getElementById('acceptCookies');

  if (!localStorage.getItem('cookiesAccepted') && popup) {
      setTimeout(() => {
          popup.classList.add('is-visible');
      }, 2000);
  }

  if (btn) {
      btn.addEventListener('click', () => {
          localStorage.setItem('cookiesAccepted', 'true');
          popup.classList.remove('is-visible');
      });
  }
}

/* ============================
 2. CONTACT FORM & VALIDATION
 ============================ */

function initContactForm() {
  const form = document.getElementById('leadForm');
  const msgBox = document.getElementById('formMessage');

  // Логика Математической капчи
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const captchaLabel = document.getElementById('captcha-question');
  const captchaInput = document.getElementById('captcha-answer');

  if(captchaLabel) captchaLabel.textContent = `${num1} + ${num2}`;

  if (!form) return;

  form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Сброс ошибок
      msgBox.textContent = '';
      msgBox.className = 'form-message';
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      // 1. Валидация Телефона
      const phoneInput = form.phone;
      const phoneVal = phoneInput.value.replace(/[\s\-\+\(\)]/g, '');
      const phoneRegex = /^\d+$/;

      if (!phoneRegex.test(phoneVal) || phoneVal.length < 7) {
          showFormError(phoneInput, 'Введите корректный номер (только цифры)');
          return;
      }

      // 2. Валидация Капчи
      if (parseInt(captchaInput.value) !== (num1 + num2)) {
          showFormError(captchaInput, 'Неверный ответ на пример');
          return;
      }

      // 3. Валидация Чекбокса (ОБЯЗАТЕЛЬНАЯ)
      const policyCheckbox = document.getElementById('policy');
      if (!policyCheckbox.checked) {
          // Подсветка чекбокса и сообщение
          policyCheckbox.classList.add('error');
          showFormError(policyCheckbox, 'Подтвердите согласие с политикой');
          return;
      }

      // 4. Имитация отправки
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = 'Отправка...';
      btn.disabled = true;

      setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;

          // Успех
          msgBox.textContent = 'Заявка успешно отправлена! Ожидайте звонка.';
          msgBox.classList.add('success');
          form.reset();

          // Новый пример капчи
          const n1 = Math.floor(Math.random() * 5) + 1;
          const n2 = Math.floor(Math.random() * 5) + 1;
          if(captchaLabel) captchaLabel.textContent = `${n1} + ${n2}`;
      }, 1500);
  });

  // Очистка ошибок при взаимодействии
  form.querySelectorAll('input').forEach(input => {
      const clearError = () => {
          input.classList.remove('error');
          if(msgBox) msgBox.textContent = '';
      };
      input.addEventListener('input', clearError);
      input.addEventListener('change', clearError); // Для чекбокса
  });
}

function showFormError(input, message) {
  input.classList.add('error');
  if (input.type !== 'checkbox') input.focus();

  const msgBox = document.getElementById('formMessage');
  if(msgBox) {
      msgBox.textContent = message;
      msgBox.classList.add('error');
  }
}

/* ============================
 3. HERO ANIMATIONS
 ============================ */

function initHeroAnimations() {
  if (!window.gsap || !window.SplitType) return;

  const title = new SplitType('.hero__title', { types: 'words' });
  const tl = gsap.timeline();

  tl.from(title.words, {
      y: 50, opacity: 0, duration: 1, stagger: 0.05, ease: "power4.out"
  })
  .from('.hero__badge', { y: -20, opacity: 0, duration: 0.6, ease: "back.out(1.7)" }, "-=0.8")
  .from('.hero__desc', { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
  .from('.hero__actions', { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
  .from('.hero__stat', { opacity: 0, duration: 1 }, "-=0.6");
}

/* ============================
 4. SCROLL ANIMATIONS (FAQ Fix Included)
 ============================ */

function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  // Секция "О нас"
  gsap.from('.about__content', {
      scrollTrigger: { trigger: '.about', start: 'top 85%' },
      x: -50, opacity: 0, duration: 1, clearProps: "all"
  });
  gsap.from('.about__image-wrapper', {
      scrollTrigger: { trigger: '.about', start: 'top 85%' },
      x: 50, opacity: 0, duration: 1, delay: 0.2, clearProps: "all"
  });

  // Все карточки (Практики, Блог, Карьера, Отзывы, Инструменты)
  const cards = document.querySelectorAll('.card, .practice-card, .blog-card, .career-card, .review-card, .tool-item');
  cards.forEach((card) => {
      gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 90%' }, // Триггер чуть раньше
          y: 50,
          opacity: 0,
          duration: 0.6,
          delay: 0.1,
          clearProps: "all"
      });
  });

  // FAQ - Специальная обработка
  // Используем stagger для появления вопросов по очереди
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
      gsap.from(faqItems, {
          scrollTrigger: {
              trigger: '#faq', // Триггеримся на всю секцию
              start: 'top 85%', // Когда верх секции достигает 85% высоты экрана
              toggleActions: "play none none reverse"
          },
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          clearProps: "all"
      });
  }
}

/* ============================
 5. THREE.JS SPHERE
 ============================ */

function initThreeJS() {
  const container = document.getElementById('canvas-container');
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 2.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Частицы
  const particlesGeometry = new THREE.BufferGeometry();
  const count = 1200;
  const posArray = new Float32Array(count * 3);

  for(let i = 0; i < count * 3; i++) {
      const r = 1.8 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      posArray[i] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i+2] = r * Math.cos(phi);
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const material = new THREE.PointsMaterial({ size: 0.012, color: 0x2563EB, transparent: true, opacity: 0.8 });
  const particlesMesh = new THREE.Points(particlesGeometry, material);
  scene.add(particlesMesh);

  // Каркасная сфера
  const sphereGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0x0EA5E9, wireframe: true, transparent: true, opacity: 0.1 });
  const wireframeSphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(wireframeSphere);

  // Мышь
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
  });

  const clock = new THREE.Clock();
  const tick = () => {
      const elapsed = clock.getElapsedTime();
      particlesMesh.rotation.y = elapsed * 0.1 + (mouseX - particlesMesh.rotation.y) * 0.05;
      particlesMesh.rotation.x = (mouseY - particlesMesh.rotation.x) * 0.05;
      wireframeSphere.rotation.y = elapsed * 0.1;
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
  });
}