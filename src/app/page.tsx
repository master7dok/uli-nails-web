import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Courses from "@/components/Courses";
import LeadMagnetSection from "@/components/LeadMagnetSection";
import TrainingGallery from "@/components/TrainingGallery";
import PriceList from "@/components/PriceList";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import {
  defaultCourses,
  defaultServices,
  defaultPortfolio,
  defaultTrainingPhotos,
  defaultLeadMagnets,
  defaultBonusVideos,
  defaultTestimonials,
  defaultSettings,
} from "@/lib/defaultData";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let courses: any[] = [];
  let services: any[] = [];
  let portfolio: any[] = [];
  let trainingPhotos: any[] = [];
  let leadMagnets: any[] = [];
  let bonusVideos: any[] = [];
  let testimonials: any[] = [];
  let settingsList: any[] = [];

  try {
    const dbOnline = await isDatabaseAvailable();
    if (dbOnline) {
      [courses, services, portfolio, trainingPhotos, leadMagnets, bonusVideos, testimonials, settingsList] = await Promise.all([
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
        prisma.trainingPhoto.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        }),
        prisma.leadMagnet.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        }),
        prisma.bonusVideo.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        }),
        prisma.testimonial.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        }),
        prisma.setting.findMany(),
      ]);
    }
  } catch (error) {
    console.warn("Could not query database directly, utilizing fallback data:", error);
  }

  const settings: Record<string, string> = { ...defaultSettings };
  if (Array.isArray(settingsList) && settingsList.length > 0) {
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });
  }

  // Graceful fallback to default data if database is empty or during migration
  if (!courses || courses.length === 0) {
    courses = defaultCourses;
  }
  if (!services || services.length === 0) {
    services = defaultServices;
  }
  if (!portfolio || (settings.portfolio_initialized !== "true" && portfolio.length === 0)) {
    portfolio = defaultPortfolio;
  }
  if (!trainingPhotos || (settings.training_photos_initialized !== "true" && trainingPhotos.length === 0)) {
    trainingPhotos = defaultTrainingPhotos;
  }
  if (!leadMagnets || (settings.lead_magnets_initialized !== "true" && leadMagnets.length === 0)) {
    leadMagnets = defaultLeadMagnets;
  }
  if (!bonusVideos) {
    bonusVideos = defaultBonusVideos;
  }
  if (!testimonials || testimonials.length === 0) {
    testimonials = defaultTestimonials;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header settings={settings} />
      <Hero settings={settings} />
      <About settings={settings} />
      <Courses courses={courses} settings={settings} />
      <LeadMagnetSection items={leadMagnets} videos={bonusVideos} settings={settings} />
      <TrainingGallery items={trainingPhotos} settings={settings} />
      <PriceList services={services} settings={settings} />
      <Portfolio items={portfolio} settings={settings} />
      <Testimonials items={testimonials} settings={settings} />
      <Footer settings={settings} />
    </main>
  );
}
