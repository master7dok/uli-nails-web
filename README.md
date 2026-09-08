# Uliana Nails — Premium Landing Page & Admin CMS MVP

Ekskluzywna platforma internetowa (Landing Page + Panel Administracyjny) dla mistrzyni stylizacji paznokci i instruktorki **Uliany** (@uli.nails.krk / @uli.nail.krk) w Krakowie.

---

## 🌟 Główne Funkcje / Основні можливості

- **Premium UI/UX**: Estetyka dopasowana do profilu na Instagramie (odcienie nude `#F5F2EB`, pastelowy róż `#F9EBEA`, eleganckie fonty *Playfair Display* i *Montserrat*).
- **Dwujęzyczność (i18n)**: Dynamiczne przełączanie języków **UA (Українська)** oraz **PL (Polski)** z zapamiętywaniem wyboru użytkownika.
- **Formularz zgłoszeniowy na kursy stacjonarne**: Przycisk „Aplikuj na kurs” / „Подати заявку на курс” otwiera dedykowany modal z osadzonym arkuszem Google Form z informacją o indywidualnej adaptacji programu.
- **Interaktywny Cennik Instagram Style**: Zakładki usług, czasy trwania, oznaczenia „Bestseller” oraz bezpośrednie linki do rezerwacji na Telegram (@uliana_p_u) i Instagram.
- **Galeria Portfolio**: Filtrowanie prac (Architektura żelu, Czysty manicure, French, Trudne płytki/trapez) z powiększeniem (lightbox).
- **Opinie Uczennic i Salonów**: Recenzje z wynikami (skrócenie czasu pracy, brak zapowietrzeń).
- **Panel Administratora (`/admin`)**:
  - Zarządzanie Cennikiem (dodawanie, edycja cen, opisów PL/UA, usuwanie).
  - Zarządzanie Kursami (edycja programów, cen, modułów).
  - Zarządzanie Galerią (upload zdjęć z dysku lub dodawanie linków).
  - Zarządzanie Linkami i Ustawieniami (Google Form, Instagram, Telegram).

---

## 🚀 Uruchomienie projektu / Як запустити

### Wymagania:
- Node.js 18+ (zainstalowano LTS v24)
- npm

### 1. Instalacja zależności (jeśli potrzebna):
```bash
npm install
```

### 2. Baza Danych (Prisma + SQLite):
```bash
# Wygenerowanie klienta i synchronizacja bazy dev.db
npx prisma db push

# Wypełnienie bazy początkowymi danymi (cennik, kursy, opinie)
node prisma/seed.mjs
```

### 3. Uruchomienie serwera deweloperskiego:
```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem: [http://localhost:3000](http://localhost:3000)

### 4. Build produkcyjny:
```bash
npm run build
npm start
```

---

## 🔐 Dostęp do Panelu Administratora

- **Adres URL:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Domyślne hasło dostępu:** `uliana_admin_secret`
*(Hasło można zmienić w pliku `.env` pod zmienną `ADMIN_PASSWORD`)*

---

## 🏗️ Architektura z myślą o skalowaniu (Future Ready)

Struktura projektu została zaprojektowana modularnie pod kątem przyszłych modułów:
1. **System Rezerwacji (Booking Engine):**
   - Modele w `prisma/schema.prisma` można łatwo rozszerzyć o tabele `Appointment`, `Slot` i `Client`.
2. **Płatności online (Przelewy24 / Blik / Stripe):**
   - W folderze `src/app/api/payments/` można dodać webhooki operatorów płatności dla zaliczek na kursy lub usługi.
3. **Platforma E-learningowa (Kursy Online & Wideo):**
   - Gotowe wsparcie dla autoryzacji sesyjnej w `src/lib/auth.ts`, integracji z AWS S3 / Cloudinary oraz zabezpieczonych materiałów PDF / wideo.
