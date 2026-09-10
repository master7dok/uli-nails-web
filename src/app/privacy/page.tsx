"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Globe, Lock, CheckCircle, Mail, MapPin } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState<"pl" | "ua">("pl");

  const isPl = lang === "pl";

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#2A2523] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top bar with back link and language toggle */}
        <div className="flex items-center justify-between gap-4 mb-10 pb-6 border-b border-nude-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-700 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isPl ? "Powrót do strony głównej" : "Повернутися на головну"}</span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#EFE9DF] p-1 rounded-full border border-[#E4D9CA]">
            <button
              onClick={() => setLang("pl")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                isPl
                  ? "bg-white text-charcoal-900 shadow-xs"
                  : "text-charcoal-500 hover:text-charcoal-800"
              }`}
            >
              🇵🇱 Polski
            </button>
            <button
              onClick={() => setLang("ua")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                !isPl
                  ? "bg-white text-charcoal-900 shadow-xs"
                  : "text-charcoal-500 hover:text-charcoal-800"
              }`}
            >
              🇺🇦 Українська
            </button>
          </div>
        </div>

        {/* Header Badge & Title */}
        <div className="text-center sm:text-left mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-nude-100 border border-nude-300 mb-4 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {isPl ? "Dokument Prawny (RODO / GDPR)" : "Правовий документ (GDPR)"}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 mb-3">
            {isPl ? "Polityka Prywatności i Plików Cookies" : "Політика конфіденційності та файлів Cookie"}
          </h1>
          <p className="text-xs text-charcoal-500">
            {isPl
              ? "Ostatnia aktualizacja: marzec 2026 r. • Zgodność z RODO (Rozporządzenie UE 2016/679)"
              : "Останнє оновлення: березень 2026 р. • Відповідність регламенту ЄС 2016/679 (GDPR)"}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft border border-nude-200/90 space-y-8 text-sm text-charcoal-700 leading-relaxed">
          {isPl ? (
            /* POLISH VERSION */
            <>
              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  1. Informacje ogólne i Administrator Danych
                </h2>
                <p>
                  Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych
                  użytkowników korzystających ze strony internetowej <strong>Uliana Nails</strong> (dostępnej pod adresem domeny internetowej serwisu),
                  prowadzonej w celach prezentacji oferty salonowej oraz szkoleń stacjonarnych ze stylizacji paznokci w Krakowie.
                </p>
                <div className="p-4 rounded-xl bg-nude-50 border border-nude-200/70 text-xs space-y-1.5">
                  <p className="font-semibold text-charcoal-900">Dane Administratora (Impressum):</p>
                  <p><strong>Nazwa:</strong> Uliana Nails (działalność usługowo-szkoleniowa)</p>
                  <p><strong>Lokalizacja:</strong> Kraków, Polska</p>
                  <p><strong>Kontakt Instagram:</strong> @uli.nails.krk (PL) / @uli.nail.krk (UA)</p>
                  <p><strong>Kontakt Telegram:</strong> @uliana_p_u</p>
                  <p><strong>Zakres działalności:</strong> Usługi stylizacji paznokci, szkolenia stacjonarne dla stylistek.</p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  2. Cele i podstawy prawne przetwarzania danych
                </h2>
                <p>Dane osobowe przetwarzane są na podstawie Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO):</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Rezerwacja wizyt i obsługa zapytań</strong> — kontakt przez komunikatory (Instagram Direct, Telegram)
                    odbywa się dobrowolnie na podstawie zgody użytkownika (art. 6 ust. 1 lit. a RODO) lub w celu podjęcia działań na żądanie osoby przed zawarciem umowy (art. 6 ust. 1 lit. b RODO).
                  </li>
                  <li>
                    <strong>Aplikacja na kursy stacjonarne</strong> — wypełnienie ankiety wstępnej (Google Forms) służy kwalifikacji
                    oraz adaptacji programu szkoleniowego do poziomu kursantki (art. 6 ust. 1 lit. b RODO).
                  </li>
                  <li>
                    <strong>Prawidłowe działanie strony i preferencje</strong> — przechowywanie wybranego języka w pamięci LocalStorage
                    w oparciu o uzasadniony interes Administratora polegający na zapewnieniu ergonomii i wygody korzystania z serwisu (art. 6 ust. 1 lit. f RODO).
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  3. Pliki Cookies oraz pamięć LocalStorage
                </h2>
                <p>
                  Serwis stosuje mechanizmy cookies oraz technologię pamięci lokalnej przeglądarki (LocalStorage):
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>LocalStorage (język)</strong>: klucz <code>uli_lang</code> przechowuje wybrany przez Ciebie język (PL lub UA), aby nie było konieczności ponownego wyboru przy przeładowaniu strony.
                  </li>
                  <li>
                    <strong>LocalStorage (zgoda cookies)</strong>: klucz <code>uli_cookie_consent</code> zapamiętuje Twoją decyzję dotyczącą akceptacji komunikatu o prywatności.
                  </li>
                  <li>
                    <strong>Niezbędne pliki cookies sesji</strong>: cookie <code>uli_admin_token</code> stosowane jest wyłącznie po zalogowaniu do panelu administracyjnego w celu autoryzacji uprawnień edytora.
                  </li>
                </ul>
                <p className="text-xs text-charcoal-500">
                  W każdej chwili możesz usunąć zapisane dane cookies oraz wyczyścić LocalStorage w ustawieniach swojej przeglądarki internetowej.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  4. Odbiorcy danych i transfer poza EOG
                </h2>
                <p>
                  Administrator nie sprzedaje ani nie przekazuje Twoich danych osobowych podmiotom trzecim w celach marketingowych.
                  Odbiorcami danych mogą być wyłącznie:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Dostawcy usług hostingowych i infrastruktury serwerowej obsługującej witrynę.</li>
                  <li>Google LLC (w zakresie dobrowolnie wypełnianych formularzy Google Forms zgodnie z polityką prywatności Google).</li>
                  <li>Meta Platforms Ireland Ltd. / Telegram FZ-LLC (w zakresie bezpośredniej korespondencji z inicjatywy użytkownika).</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  5. Prawa osób, których dane dotyczą
                </h2>
                <p>Zgodnie z RODO przysługują Ci następujące prawa:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-nude-50 border border-nude-200/80 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Prawo dostępu do treści swoich danych</span>
                  </div>
                  <div className="p-3 rounded-xl bg-nude-50 border border-nude-200/80 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Prawo do ich sprostowania i uzupełnienia</span>
                  </div>
                  <div className="p-3 rounded-xl bg-nude-50 border border-nude-200/80 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Prawo do usunięcia danych („prawo do bycia zapomnianym”)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-nude-50 border border-nude-200/80 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Prawo do wniesienia skargi do organu nadzorczego (Prezes UODO)</span>
                  </div>
                </div>
              </section>

              <section className="space-y-3 pt-2">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  6. Kontakt w sprawach prywatności
                </h2>
                <p>
                  Wszelkie zapytania lub wnioski dotyczące realizacji Twoich praw można kierować bezpośrednio
                  poprzez wiadomość prywatną na profilu Instagram <strong>@uli.nails.krk</strong> lub Telegram <strong>@uliana_p_u</strong>.
                </p>
              </section>
            </>
          ) : (
            /* UKRAINIAN VERSION */
            <>
              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  1. Загальна інформація та Володілець даних
                </h2>
                <p>
                  Ця Політика конфіденційності встановлює порядок обробки та захисту персональних даних
                  користувачів сайту <strong>Uliana Nails</strong>, що створений для демонстрації послуг та авторських офлайн-курсів
                  із моделювання та архітектури гелю в Кракові.
                </p>
                <div className="p-4 rounded-xl bg-nude-50 border border-nude-200/70 text-xs space-y-1.5">
                  <p className="font-semibold text-charcoal-900">Відомості про володільця (Impressum):</p>
                  <p><strong>Бренд / Майстер:</strong> Uliana Nails (послуги та авторське навчання)</p>
                  <p><strong>Місто:</strong> Краків, Польща</p>
                  <p><strong>Instagram:</strong> @uli.nail.krk (UA) / @uli.nails.krk (PL)</p>
                  <p><strong>Telegram:</strong> @uliana_p_u</p>
                  <p><strong>Діяльність:</strong> Естетичний манікюр, зміцнення гелем, підвищення кваліфікації nail-майстрів.</p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  2. Мета та підстави обробки персональних даних
                </h2>
                <p>Обробка даних здійснюється у повній відповідності до європейського регламенту GDPR (EU 2016/679):</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Запис на послуги та консультації</strong> — листування через Instagram Direct або Telegram
                    здійснюється добровільно за згодою користувача для узгодження часу запису (ст. 6 ч. 1 п. a, b GDPR).
                  </li>
                  <li>
                    <strong>Анкета запису на курси</strong> — заповнення попередньої форми Google Forms використовується
                    для визначення вашого рівня та адаптації навчального плану (ст. 6 ч. 1 п. b GDPR).
                  </li>
                  <li>
                    <strong>Зручність інтерфейсу</strong> — збереження обраної мови сайту в LocalStorage
                    на підставі законного інтересу для забезпечення комфортної роботи сайту (ст. 6 ч. 1 п. f GDPR).
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  3. Використання файлів Cookie та LocalStorage
                </h2>
                <p>Наш сайт використовує технічні файли cookie та сховище браузера LocalStorage:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>LocalStorage (мова)</strong>: ключ <code>uli_lang</code> зберігає обрану мову (UA або PL), щоб вам не доводилося щоразу перемикати її при оновленні сторінки.
                  </li>
                  <li>
                    <strong>LocalStorage (згода)</strong>: ключ <code>uli_cookie_consent</code> зберігає факт закриття банера про cookie.
                  </li>
                  <li>
                    <strong>Технічні файли авторизації</strong>: cookie <code>uli_admin_token</code> застосовується лише для захищеного входу до панелі адміністратора.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  4. Ваші права згідно з GDPR
                </h2>
                <p>Як користувач сайту, ви маєте повні права відповідно до законодавства ЄС:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-nude-50 border border-nude-200/80 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Право на доступ до своїх персональних даних</span>
                  </div>
                  <div className="p-3 rounded-xl bg-nude-50 border border-nude-200/80 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Право на виправлення або видалення даних</span>
                  </div>
                  <div className="p-3 rounded-xl bg-nude-50 border border-nude-200/80 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Право відкликати свою згоду на зв&apos;язок</span>
                  </div>
                  <div className="p-3 rounded-xl bg-nude-50 border border-nude-200/80 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>Право подати скаргу до наглядового органу (UODO в Польщі)</span>
                  </div>
                </div>
              </section>

              <section className="space-y-3 pt-2">
                <h2 className="font-serif text-xl font-semibold text-charcoal-900">
                  5. Контакти для звернень
                </h2>
                <p>
                  З усіх питань щодо ваших даних ви можете звернутися безпосередньо в Instagram Direct <strong>@uli.nail.krk</strong> або в Telegram <strong>@uliana_p_u</strong>.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
