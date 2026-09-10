# 📖 База Знань та Архітектурний Довідник: Uliana Nails

Цей документ створено як повну інструкцію для розробника або власника проєкту. Якщо ви повернетеся до цього репозиторію через рік або більше, тут ви знайдете відповіді на всі запитання: що на чому тримається, де лежать головні файли, як розгортати проєкт та де вносити правки.

---

## 📑 Зміст
1. [Стек технологій](#1-стек-технологій)
2. [Структура папок та ключові файли](#2-структура-папок-та-ключові-файли)
3. [База даних та Prisma ORM](#3-база-даних-та-prisma-orm)
4. [Авторизація в Адмін-панелі](#4-авторизація-в-адмін-панелі)
5. [Завантаження фото та сховище (Uploads)](#5-завантаження-фото-та-сховище-uploads)
6. [Двомовність (UA / PL) та CMS текстів](#6-двомовність-ua--pl-та-cms-текстів)
7. [Маршрутизація Instagram (UA vs PL)](#7-маршрутизація-instagram-ua-vs-pl)
8. [Брендинг, Favicon та Дизайн-система](#8-брендинг-favicon-та-дизайн-система)
9. [Розгортання (Coolify / Docker / VPS)](#9-розгортання-coolify--docker--vps)
10. [Шпаргалка команд для термінала](#10-шпаргалка-команд-для-термінала)
11. [Troubleshooting: Що робити, якщо...](#11-troubleshooting-що-робити-якщо)

---

## 1. Стек технологій

| Сфера | Технологія | Версія / Примітки |
|---|---|---|
| **Фреймворк** | [Next.js](https://nextjs.org/) | **15.2.1** (App Router, Server Components + Client Components) |
| **Бібліотека UI** | [React](https://react.dev/) | **19.0.0** |
| **Мова** | [TypeScript](https://www.typescriptlang.org/) | **5.7.3** (сувора типізація) |
| **Стилізація** | [Tailwind CSS](https://tailwindcss.com/) | **3.4.17** + PostCSS |
| **Анімації** | [Framer Motion](https://www.framer.com/motion/) | **12.4.7** (плавний скрол, pill tabs, мікроанімації) |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | **6.4.1** (типізований клієнт до БД) |
| **База даних** | [PostgreSQL](https://www.postgresql.org/) | Підтримується версія 14, 15, 16 (production) |
| **Обробка зображень** | [Sharp](https://sharp.pixelplumbing.com/) | Серверна генерація та оптимізація іконок/фото |
| **Іконки** | [Lucide React](https://lucide.dev/) | Набір сучасних SVG-іконок |

---

## 2. Структура папок та ключові файли

```text
LandingPageUliNail/
├── prisma/
│   ├── schema.prisma          # Схема моделей PostgreSQL (Service, Course, PortfolioItem, Testimonial, Setting)
│   ├── seed.mjs               # Початкові дані (базові курси, прайс, відгуки, портфоліо)
│   └── auto-init.mjs          # Автоматичний запуск міграцій та seeding під час старту контейнера
├── public/                    # Статичні файли (favicon.ico, icon.svg, apple-touch-icon.png, uploads)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Корневий лейаут: шрифти, HTML-метатеги, підключення іконок
│   │   ├── page.tsx           # Головна сторінка сайту (серверний рендеринг з БД або fallback)
│   │   ├── admin/
│   │   │   └── page.tsx       # Панель адміністратора (/admin)
│   │   ├── api/               # Серверні REST API роути
│   │   │   ├── auth/          # /api/auth/login, /api/auth/check, /api/auth/logout
│   │   │   ├── courses/       # CRUD для курсів (/api/courses, /api/courses/[id], /api/courses/seed)
│   │   │   ├── services/      # CRUD для прайс-листа + зміна порядку (/api/services/reorder)
│   │   │   ├── portfolio/     # Додавання / видалення фото
│   │   │   ├── testimonials/  # Відгуки
│   │   │   ├── settings/      # Налаштування контактів, фото та всіх текстів сайту
│   │   │   └── upload/        # Завантаження файлів з комп'ютера чи телефона
│   │   └── uploads/[filename]/ # Роут безпечної роздачі завантажених фото з кешуванням
│   ├── components/            # React-компоненти інтерфейсу
│   │   ├── Header.tsx         # Шапка сайту (логотип, мовний перемикач UA/PL, соцмережі)
│   │   ├── Hero.tsx           # Перший екран (4-рядковий заголовок, лічильники досвіду, головне фото)
│   │   ├── About.tsx          # Блок про майстра (тексти, 4 переваги, 4 плашки статистики)
│   │   ├── Courses.tsx        # Відображення карток курсів, акція з подругою, кнопка запису
│   │   ├── CourseModal.tsx    # Модальне вікно запису з Google Form
│   │   ├── PriceList.tsx      # Інтерактивний прайс (вкладки Манікюр/Педикюр/Додатково, ціни)
│   │   ├── Portfolio.tsx      # Галерея робіт з фільтрами та lightbox
│   │   ├── Testimonials.tsx   # Секція з відгуками учнів та клієнтів
│   │   ├── Footer.tsx         # Підвал (контакти, соцмережі, лінк на вхід в адмінку)
│   │   └── admin/             # Компоненти панелі керування
│   │       ├── AdminLogin.tsx      # Форма входу
│   │       ├── PricesTab.tsx       # Керування прайсом (кнопки вгору/вниз, редагування, додавання)
│   │       ├── CoursesTab.tsx      # Повне керування курсами (додавання з нуля, силлабус, ціни)
│   │       ├── PortfolioTab.tsx    # Завантаження та сортування фото
│   │       ├── TestimonialsTab.tsx # Додавання та редагування відгуків
│   │       ├── SettingsTab.tsx     # Налаштування фото сайту, Instagram, Telegram, Google Form
│   │       └── SiteTextsTab.tsx    # Редагування всіх статичних текстів сайту для UA та PL
│   ├── context/
│   │   └── LanguageContext.tsx# Контекст поточної мови (UA / PL), локальне збереження вибору в localStorage
│   └── lib/                   # Службові бібліотеки та утиліти
│       ├── prisma.ts          # Singleton-екземпляр PrismaClient
│       ├── auth.ts            # Валідація токенів адміна (Bearer токен, cookie, паролі)
│       ├── adminClient.ts     # Клієнтські хелпери для надсилання авторизованих запитів
│       ├── defaultData.ts     # Повні стандартні дані сайту (використовуються як резервний fallback)
│       ├── translations.ts    # Тексти інтерфейсу за замовчуванням
│       └── settingsHelper.ts  # Хелпери getSettingText() та getInstagramLink()
```

---

## 3. База даних та Prisma ORM

### Схема бази (`prisma/schema.prisma`)
У базі PostgreSQL визначено 5 моделей:
1. `Service` — послуги салону (поля: `titlePl`, `titleUa`, `descriptionPl`, `descriptionUa`, `pricePln`, `durationMin`, `category`, `sortOrder`, `isPopular`).
   - Категорії послуг: `manicure` (Манікюр), `pedicure` (Педикюр), `additional` (Додатково).
2. `Course` — навчальні курси (поля: `slug`, `titlePl`, `titleUa`, `descriptionPl`, `descriptionUa`, `pricePln`, `featuresPl`, `featuresUa`, `syllabusPl`, `syllabusUa`, `formUrl`, `sortOrder`, `isActive`).
3. `PortfolioItem` — фотографії робіт (`imageUrl`, `category`, `featured`, `sortOrder`).
4. `Testimonial` — відгуки клієнтів та учнів (`name`, `rolePl`, `roleUa`, `textPl`, `textUa`, `rating`, `avatarUrl`, `sortOrder`).
5. `Setting` — ключові налаштування у форматі key-value (`key` [String @id], `value` [String]).
   - Тут зберігаються посилання на фото сайту, Google Форма, акаунти Instagram, Telegram та всі тексти з розділу «Редагування тексту» (`text_hero_titleLine1_ua`, тощо).

### Як працює самоініціалізація (`prisma/auto-init.mjs`)
Коли запускається production сервер (`npm start`):
1. Скрипт перевіряє змінну `DATABASE_URL`.
2. Якщо виявлено PostgreSQL, він автоматично запускає `npx prisma db push --skip-generate`, створюючи всі необхідні таблиці без потреби ручних міграцій.
3. Якщо база абсолютно порожня (`Course.count() === 0`), скрипт запускає `prisma/seed.mjs`, заповнюючи сайт реальними початковими курсами, послугами, відгуками та фото.
4. Якщо в базі вже є дані, вони **ніколи не перезаписуються**, дані зберігаються повністю.

### Відмовостійкість (Fallback)
Якщо база даних тимчасово недоступна (наприклад, під час рестарту сервера PostgreSQL), файл `src/app/page.tsx` ловить помилку і автоматично завантажує стандартні дані з `src/lib/defaultData.ts`. Сайт ніколи не покаже білий екран чи 500 помилку.

---

## 4. Авторизація та безпека в Адмін-панелі

### Яка змінна відповідає за пароль?
- **`ADMIN_PASSWORD`** (встановлюється виключно в `.env` на сервері або у змінних середовища Coolify).
- Пароль ніколи не хардкодиться в коді і не передається на клієнт.

### Як влаштовано безпечний механізм перевірки (`src/lib/auth.ts`):
- **Захист від лапок**: пароль може бути в лапках або без (`ADMIN_PASSWORD="ваш_пароль"` або без лапок). Код автоматично видаляє зайві лапки та пробіли.
- **Timing-Safe Comparison**: перевірка пароля здійснюється через `crypto.timingSafeEqual` над SHA-256 хешами, що унеможливлює атаки за часом (timing attacks).
- **Криптографічний Session Token (HMAC-SHA256)**: замість небезпечного Base64 відкритого пароля, система генерує випадковий сесійний токен з підписом HMAC (`<payload>.<signature>`), що містить 32-байтовий випадковий nonce та час дії (TTL 7 днів). Сам пароль у токені **відсутній**, тому його неможливо витягнути з cookies або DevTools.
- **CSRF-захист**: усі мутуючі запити (`POST`, `PUT`, `DELETE`, `PATCH`) перевіряють заголовки `Origin` / `Referer`, блокуючи міжсайтові підробки запитів.
- При успішному вході сесійний токен записується:
  1. У безпечну cookie браузера `uli_admin_token` (HTTP-only, SameSite=Lax, Secure у HTTPS).
  2. У локальний заголовок `Authorization: Bearer <token>`.
  3. У кастомний заголовок `x-admin-token`.

---

## 5. Завантаження фото та сховище (Uploads)

### Куди зберігаються завантажені фото?
- **Локально**: у папку `public/uploads/`.
- **На сервері / Coolify**: якщо задано змінну `UPLOAD_DIR` (наприклад, `/app/uploads`), фото записуються в цю папку.

> [!IMPORTANT]
> **Для Coolify / Docker:**
> Щоб завантажені фотографії не зникали при передеплої контейнера, у Coolify у вкладці **Storages / Persistent Data** має бути підмонтований том:
> - Наприклад: `Host Path: /data/uliana-uploads` -> `Container Path: /app/uploads`.
> - І в Environment Variables вказано: `UPLOAD_DIR=/app/uploads`.

### Роздача файлів (`src/app/uploads/[filename]/route.ts`)
Завантажені зображення автоматично роздаються через цей роут:
- Захист від Path Traversal (`path.basename`).
- Додаються оптимізовані заголовки кешування: `Cache-Control: public, max-age=31536000, immutable`.
- Фото вантажаться миттєво з браузерного кешу.

---

## 6. Двомовність (UA / PL) та CMS текстів

1. **Перемикання мови**:
   - `LanguageContext.tsx` керує станом (`ua` або `pl`).
   - Вибір користувача зберігається у `localStorage`.
2. **Динамічний текст**:
   - Більшість сутностей у базі мають пари колонок: `titleUa` та `titlePl`, `descriptionUa` та `descriptionPl`.
3. **Редагування статичного контенту (Вкладка «Редагування тексту»)**:
   - Всі заголовки, описи, переваги та плашки статистики зберігаються у таблиці `Setting` з префіксами мови:
     - `text_hero_titleLine1_ua` / `text_hero_titleLine1_pl`
     - `text_about_title_ua` / `text_about_title_pl`
     - `text_courses_promo_title_ua` / `text_courses_promo_title_pl`
     - тощо.
   - Хелпер `getSettingText(settings, key, lang, fallback)` у [src/lib/settingsHelper.ts](file:///f:/LandingPageUliNail/src/lib/settingsHelper.ts):
     - Якщо в адмінці текст змінено — береться з бази.
     - Якщо поле залишене пустим — підставляється красивий дефолтний текст із перекладів. Текст ніколи не зникає!

---

## 7. Маршрутизація Instagram (UA vs PL)

Клієнтка веде два окремі акаунти для різних аудиторій:
- 🇺🇦 **Український акаунт**: [`@uli.nail.krk`](https://instagram.com/uli.nail.krk) (через крапку в однині `nail`).
- 🇵🇱 **Польський акаунт**: [`@uli.nails.krk`](https://instagram.com/uli.nails.krk) (у множині `nails`).

### Як це реалізовано:
- У [src/lib/settingsHelper.ts](file:///f:/LandingPageUliNail/src/lib/settingsHelper.ts) створено функцію `getInstagramLink(language, settings)`.
- Коли користувач на сторінці з **UA**:
  - Іконка в шапці (Header)
  - Посилання в мобільному меню
  - Іконка соцмереж у підвалі (Footer)
  - Рядок у блоці контактів у підвалі
  - Кнопка «Записатися в Instagram» у Прайс-листі
  👉 **Всі автоматично ведуть на `https://instagram.com/uli.nail.krk`**.
- Коли користувач перемикає сайт на **PL**:
  👉 **Всі посилання автоматично перемикаються на `https://instagram.com/uli.nails.krk`**.
- В адмін-панелі на вкладці «Налаштування сайту» ці акаунти можна за потреби змінити.

---

## 8. Брендинг, Favicon та Дизайн-система

### Кольорова гама:
- Фон сторінки: `#FAF8F5` (теплий шовковистий нюд).
- Світлі акценти / плашки: `#F5F2EB`, `#EFE9DF`.
- Текст та контрастні кнопки: `#1F1C1B`, `#2A2523` (глибокий теплий еспресо).
- Золото та блік: `#D4AF37`, `#CAA158`, `#E8C88A` (шампань / золото).
- Рожевий рум'янець (акценти): `#F9EBEA`, `#F0D5D3`.

### Шрифти:
- Заголовки (елегантний витончений серіф): **Playfair Display**.
- Основний текст та інтерфейс: **Montserrat**.

### Favicon:
- Створено авторський дизайн: круглий темний медальйон кольору еспресо з тонкою золотою каймою, мигдалеподібним силуетом гелевого нігтя, золотою літерою **«U»** та сяючим діамантовим бліком.
- Файли знаходяться у `public/` та `src/app/`:
  - `icon.svg` — для сучасних моніторів Retina / 4K.
  - `favicon.ico` — багатошаровий ICO (16x16, 32x32, 48x48) для браузерів.
  - `apple-touch-icon.png` (180x180) — для іконки на iPhone / iPad.

---

## 9. Розгортання (Coolify / Docker / VPS)

### Необхідні змінні середовища (Environment Variables):

```env
# 1. Рядок підключення до PostgreSQL
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@ім_я_сервісу_бд:5432/uliana_nails"

# 2. Пароль для входу в панель /admin
ADMIN_PASSWORD="ваш_надійний_пароль"

# 3. Шлях до постійного диску для збереження фото
UPLOAD_DIR="/app/uploads"

# 4. Node environment
NODE_ENV="production"
PORT=3000
```

### Dockerfile (якщо збирається через Docker):
Проєкт використовує стандартний багатоетапний білд Next.js:
1. `prisma generate`
2. `next build`
3. Запуск команди `npm start`, яка автоматично виконує `node prisma/auto-init.mjs && next start`.

---

## 10. Шпаргалка команд для термінала

### Локальний запуск для розробки:
```bash
# Встановити залежності
npm install

# Синхронізувати схему бази даних (PostgreSQL або локальна)
npx prisma db push

# Запустити веб-сервер у режимі розробки (гаряче перезавантаження)
npm run dev
```
Доступ: `http://localhost:3000` та `http://localhost:3000/admin`.

### Білд та перевірка продакшену:
```bash
# Повний продакшен білд (валідація типів TypeScript + генерація сторінок)
npm run build

# Запуск продакшен сервера
npm start
```

### Корисні команди Prisma:
```bash
# Відкрити графічний веб-інтерфейс для перегляду та редагування рядків у базі
npx prisma studio

# Примусово згенерувати типізований клієнт Prisma
npx prisma generate

# Запустити початковий посів даних вручну
node prisma/seed.mjs
```

---

## 11. Troubleshooting: Що робити, якщо...

### 1. «Забув пароль від панелі адміністратора»
- Перевірте файл `.env` (або панель Coolify -> Environment Variables) -> змінна `ADMIN_PASSWORD`.
- Змініть значення `ADMIN_PASSWORD` на нове та перезапустіть контейнер.

### 2. «Після перезапуску або оновлення сайту в Coolify зникли завантажені фото»
- Причина: не налаштовано постійне сховище (Persistent Volume) для папки завантажень.
- Рішення: у Coolify додайте Volume: `/data/uploads:/app/uploads` та пропишіть змінну `UPLOAD_DIR=/app/uploads`.

### 3. «Помилка при білді: EPERM: operation not permitted, rename query_engine-windows.dll.node»
- Причина: у Windows процес `npm start` або `node` тримає файл клієнта Prisma заблокованим.
- Рішення: зупиніть запущений сервер перед виконанням `npm run build`, після чого запустіть знову.

### 4. «Не відкривається Google Form або треба змінити посилання на анкету»
- Зайдіть у `/admin` -> вкладка **«Налаштування сайту»** -> поле **«Посилання на Google Form (Анкета для курсів)»** і вставте нове посилання.

### 5. «Треба додати нову послугу або категорію в Прайс»
- Зайдіть у `/admin` -> вкладка **«Прайс-лист»** -> кнопка **«+ Додати нову послугу»**.
- Щоб змінити порядок відображення, натискайте стрілочки `↑ Вгору` та `↓ Вниз`. Порядок зберігається автоматично.

---
*Документ актуалізовано для проєкту Uliana Nails.*
