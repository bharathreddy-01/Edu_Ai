"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  Check,
  ChevronDown,
  Clock3,
  GraduationCap,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
} as const;

const features = [
  {
    icon: Brain,
    title: "AI tutor that adapts",
    text: "Explains concepts, catches misconceptions, and changes strategy by subject, goal, and confidence.",
  },
  {
    icon: Target,
    title: "Exam-aware pathways",
    text: "JEE and NEET plans shaped around syllabus weightage, weak chapters, and revision windows.",
  },
  {
    icon: BookOpenCheck,
    title: "Practice that compounds",
    text: "Every quiz, doubt, and mistake updates the learner profile for sharper recommendations.",
  },
];

const quizCards = [
  ["Physics", "Rotational dynamics", "14 questions", 72],
  ["Chemistry", "Coordination compounds", "22 questions", 84],
  ["Math", "Definite integration", "18 questions", 61],
] as const;

const testimonials = [
  {
    quote:
      "The coach made revision feel surgical. I knew exactly what to solve before each mock.",
    name: "Aarav M.",
    role: "JEE aspirant",
  },
  {
    quote:
      "My biology retention improved because the app kept bringing back weak NCERT lines.",
    name: "Ishita R.",
    role: "NEET aspirant",
  },
  {
    quote:
      "The analytics helped us stop guessing. Parent meetings became much more concrete.",
    name: "Rohan S.",
    role: "Academic mentor",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "Free",
    description: "For students exploring adaptive study planning.",
    features: ["Daily AI plan", "Basic quiz tracking", "7-day analytics"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "₹799/mo",
    description: "For serious JEE/NEET preparation with full coaching.",
    features: [
      "Unlimited AI tutor",
      "Adaptive quizzes",
      "Advanced analytics",
      "Revision calendar",
    ],
    cta: "Choose Pro",
    featured: true,
  },
  {
    name: "Institute",
    price: "Custom",
    description: "For coaching centers managing student cohorts.",
    features: ["Mentor dashboard", "Cohort analytics", "Admin controls"],
    cta: "Contact sales",
  },
];

const faqs = [
  [
    "Is this built for JEE and NEET?",
    "Yes. The product structure, subjects, revision logic, and analytics are designed around Indian competitive exam preparation.",
  ],
  [
    "Can students use Google login?",
    "Yes. Supabase Auth supports Google OAuth alongside email and password login.",
  ],
  [
    "Does the AI replace teachers?",
    "No. It acts as a personal practice and revision coach, while teachers and mentors remain central for deeper guidance.",
  ],
  [
    "Is student data protected?",
    "The backend architecture uses Supabase Row Level Security so students can only access their own learning data.",
  ],
] as const;

const analyticsCards = [
  { label: "Readiness", value: "74%", icon: BarChart3 },
  { label: "Questions solved", value: "1,284", icon: BookOpenCheck },
  { label: "Study streak", value: "18 days", icon: Trophy },
  { label: "AI coaching saves", value: "4.5 hrs", icon: Brain },
];

function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_38%),linear-gradient(45deg,color-mix(in_oklch,var(--accent)_24%,transparent),transparent_42%),var(--background)]" />
      <motion.div
        className="absolute top-24 left-1/2 hidden w-[980px] -translate-x-1/2 lg:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <div className="grid rotate-[-2deg] grid-cols-[1.1fr_0.9fr] gap-4 opacity-75">
          <div className="bg-background/55 rounded-lg border p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="bg-primary/70 h-3 w-32 rounded-full" />
                <div className="bg-muted mt-2 h-2 w-52 rounded-full" />
              </div>
              <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-lg">
                <Brain className="size-5" />
              </div>
            </div>
            <div className="grid gap-3">
              {[82, 68, 91, 57].map((value) => (
                <div key={value} className="bg-card/70 rounded-md border p-3">
                  <div className="mb-2 flex justify-between">
                    <div className="bg-muted h-2 w-28 rounded-full" />
                    <div className="bg-primary/70 h-2 w-8 rounded-full" />
                  </div>
                  <Progress value={value} label="Hero dashboard preview" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="bg-background/50 rounded-lg border p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <MessageCircle className="text-primary size-5" />
                <div className="bg-muted h-3 w-40 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="bg-primary/85 ml-auto h-10 w-52 rounded-md" />
                <div className="bg-card/80 h-16 w-64 rounded-md" />
                <div className="bg-accent/80 ml-auto h-10 w-44 rounded-md" />
              </div>
            </div>
            <div className="bg-background/50 rounded-lg border p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <Trophy className="text-warning-foreground dark:text-warning size-8" />
                <div className="text-right">
                  <div className="text-3xl font-semibold">92%</div>
                  <div className="text-muted-foreground text-xs">
                    target readiness
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <header className="bg-background/72 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
              <GraduationCap className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Learning Coach</p>
              <p className="text-muted-foreground text-xs">JEE/NEET AI tutor</p>
            </div>
          </Link>
          <nav className="text-muted-foreground hidden items-center gap-6 text-sm md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#analytics" className="hover:text-foreground">
              Analytics
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <HeroScene />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Badge variant="glass">
              <Sparkles className="mr-1 size-3.5" aria-hidden="true" />
              Adaptive AI coaching for ambitious students
            </Badge>
            <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-normal sm:text-6xl lg:text-7xl">
              Turn every mistake into a smarter study plan.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
              A premium AI tutor for JEE and NEET preparation that explains
              doubts, creates adaptive quizzes, tracks progress, and keeps
              students focused on the next best action.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Start learning free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">
                  <PlayCircle className="size-4" aria-hidden="true" />
                  Watch dashboard
                </Link>
              </Button>
            </div>
            <div className="text-muted-foreground mt-8 grid max-w-2xl gap-3 text-sm sm:grid-cols-3">
              {["AI tutor", "Adaptive quizzes", "Progress analytics"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="text-success-foreground dark:text-success size-4" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="max-w-2xl">
            <Badge variant="outline">AI tutor showcase</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Personal tutoring that remembers every learner.
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.08 }}
              >
                <Card className="h-full shadow-sm">
                  <CardHeader>
                    <div className="bg-secondary text-secondary-foreground mb-4 flex size-11 items-center justify-center rounded-lg">
                      <feature.icon className="size-5" aria-hidden="true" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.text}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div {...fadeUp}>
            <Badge variant="glass">Adaptive learning showcase</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              The plan changes as the student changes.
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-7">
              The coach blends quiz performance, revision history, confidence,
              and exam target dates to decide what the student should do next.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                "Weak topic detection",
                "Spaced revision",
                "Goal-aware scheduling",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <Zap className="text-primary size-4" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="glass-panel rounded-lg p-5">
            <div className="grid gap-4">
              {quizCards.map(([subject, topic, count, score]) => (
                <div key={subject} className="bg-card rounded-md border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{subject}</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {topic} · {count}
                      </p>
                    </div>
                    <Badge variant="secondary">{score}%</Badge>
                  </div>
                  <Progress
                    className="mt-4"
                    value={score}
                    label={`${subject} adaptive score`}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="outline">AI quizzes</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Quizzes generated from gaps, not guesswork.
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              ["Diagnostic tests", "Find the starting point in each subject."],
              ["Micro practice", "Short sets for daily momentum."],
              ["Mock analysis", "AI reviews mistakes and next steps."],
            ].map(([title, text]) => (
              <motion.div key={title} {...fadeUp}>
                <Card className="h-full p-2 shadow-sm">
                  <CardHeader>
                    <Badge className="w-fit" variant="glass">
                      <Clock3 className="mr-1 size-3.5" />
                      Fast feedback
                    </Badge>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{text}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="analytics" className="px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="glass-panel mx-auto max-w-7xl overflow-hidden rounded-lg p-5 sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Badge variant="glass">Analytics dashboard preview</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
                Know what is improving, slipping, and ready for the exam.
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-7">
                Readiness scores, mastery graphs, streaks, quiz accuracy, and
                AI-generated revision priorities in one focused workspace.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {analyticsCards.map(({ label, value, icon: Icon }) => (
                <Card key={label} className="bg-background/58 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{label}</p>
                      <p className="mt-2 text-3xl font-semibold">{value}</p>
                    </div>
                    <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-lg">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="max-w-2xl">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Built for students, mentors, and high-stakes prep.
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.name} {...fadeUp}>
                <Card className="h-full shadow-sm">
                  <CardContent className="pt-5">
                    <div className="text-warning-foreground dark:text-warning mb-5 flex gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="size-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm leading-6">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="mt-5">
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="outline">Pricing</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Start free. Upgrade when coaching becomes daily.
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricing.map((plan) => (
              <motion.div key={plan.name} {...fadeUp}>
                <Card
                  className={
                    plan.featured
                      ? "glass-panel border-primary h-full p-1 shadow-lg"
                      : "h-full shadow-sm"
                  }
                >
                  <CardHeader>
                    {plan.featured ? (
                      <Badge className="w-fit" variant="default">
                        Most popular
                      </Badge>
                    ) : null}
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="text-3xl font-semibold">{plan.price}</p>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {plan.features.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm"
                        >
                          <Check className="text-success-foreground dark:text-success size-4" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="mt-6 w-full"
                      variant={plan.featured ? "default" : "secondary"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-5xl rounded-lg border bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_22%,var(--card)),var(--card))] p-8 text-center shadow-sm sm:p-12"
        >
          <ShieldCheck className="text-primary mx-auto size-10" />
          <h2 className="mt-5 text-3xl font-semibold tracking-normal sm:text-4xl">
            Give every student a coach that never loses context.
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-7">
            Launch secure AI tutoring, adaptive quizzes, and progress analytics
            with a platform built for conversion and long-term learning.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="outline">FAQ</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Questions before the first sprint?
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-3">
            {faqs.map(([question, answer]) => (
              <motion.details
                key={question}
                {...fadeUp}
                className="group bg-card rounded-lg border p-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {question}
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  {answer}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
              <GraduationCap className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Learning Coach</p>
              <p className="text-muted-foreground text-xs">
                Personalized AI tutoring for serious learners.
              </p>
            </div>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <Link href="/login" className="hover:text-foreground">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
