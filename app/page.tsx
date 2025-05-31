import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmailInput } from "@/components/EmailInput";
import {StickyScrollRevealDemo} from "@/components/StickyScroll";
import { CompanyLogos } from "@/components/CompanyLogos";

export default function Home() {
  return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-16 bg-background">
    {/* HERO SECTION */}
    <section className="w-full max-w-4xl text-center flex flex-col items-center gap-6">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
        <span className="bg-gradient-to-r from-blue-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
          Maya
        </span>{" "}
        handles interviews
        <br />
        You just{" "}
        <span className="bg-gradient-to-r from-blue-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
          hire lah
        </span>
      </h1>

      <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl">
        Hirelah AI takes the burden of interviews off your shoulders so you can focus on what truly matters — finding the right people to lead your mission forward.
      </p>

      <div className="w-full max-w-md mt-6">
        <EmailInput />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/candidate/apply">I&apos;m a Candidate – Upload My Resume</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/recruiter/talent-pool">I&apos;m a Recruiter – Find Talent</Link>
        </Button>
      </div>
    </section>

    {/* Demo Visuals Placeholder */}
      <section className="w-full flex flex-col items-center mt-8">
        <Card className="w-full max-w-3xl">
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground text-lg">
            [Demo video or screenshots coming soon]
          </CardContent>
        </Card>
      </section>

    {/* STICKY SCROLL FULL-WIDTH SECTION */}
    <section className="w-screen mt-16">
      <StickyScrollRevealDemo />
    </section>

    {/* Company Logos Section */}
    <CompanyLogos />

      
    </main>
  );
}
