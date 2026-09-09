import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Courses from "@/components/Courses";
import PriceList from "@/components/PriceList";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import {
  defaultCourses,
  defaultServices,
  defaultPortfolio,
  defaultTestimonials,
  defaultSettings,
} from "@/lib/defaultData";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let courses: any[] = [];
  let services: any[] = [];
  let portfolio: any[] = [];
  let testimonials: any[] = [];
  let settingsList: any[] = [];

  try {
    [courses, services, portfolio, testimonials, settingsList] = await Promise.all([
      prisma.course.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.service.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.portfolioItem.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.testimonial.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.setting.findMany(),
    ]);
  } catch (error) {
    console.warn("Could not query database directly, utilizing fallback data:", error);
  }

  // Graceful fallback to default data if database is empty or during migration
  if (!courses || courses.length === 0) {
    courses = defaultCourses;
  }
  if (!services || services.length === 0) {
    services = defaultServices;
  }
  if (!portfolio || portfolio.length === 0) {
    portfolio = defaultPortfolio;
  }
  if (!testimonials || testimonials.length === 0) {
    testimonials = defaultTestimonials;
  }

  const settings: Record<string, string> = { ...defaultSettings };
  if (Array.isArray(settingsList) && settingsList.length > 0) {
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Hero settings={settings} />
      <About settings={settings} />
      <Courses courses={courses} />
      <PriceList services={services} />
      <Portfolio items={portfolio} />
      <Testimonials items={testimonials} />
      <Footer />
    </main>
  );
}
