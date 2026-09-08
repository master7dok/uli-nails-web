import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Courses from "@/components/Courses";
import PriceList from "@/components/PriceList";
import Portfolio from "@/components/Portfolio";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [courses, services, portfolio, testimonials, settingsList] = await Promise.all([
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

  const settings: Record<string, string> = {};
  settingsList.forEach((s) => {
    settings[s.key] = s.value;
  });

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
