import CheckoutButton from '@/components/Payment/CheckoutButton'
import { siteConfig } from '@/config/site'
import { prisma } from '@/lib/prisma'
import { Award, BookOpen, CheckCircle2, PlayCircle, Users } from 'lucide-react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'

// Force dynamic rendering as we rely on database data that might change
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string, locale: string }>
}

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      curriculums: {
        where: { teacherId: null },
        include: {
          modules: {
            include: {
              lessons: true
            },
            orderBy: { order: 'asc' }
          }
        }
      },
      teachers: {
        include: {
          user: true
        }
      }
    }
  })

  if (!course) return null
  return course
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    return {
      title: 'Course Not Found',
    }
  }

  return {
    title: course.metaTitle || course.title,
    description: course.metaDescription || course.description,
    keywords: course.keywords,
    openGraph: {
      title: course.metaTitle || course.title,
      description: course.metaDescription || course.description || undefined,
      images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
    }
  }
}

export default async function CoursePage({ params }: Props) {
  const { slug, locale } = await params
  const course = await getCourse(slug)
  const t = await getTranslations({ locale, namespace: 'courses.detail' })

  if (!course) {
    notFound()
  }

  const tierMap: Record<string, string> = {
    'fundamentals': 'fundamentals',
    'full-stack-training': 'hands-on',
    'career-advancement': 'career'
  };

  const selectedTier = tierMap[slug] || 'hands-on';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      sameAs: 'https://futureready.com'
    },
    offers: {
      '@type': 'Offer',
      price: course.price.toString(),
      priceCurrency: 'INR',
      category: 'Paid'
    }
  }

  const curriculum = course.curriculums[0];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-bold tracking-wide">
                <span className="relative flex h-2 w-2 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {course.level} {t("level")}
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {course.title}
              </h1>

              <p className="text-xl text-text-muted leading-relaxed max-w-xl font-medium">
                {course.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <CheckoutButton
                  courseId={course.id}
                  courseTitle={course.title}
                  amount={Number(course.price)}
                />
                <button className="px-10 py-5 bg-accent/50 backdrop-blur-md border border-border text-foreground font-bold rounded-2xl hover:bg-accent transition-all">
                  {t("syllabus")}
                </button>
              </div>

              <div className="flex items-center gap-8 text-sm font-bold text-text-muted">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Users size={18} />
                  </div>
                  <span>1.2k+ {t("students")}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Award size={18} />
                  </div>
                  <span>{t("certificate")}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-border bg-accent/10 shadow-3xl aspect-video group">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                    <span className="text-text-muted font-bold italic">No Visual Available</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <button className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl">
                    <PlayCircle className="w-10 h-10 text-white fill-current" />
                  </button>
                </div>
              </div>

              {/* Stats Badge */}
              <div className="absolute -bottom-8 -right-8 bg-background p-6 rounded-3xl border border-border shadow-2xl hidden md:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-4 border-background bg-accent flex items-center justify-center text-xs font-black shadow-sm`}>
                        {i}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-black text-sm text-foreground">Join 50+ peers</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Enrolled this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="py-24 bg-accent/5 border-y border-border">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black mb-16 text-center">{t("learn")}</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {(typeof (course.whatYouWillLearn as any) === 'string'
              ? (course.whatYouWillLearn as any).split(',')
              : (course.whatYouWillLearn as unknown as string[]) || []
            ).map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all group">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-black">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-foreground/90 font-medium">{item}</span>
              </div>
            ))}
            {(!course.whatYouWillLearn || (course.whatYouWillLearn as unknown as any[]).length === 0) && (
              <p className="text-text-muted col-span-2 text-center font-medium italic">{t("comingSoon")}</p>
            )}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-32">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-4xl font-black mb-16">{t("curriculum")}</h2>
          <div className="space-y-6">
            {curriculum?.modules.map((module) => (
              <div key={module.id} className="border border-border rounded-3xl overflow-hidden bg-accent/5 backdrop-blur-sm">
                <div className="p-8 flex items-center justify-between bg-accent/10">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    {module.title}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-text-muted bg-background px-4 py-1.5 rounded-full border border-border">
                    {module.lessons.length} {t("lessons")}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-background hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <PlayCircle className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                        <span className="text-sm font-semibold text-text-muted group-hover:text-foreground transition-all">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-text-muted border border-border px-3 py-1 rounded-lg">Video</span>
                    </div>
                  ))}
                  {module.lessons.length === 0 && (
                    <p className="text-sm text-text-muted pl-12 italic opacity-60">Session details pending.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="py-32 border-t border-border bg-accent/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-4xl font-black mb-16">{t("instructors")}</h2>
          <div className="grid md:grid-cols-2 gap-10">
            {course.teachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center gap-8 p-8 rounded-3xl bg-background border border-border shadow-xl shadow-black/5 group hover:border-primary/30 transition-all">
                <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-4xl font-black text-black shadow-lg shadow-primary/20 shrink-0 transform group-hover:rotate-3 transition-transform">
                  {teacher.user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground mb-1">{teacher.user.name}</h3>
                  <p className="text-primary font-bold text-sm mb-4 uppercase tracking-widest">{teacher.domain}</p>
                  <p className="text-sm text-text-muted leading-relaxed font-medium">Industry veteran with deep expertise in full-stack engineering and product architecture.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-20" /> {/* Spacer */}
    </div>
  )
}
