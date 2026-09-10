import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with updated course data...");

  // Clean existing
  await prisma.service.deleteMany();
  await prisma.course.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.setting.deleteMany();

  // 1. Services
  const services = [
    {
      category: "manicure",
      titlePl: "Manicure hybrydowy",
      titleUa: "Манікюр гібридний (гель-лак)",
      descriptionPl: "Opracowanie skórek, wyrównanie płytki bazą mineralną/kauczukową, idealne malowanie pod skórki.",
      descriptionUa: "Чисте комбі-опрацювання кутикули, вирівнювання базою, бездоганне покриття під кутикулу.",
      pricePln: 140,
      durationMin: 90,
      isPopular: true,
      sortOrder: 1,
    },
    {
      category: "manicure",
      titlePl: "Paznokcie żelowe (uzupełnienie / utwardzenie)",
      titleUa: "Гелеві нігті (укріплення / корекція)",
      descriptionPl: "Wzmocnienie naturalnej płytki twardym żelem, architektoniczna budowa apeksu, odporność na złamania.",
      descriptionUa: "Укріплення натуральних нігтів твердим гелем, правильна архітектура апекса, стійкість без сколів.",
      pricePln: 170,
      durationMin: 105,
      isPopular: true,
      sortOrder: 2,
    },
    {
      category: "manicure",
      titlePl: "Zdjęcie hybrydy + manicure higieniczny",
      titleUa: "Зняття покриття + гігієнічний манікюр",
      descriptionPl: "Bezpieczne usunięcie starej stylizacji frezem, pielęgnacja skórek, odżywka i olejek regeneracyjny.",
      descriptionUa: "Безпечне зняття фрезою, чисте оброблення кутикули, полірування та доглядова сироватка.",
      pricePln: 120,
      durationMin: 60,
      isPopular: false,
      sortOrder: 3,
    },
    {
      category: "pedicure",
      titlePl: "Pedicure estetyczny hybrydowy (bez podologii)",
      titleUa: "Естетичний гібридний педикюр (без подології)",
      descriptionPl: "Czyste i bezpieczne opracowanie skórek, ultracienkie elastyczne malowanie kolorem pod skórki.",
      descriptionUa: "Безпечне оброблення кутикули та пальчиків, ультратонке еластичне покриття під кутикулу.",
      pricePln: 160,
      durationMin: 75,
      isPopular: true,
      sortOrder: 4,
    },
    {
      category: "pedicure",
      titlePl: "Pedicure pełny SPA + Pododysk (opracowanie stóp)",
      titleUa: "Повний SPA-педикюр з пододиском (обробка стоп)",
      descriptionPl: "Aparatowe wygładzenie stóp pododyskiem, peeling, odżywczy krem oraz idealna stylizacja paznokci.",
      descriptionUa: "Апаратне шліфування стоп пододиском, пілінг, зволожувальний догляд та бездоганний колір.",
      pricePln: 190,
      durationMin: 90,
      isPopular: false,
      sortOrder: 5,
    },
    {
      category: "manicure",
      titlePl: "Przedłużanie paznokci (długość 1-2)",
      titleUa: "Нарощування нігтів (довжина 1-2)",
      descriptionPl: "Przedłużanie na szablonach / górnych formach, idealny kształt migdał lub kwadrat, manicure w cenie.",
      descriptionUa: "Моделювання на нижніх/верхніх формах, чіткий квадрат або витончений мигдаль, манікюр включено.",
      pricePln: 200,
      durationMin: 135,
      isPopular: true,
      sortOrder: 6,
    },
    {
      category: "manicure",
      titlePl: "Przedłużanie paznokci (długość 3-4)",
      titleUa: "Нарощування нігтів (довжина 3-4)",
      descriptionPl: "Długie, eleganckie stylizacje żelowe z zachowaniem idealnej geometrii i lekkości noszenia.",
      descriptionUa: "Довге естетичне моделювання з правильною геометрією та міцністю стресової зони.",
      pricePln: 230,
      durationMin: 150,
      isPopular: false,
      sortOrder: 7,
    },
    {
      category: "manicure",
      titlePl: "Korekta paznokci żelowych",
      titleUa: "Корекція гелевих нігтів",
      descriptionPl: "Odnowa architektury, podniesienie opadających końców, zmiana koloru lub wzoru.",
      descriptionUa: "Відновлення архітектури, підняття клюючих нігтів, оновлення кольору.",
      pricePln: 160,
      durationMin: 105,
      isPopular: false,
      sortOrder: 8,
    },
    {
      category: "additional",
      titlePl: "Męski manicure higieniczny",
      titleUa: "Чоловічий гігієнічний манікюр",
      descriptionPl: "Estetyczne opracowanie wałów okołopaznokciowych, matowe polerowanie i pielęgnacja dłoni.",
      descriptionUa: "Акуратна обробка пальців, матове шліфування пластини та зволоження.",
      pricePln: 100,
      durationMin: 45,
      isPopular: false,
      sortOrder: 9,
    },
    {
      category: "additional",
      titlePl: "Zdobienia (French / Babyboomer / Ombre)",
      titleUa: "Дизайн (Френч / Бебібумер / Омбре)",
      descriptionPl: "Precyzyjny french konstrukcyjny lub malowany, płynne przejścia tonalne na wszystkich paznokciach.",
      descriptionUa: "Тонка ультра-чиста лінія посмішки або м'який плавний градієнт на всіх нігтях.",
      pricePln: 30,
      durationMin: 20,
      isPopular: false,
      sortOrder: 10,
    },
    {
      category: "additional",
      titlePl: "Naprawa / rekonstrukcja 1 paznokcia",
      titleUa: "Ремонт / донарощування 1 нігтя",
      descriptionPl: "Uzupełnienie pęknięcia, odbudowa brakującego kąta żelem lub acrygelem.",
      descriptionUa: "Ремонт тріщини, добудова кута без зміни загального запису.",
      pricePln: 20,
      durationMin: 15,
      isPopular: false,
      sortOrder: 11,
    },
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  // 2. Updated 5 Offline Courses
  const courses = [
    {
      slug: "advanced-vip-intensyw",
      titlePl: "Advanced VIP-Intensyw (3 dni)",
      titleUa: "Advanced VIP-Інтенсив (3 дні)",
      subtitlePl: "Maksymalna wiedza i techniki premium dla doświadczonych stylistek",
      subtitleUa: "Концентрована практика та преміальні техніки для діючих майстрів",
      descriptionPl: "Ekskluzywne 3-dniowe szkolenie dla doświadczonych stylistek pragnących podnieść swoje umiejętności do poziomu VIP: korekta trudnych paznokci, estetyczny pedicure oraz perfekcyjna praca na górnych formach.",
      descriptionUa: "Ексклюзивне 3-денне навчання для досвідчених майстрів: корекція складних форм без пилу, естетичний тонкий педикюр без подології та моделювання на верхніх формах.",
      durationPl: "3 dni (24h)",
      durationUa: "3 дні (24 год)",
      levelPl: "Dla doświadczonych mistrzyń",
      levelUa: "Для досвідчених майстрів",
      pricePln: 2500,
      badgePl: "VIP Master",
      badgeUa: "VIP-Інтенсив",
      bonusPl: null,
      bonusUa: null,
      featuresPl: JSON.stringify([
        "Korekta formy owalno-migdałowej",
        "Pedicure estetyczny bez podologii",
        "Górne formy: stop-kropla, włókno szklane i architektura",
        "Łącznie 4 modelki na praktykę z instruktorką",
      ]),
      featuresUa: JSON.stringify([
        "Корекція овально-мигдальної форми",
        "Естетичний педикюр без подології",
        "Верхні форми: стоп-капля, скловолокно, архітектура",
        "Загалом 4 моделі для практичного закріплення",
      ]),
      syllabusPl: JSON.stringify([
        {
          day: "Dzień 1",
          title: "Korekta owalno-migdałowej formy",
          theory: "Przyczyny powstawania zapowietrzeń, czysty manicure bez zacięć, prawidłowe przygotowanie płytki, fizyka i chemia żeli oraz baz, ergonomiczne techniki pracy.",
          practice: "1 modelka (pełna korekta architektury, malowanie kolorem idealnie pod skórki).",
        },
        {
          day: "Dzień 2",
          title: "Pedicure estetyczny bez podologii",
          theory: "Idealnie cienkie, elastyczne pokrycie, czyste i bezpieczne opracowanie zatok bez ryzyka onycholizy.",
          practice: "2 modelki (1 modelka: kolor pod skórki, 2 modelka: baza kamuflująca).",
        },
        {
          day: "Dzień 3",
          title: "Górne formy (Dual Forms)",
          theory: "Niuanse dopasowania form do różnych typów płytek, technika stop-kropla, wzmocnienie włóknem szklanym, budowa idealnych linii bocznych.",
          practice: "1 modelka (modelowanie zestawu paznokci na górnych formach).",
        },
      ]),
      syllabusUa: JSON.stringify([
        {
          day: "День 1",
          title: "Корекція овально-мигдальної форми",
          theory: "Причини відшарувань біля кутикули та торців, чистий комбі-манікюр, правильна підготовка нігтя, хімія та фізика гелів і баз, прийоми швидкої роботи.",
          practice: "1 модель (корекція, відновлення паралелей, колір під кутикулу).",
        },
        {
          day: "День 2",
          title: "Педикюр без подології",
          theory: "Ідеально тонке безпечне покриття без тиску на ніготь, чисті синуси без поранень.",
          practice: "2 моделі (1 модель: колір під кутикулу, 2 модель: камуфлююча база).",
        },
        {
          day: "День 3",
          title: "Верхні форми (Dual Forms)",
          theory: "Тонкощі адаптації форм під різні типи нігтів, техніка стоп-капля, робота зі скловолокном, створення додаткових паралелей.",
          practice: "1 модель (повне моделювання на верхніх формах під контролем Уляни).",
        },
      ]),
      sortOrder: 1,
      isActive: true,
    },
    {
      slug: "kurs-podwyzszenia-kwalifikacji-2-dni",
      titlePl: "Kurs Podwyższenia Kwalifikacji (2 dni)",
      titleUa: "Курс підвищення кваліфікації (2 дні)",
      subtitlePl: "Eliminacja zapowietrzeń, żel bez piłowania i pozyskiwanie klientek na Instagramie",
      subtitleUa: "Ліквідація відшарувань, гель без опілу та залучення клієнтів через Instagram",
      descriptionPl: "Intensywny 2-dniowy kurs dla pracujących stylistek, które pragną doprowadzić swoją technikę do perfekcji: wyeliminować odpryski, przyspieszyć opiłowanie i zbudować skuteczny profil na Instagramie.",
      descriptionUa: "Потужний 2-денний практикум для працюючих майстрів, які хочуть позбутися відшарувань, довести чистоту зрізу до ідеалу та навчитися приваблювати платоспроможних клієнтів з Instagram.",
      durationPl: "2 dni (16h)",
      durationUa: "2 дні (16 год)",
      levelPl: "Dla stylistek z doświadczeniem",
      levelUa: "Для майстрів з досвідом",
      pricePln: 1800,
      badgePl: "Level Up",
      badgeUa: "Підвищення кваліфікації",
      bonusPl: null,
      bonusUa: null,
      featuresPl: JSON.stringify([
        "Precyzyjny rozbiór stref zapowietrzeń",
        "Bezpieczne usuwanie masy bez przegrzewania",
        "Opiłowanie idealnego owalu i kwadratu z wycięciem od spodu",
        "Praktyka na 3 modelkach + audyt Instagrama",
      ]),
      featuresUa: JSON.stringify([
        "Детальний розбір зон відшарувань",
        "Безпечне зняття матеріалу без пропилів та печіння",
        "Чіткий квадрат та плавний овал з випилюванням зсередини",
        "Практика на 3 моделях + упаковка Instagram",
      ]),
      syllabusPl: JSON.stringify([
        {
          day: "Dzień 1",
          title: "Przygotowanie i nieskazitelnie czysty manicure",
          theory: "Szczegółowa analiza stref zapowietrzeń, bezpieczne zdejmowanie starej stylizacji bez ryzyka przepiłowania, czysty manicure kombinowany/frezarkowy, najczęstsze błędy podczas przygotowania płytki.",
          practice: "1 modelka (czysty manicure, bezpieczna preparacja, aplikacja bazy).",
        },
        {
          day: "Dzień 2",
          title: "Żel, perfekcyjne kształty i Instagram dla stylistki",
          theory: "Właściwy dobór bazy z uwzględnieniem kwasowości (pH), właściwości twardych żeli, technika piłowania kształtu owalnego i ostrego/miękkiego kwadratu. Biznesowy blok Instagrama: chwytliwe bio, relacje wyróżnione, lejek przyciągania stałych klientek.",
          practice: "2 modelki (owal oraz kwadrat, precyzyjne wyfrezowanie naturalnego paznokcia od spodu).",
        },
      ]),
      syllabusUa: JSON.stringify([
        {
          day: "День 1",
          title: "Підготовка та чистий манікюр",
          theory: "Глибокий розбір зон відшарувань, техніка безпечного зняття без пропилів, чистий манікюр в 1 зріз, критичні помилки при підготовці нігтьової пластини.",
          practice: "1 модель (зняття, комбі-манікюр, правильна підготовка та покриття).",
        },
        {
          day: "День 2",
          title: "Гель, Форми та Instagram майстра",
          theory: "Підбір баз за рівнем кислотності, фізичні властивості твердих гелів, правила опилу форм (овал та чіткий квадрат). Маркетинг для майстра: упаковка шапки профілю, закріплені сторіз, проста воронка залучення клієнтів.",
          practice: "2 моделі (овал та квадрат, тонкий торець, випил натурального нігтя зсередини).",
        },
      ]),
      sortOrder: 2,
      isActive: true,
    },
    {
      slug: "szybkie-przedluzanie-gorne-formy",
      titlePl: "Szybkie Przedłużanie na Górne Formy (Dual Forms)",
      titleUa: "Швидкісне нарощення на верхні форми",
      subtitlePl: "Technika 'Ready to wear' w czasie poniżej 2 godzin",
      subtitleUa: "Техніка 'Ready to wear' до 2 годин без зайвого опилу",
      descriptionPl: "Jednodniowy ekspresowy warsztat z nowoczesnego przedłużania na formach górnych (Dual Forms). Nauczysz się wykonywać trwałą, smukłą stylizację salonową w rekordowo krótkim czasie.",
      descriptionUa: "Інтенсивний одноденний курс для освоєння найпопулярнішої сучасної техніки моделювання. Ідеальна архітектура, мінімум пилу та готові нігті менш ніж за 2 години.",
      durationPl: "1 dzień (~8h)",
      durationUa: "1 день (~8 год)",
      levelPl: "Gotowa technika w 2h",
      levelUa: "Техніка 'Ready to wear' до 2 год",
      pricePln: 1200,
      badgePl: "Speed & Tech",
      badgeUa: "Швидкість",
      bonusPl: "W prezencie: Zestaw profesjonalnych górnych form (owal i kwadrat) do pracy w domu!",
      bonusUa: "В подарунок: Набір якісних верхніх форм (овал та квадрат) для самостійної роботи!",
      featuresPl: JSON.stringify([
        "Technika modelowania bez powierzchniowego piłowania",
        "Wybór form do paznokci płaskich, wypukłych i skręconych",
        "W prezencie zestaw form owal i kwadrat",
        "Praktyczny trening na 2 modelkach",
      ]),
      featuresUa: JSON.stringify([
        "Техніка моделювання без поверхневого опилу",
        "Підбір форм під плоскі, арочні та скручені нігті",
        "В подарунок набір форм овал та квадрат",
        "Практика на 2 реальних моделях з постановкою руки",
      ]),
      syllabusPl: JSON.stringify([
        {
          day: "Program 1-dniowy",
          title: "Kompleksowa technika pracy z formami górnymi",
          theory: "Klasyfikacja górnych form, dobór krzywizny i rozmiaru, chemia polyżeli/akrylożeli i płynnych żeli, kontrola wypływania materiału przy skórkach, uzyskanie naturalnej grubości krawędzi wolnej.",
          practice: "Odpracowanie na 2 modelkach (owal oraz kwadrat), indywidualna korekta ułożenia dłoni i pędzla dla wdrożenia ekspresowego tempa pracy.",
        },
      ]),
      syllabusUa: JSON.stringify([
        {
          day: "1-денний інтенсив",
          title: "Повна техніка роботи з верхніми формами",
          theory: "Класифікація верхніх форм, правильний підбір під тип нігтьової пластини, поєднання полігелів, акригелів та рідких матеріалів, техніка посадки без витікань, секрети ідеальної арки.",
          practice: "Відпрацювання на 2 реальних моделях, постановка руки для самостійної швидкісної роботи.",
        },
      ]),
      sortOrder: 3,
      isActive: true,
    },
    {
      slug: "bazowy-kurs-od-zera-4-dni",
      titlePl: "Kurs Podstawowy: Manicure od Zera (4 dni)",
      titleUa: "Базовий курс з 0 (4 дні)",
      subtitlePl: "Fundament zawodu stylistki: od anatomii i higieny po żel, french i pierwsze portfolio",
      subtitleUa: "Фундамент професії: від анатомії та стерилізації до гелю, френчу та першого портфоліо",
      descriptionPl: "Kompletny program wdrożeniowy dla początkujących. Zdobędziesz stabilną wiedzę teoretyczną, opanujesz frezarkę bez stresu i zrobisz swoje pierwsze idealne stylizacje na 4 modelkach.",
      descriptionUa: "Повний старт у професії nail-майстра для початківців. Анатомічна безпека, бездоганний комбінований манікюр без пропилів, робота з твердим гелем та фотозйомка перших робіт.",
      durationPl: "4 dni (32h)",
      durationUa: "4 дні (32 год)",
      levelPl: "Dla początkujących od zera",
      levelUa: "Початківці з нуля",
      pricePln: 2500,
      badgePl: "Bestseller od zera",
      badgeUa: "Базовий Bestseller",
      bonusPl: null,
      bonusUa: null,
      featuresPl: JSON.stringify([
        "Medyczne standardy sterylizacji i dezynfekcji",
        "Czysty manicure kombinowany bez zacięć",
        "Architektura żelu i wzmacnianie płytki",
        "Łącznie 4 modelki (w tym praca kontrolna) + certyfikat",
      ]),
      featuresUa: JSON.stringify([
        "Медичні стандарти стерилізації та дезінфекції",
        "Чистий комбінований манікюр без поранень",
        "Архітектура твердого гелю та виправлення форми",
        "4 модельні практики (включаючи контрольну роботу) + сертифікат",
      ]),
      syllabusPl: JSON.stringify([
        {
          day: "Dzień 1",
          title: "Baza, bezpieczeństwo i przygotowanie",
          theory: "Budowa anatomiczna aparatu paznokciowego, choroby i przeciwwskazania, zasady higieny i sterylizacji narzędzi medycznych, dobór profesjonalnej frezarki i kształtów frezów.",
          practice: "Bezpieczne usuwanie starej powłoki na tipsach treningowych, nauka czucia nacisku frezu.",
        },
        {
          day: "Dzień 2",
          title: "Nieskazitelnie czysty manicure kombinowany",
          theory: "Schematy frezowania, prawidłowe unoszenie i otwieranie kieszeni wału, klasyfikacja baz i topów, wyrównanie płytki bez zalewania skórek.",
          practice: "1 modelka (manicure kombinowany, idealne wyrównanie bazą, aplikacja koloru pod skórki).",
        },
        {
          day: "Dzień 3",
          title: "Twarde materiały i architektura żelu",
          theory: "Różnice między bazą hybrydową a twardym żelem, prawidłowa architektura (apeks, strefa stresu, cienki brzeg wolny), zasady opiłowania kształtów: kwadrat, owal, migdał.",
          practice: "1 modelka (wzmocnienie naturalnej płytki żelem, budowa architektury).",
        },
        {
          day: "Dzień 4",
          title: "Egzamin, french i fotografia na Instagram",
          theory: "Utrwalenie procedur, ergonomia i tempo pracy, geometria i proporcje malowanego frenchu, estetyczne oświetlenie i kompozycja zdjęć dłoni na social media.",
          practice: "Samodzielna praca egzaminacyjna na 1 modelce (manicure + wzmocnienie + stylizacja french).",
        },
      ]),
      syllabusUa: JSON.stringify([
        {
          day: "День 1",
          title: "База, безпека та підготовка",
          theory: "Анатомічна будова нігтя, безпека майстра та клієнта, дезінфекція та стерилізація за нормами, правильний вибір фрезера і фрез для щоденної роботи.",
          practice: "Безпечне зняття матеріалу на тренувальних тіпсах, відпрацювання кута та тиску фрези.",
        },
        {
          day: "День 2",
          title: "Чистий комбі-манікюр",
          theory: "Покрокові схеми роботи фрезою, розкриття кишені без пропилів, види баз та топів, техніка створення ідеального бліку, покриття під кутикулу.",
          practice: "1 модель (комбі-манікюр, вирівнювання базою, покриття під кутикулу).",
        },
        {
          day: "День 3",
          title: "Тверді матеріали та архітектура гелю",
          theory: "Чим гель відрізняється від бази і чому він незамінний, геометрія апекса та стресової зони, чіткий алгоритм опилу форм (квадрат, овал, мигдаль).",
          practice: "1 модель (укріплення натуральних нігтів твердим гелем без товщини).",
        },
        {
          day: "День 4",
          title: "Контроль, френч та фото для Instagram",
          theory: "Закріплення матеріалу, прийоми прискорення роботи, правила побудови пропорційного френчу, правильне світло та фото для Instagram.",
          practice: "Контрольна самостійна робота з 1 моделлю під наглядом інструктора.",
        },
      ]),
      sortOrder: 4,
      isActive: true,
    },
    {
      slug: "rozszerzony-kurs-podstawowy-5-dni",
      titlePl: "Rozszerzony Kurs Podstawowy: Start All-Inclusive (5 dni)",
      titleUa: "Розширений Базовий курс (5 днів)",
      subtitlePl: "Maksymalny pakiet: baza 4 dni + górne formy + pedicure pododyskiem + Instagram 2026",
      subtitleUa: "Максимальний пакет: база 4 дні + верхні форми + педикюр пододиском + Instagram 2026",
      descriptionPl: "Najbardziej wszechstronny program szkoleniowy dla osób, które chcą wejść do branży beauty z pełnym wachlarzem usług. Obejmuje pełen 4-dniowy kurs bazowy oraz dodatkowy moduł z górnych form, pedicure i marketingu.",
      descriptionUa: "Найповніший курс для впевненого входу в професію з повним спектром послуг. Включає повну програму 4-денного базового курсу плюс додатковий день з нарощування на верхні форми, естетичного педикюру та просування в Instagram.",
      durationPl: "5 dni (40h)",
      durationUa: "5 днів (40 год)",
      levelPl: "Kompleksowy start dla nowicjuszek",
      levelUa: "Максимальний комплексний старт",
      pricePln: 3000,
      badgePl: "All-Inclusive Pro",
      badgeUa: "Максимальний старт",
      bonusPl: "W prezencie: Aż 2 zestawy profesjonalnych górnych form do Twojego salonu!",
      bonusUa: "В подарунок: 2 набори професійних верхніх форм для швидкого старту!",
      featuresPl: JSON.stringify([
        "Cały program 4-dniowego kursu podstawowego",
        "Przedłużanie na formach górnych (Dual Forms)",
        "Podstawy pedicure estetycznego z użyciem Pododysku",
        "Strategia Instagram 2026 + W prezencie 2 zestawy form",
      ]),
      featuresUa: JSON.stringify([
        "Повна програма 4-денного базового курсу",
        "Моделювання на верхніх формах (Dual Forms)",
        "Основи естетичного педикюру з пододиском",
        "Стратегія Instagram 2026 + В подарунок 2 набори форм",
      ]),
      syllabusPl: JSON.stringify([
        {
          day: "Dni 1 – 4",
          title: "Pełny program Kursu Podstawowego",
          theory: "Anatomia, sterylizacja medyczna, czysty manicure kombinowany, twarde żele, opiłowanie kształtów, malowany french oraz egzamin.",
          practice: "Łącznie 4 modelki na praktykę (manicure, żel, french, egzamin).",
        },
        {
          day: "Dzień 5",
          title: "Górne formy + Pedicure Pododyskiem + Zaawansowany Instagram",
          theory: "Zasady pracy z górnymi formami bez piłowania, wprowadzenie do estetycznego pedicure z użyciem Pododysku (opracowanie stóp i skórek), najnowsze algorytmy Instagrama 2026 i tworzenie angażujących rolek (Reels).",
          practice: "1 modelka na przedłużanie na górnych formach + 1 modelka na pedicure estetyczny z pododyskiem.",
        },
      ]),
      syllabusUa: JSON.stringify([
        {
          day: "Дні 1 – 4",
          title: "Повна програма Базового курсу",
          theory: "Анатомія, дезінфекція/стерилізація, комбі-манікюр, вирівнювання, тверді гелі, архітектура, френч та контрольна робота.",
          practice: "4 модельні відпрацювання під контролем Уляни.",
        },
        {
          day: "День 5",
          title: "Верхні форми + Педикюр пододиском + Просування Instagram 2026",
          theory: "Моделювання на верхніх формах без опилу, техніка естетичного апаратного педикюру з пододиском, алгоритми Reels та контент-воронка на 2026 рік.",
          practice: "1 модель на нарощування верхніми формами + 1 модель на педикюр з пододиском.",
        },
      ]),
      sortOrder: 5,
      isActive: true,
    },
  ];

  for (const c of courses) {
    await prisma.course.create({ data: c });
  }

  // 3. Portfolio Items
  const portfolio = [
    {
      imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=1000&auto=format&fit=crop",
      titlePl: "Perfekcyjna architektura żelowa - Nude minimal",
      titleUa: "Ідеальна гелева архітектура - нюдовий мінімалізм",
      category: "gel",
      featured: true,
      sortOrder: 1,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1000&auto=format&fit=crop",
      titlePl: "Czysty manicure kombinowany pod skórki",
      titleUa: "Глибокий чистий комбі-манікюр під кутикулу",
      category: "manicure",
      featured: true,
      sortOrder: 2,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1000&auto=format&fit=crop",
      titlePl: "Klasyczny francuski manicure na migdale",
      titleUa: "Елегантний витончений френч на мигдалеподібній формі",
      category: "french",
      featured: true,
      sortOrder: 3,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=1000&auto=format&fit=crop",
      titlePl: "Korekta paznokci trapezowych i zwężenie ścianek",
      titleUa: "Корекція трапецій та звуження бічних паралелей",
      category: "correction",
      featured: true,
      sortOrder: 4,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop",
      titlePl: "Naturalne wzmocnienie płytki twardym żelem",
      titleUa: "Природне зміцнення твердим гелем без візуального потовщення",
      category: "gel",
      featured: false,
      sortOrder: 5,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1000&auto=format&fit=crop",
      titlePl: "Subtelny Babyboomer ze złotym akcentem",
      titleUa: "Ніжний бебібумер з витонченим сяючим акцентом",
      category: "french",
      featured: false,
      sortOrder: 6,
    },
  ];

  for (const p of portfolio) {
    await prisma.portfolioItem.create({ data: p });
  }

  // 4. Testimonials
  const testimonials = [
    {
      name: "Katarzyna Wójcik",
      rolePl: "Właścicielka Studia Beauty (Kraków)",
      roleUa: "Власниця б'юті-студії (Краків)",
      textPl: "Uliana przeprowadziła mentoring dla moich 3 stylistek. Efekt przyszedł natychmiastowo: reklamacje z zapowietrzeniami spadły do zera, a dziewczyny przyspieszyły o prawie 40 minut na klientce! Klientki zachwycone czystością.",
      textUa: "Уляна провела менторинг для трьох майстрів моєї студії. Результат вражаючий: відшарування зникли взагалі, а дівчата скоротили час роботи майже на 40 хвилин. Клієнтки в захваті від якості.",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: "Олена Мельник",
      rolePl: "Stylistka po kursie 'Level Up Żel'",
      roleUa: "Майстер після курсу 'Level Up Гель'",
      textPl: "Dla mnie to był przełom. Wcześniej bałam się paznokci trapezowych i ciągle miałam odpryski w strefie skórek. Po 2 dniach z Ulianą zrozumiałam architekturę materiału. Ceny podniosłam o 30 zł i mam pełny grafik!",
      textUa: "Цей курс буквально перевернув моє бачення гелю. Раніше боялася складних нігтів, постійно боролася з відшаруваннями біля кутикули. Уляна показала все по поличках. Підняла прайс на 30 zł і записи розписані на місяць!",
      rating: 5,
      sortOrder: 2,
    },
    {
      name: "Marta Lewandowska",
      rolePl: "Absolwentka kursu od zera",
      roleUa: "Випускниця курсу з нуля",
      textPl: "Najlepsza inwestycja w siebie. Bałam się frezarki, ale spokój, cierpliwość i indywidualne podejście Uliany dały mi ogromną pewność. Od razu po kursie zaczęłam przyjmować pierwsze modelki bez stresu.",
      textUa: "Найкраща інвестиція в старт. Страшенно боялася фрезера, але спокій та індивідуальна увага Уляни дали впевненість. Відразу після курсу почала впевнено приймати клієнтів.",
      rating: 5,
      sortOrder: 3,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // 5. Settings
  const settings = [
    { key: "instagram_primary", value: "@uli.nails.krk" },
    { key: "instagram_secondary", value: "@uli.nail.krk" },
    { key: "telegram_handle", value: "uliana_p_u" },
    { key: "location", value: "Kraków, Polska" },
    { key: "phone", value: "+48 730 000 000" },
    {
      key: "google_form_url",
      value: "https://docs.google.com/forms/d/e/1FAIpQLSdk9UJoxIHIZtMvzwyGVjLawvwQ9MqqspUCmedYQyR4xv-h_g/viewform?usp=header",
    },
    {
      key: "hero_photo_url",
      value: "/uploads/img-2269-------1788893828203.jpg",
    },
    {
      key: "about_main_photo_url",
      value: "/uploads/img-2558-------1788893832635.jpg",
    },
    {
      key: "about_secondary_photo_url",
      value: "/uploads/img-2550-1788893834425.jpg",
    },
  ];

  for (const s of settings) {
    await prisma.setting.create({ data: s });
  }

  console.log("Seeding finished successfully with 5 detailed courses!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
