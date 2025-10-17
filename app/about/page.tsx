'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	BookOpen,
	Calendar,
	Code2,
	Coffee,
	FileText,
	Github,
	Heart,
	Instagram,
	Linkedin,
	Mail,
	Server,
	Sparkles,
	Terminal,
	Twitter,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Note: This is a client component, so metadata should be in a parent layout or separate metadata export
export default function AboutPage() {
	const [mounted, setMounted] = useState(false);
	const [glitchText, setGlitchText] = useState('coding');
	const [weirdFact, setWeirdFact] = useState(0);

	const activities = [
		'coding',
		'debugging',
		'programming',
		'scripting',
		'optimising',
		'refactoring',
		'abstracting',
		'contemplating',
		'anime watching',
		'procrastinating',
		'learning',
		'tinkering',
		'configuring',
		'frequency scanning',
		'hardware hacking',
		'signal analysis',
		'antenna building',
	];

	const weirdFacts = [
		'I study best if I act like I am teaching an imaginary group of students the material using a chalk board',
		'The more I think about getting asleep, the harder it gets to be asleep',
		'I always lose erasers before finishing them',
		'Even thinking about incomplete chalkboard erasures makes me uncomfortable',
		"Every time I walk by a window or mirror I check myself out but pretend I'm just looking around",
	];

	useEffect(() => {
		setMounted(true);

		// Glitch text effect
		const glitchInterval = setInterval(() => {
			setGlitchText(activities[Math.floor(Math.random() * activities.length)]);
		}, 2000);

		// Weird facts rotation
		const factInterval = setInterval(() => {
			setWeirdFact((prev) => (prev + 1) % weirdFacts.length);
		}, 8000);

		return () => {
			clearInterval(glitchInterval);
			clearInterval(factInterval);
		};
	}, []);

	const skills = [
		{ name: 'Kubernetes', icon: '☸', category: 'Infrastructure' },
		{ name: 'Docker', icon: '🐳', category: 'Infrastructure' },
		{ name: 'AWS', icon: '☁', category: 'Cloud' },
		{ name: 'Terraform', icon: '🏗', category: 'IaC' },
		{ name: 'Python', icon: '🐍', category: 'Languages' },
		{ name: 'Go', icon: '🔷', category: 'Languages' },
		{ name: 'TypeScript', icon: 'TS', category: 'Languages' },
		{ name: 'Next.js', icon: '▲', category: 'Frontend' },
	];

	const interests = [
		{ icon: '📺', label: 'Anime', desc: 'Serious anime enthusiast' },
		{ icon: '🎮', label: 'Dota 2', desc: '5k MMR | Meepo, Tinker, Timbersaw' },
		{ icon: '⚔', label: 'MMORPGs', desc: 'A3 India veteran player' },
		{ icon: '📻', label: 'SDR', desc: 'Software Defined Radio exploration' },
		{ icon: '🐧', label: 'Flipper Zero', desc: 'Multi-tool hardware hacking' },
		{ icon: '👾', label: 'Pwnagotchi', desc: 'AI-powered WiFi hacking' },
		{ icon: '🌐', label: 'LilyGO ESP', desc: 'ESP8266/ESP32 development' },
		{ icon: '📡', label: 'RabbitLab RF', desc: 'Custom antenna building' },
		{
			icon: '🔧',
			label: 'Hardware Hacking',
			desc: 'Circuit bending & modding',
		},
		{ icon: '🍕', label: 'Pizza', desc: 'Vegetarian fuel' },
		{ icon: '☕', label: 'Coffee', desc: 'Over 9000 cups' },
		{ icon: '📚', label: 'Learning', desc: 'Insatiable curiosity' },
		{ icon: '🌙', label: 'Night coding', desc: 'Peak productivity hours' },
	];

	const socialLinks = [
		{
			icon: Github,
			label: 'GitHub',
			href: 'https://github.com/sachincool',
			color: 'hover:text-purple-500',
		},
		{
			icon: Twitter,
			label: 'Twitter',
			href: 'https://twitter.com/exploit_sh',
			color: 'hover:text-blue-400',
		},
		{
			icon: Instagram,
			label: 'Instagram',
			href: 'https://instagram.com/exploit.sh',
			color: 'hover:text-pink-500',
		},
		{
			icon: Linkedin,
			label: 'LinkedIn',
			href: 'https://linkedin.com/in/harshit-luthra/',
			color: 'hover:text-blue-600',
		},
		{
			icon: Mail,
			label: 'Email',
			href: 'mailto:contact@sachin.cool',
			color: 'hover:text-red-500',
		},
	];

	return (
		<div className="space-y-12">
			{/* Hero Section */}
			<section className="relative py-12 overflow-hidden">
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-3xl" />

				<div
					className={`text-center space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
						<Terminal className="h-4 w-4" />
						<span>$ whoami</span>
					</div>

					<h1 className="text-4xl md:text-6xl font-bold">
						<span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
							Harshit Luthra
						</span>
					</h1>

					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						aka{' '}
						<span className="font-mono text-purple-600 dark:text-purple-400">
							sachincool
						</span>{' '}
						— Infrastructure Wizard 🧙 | Chaos Engineer | Professional Server
						Whisperer
					</p>

					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<span>Currently:</span>
						<span className="font-mono text-blue-600 dark:text-blue-400 min-w-[120px] text-left">
							{glitchText}
						</span>
						<Code2 className="h-4 w-4 animate-pulse" />
					</div>

					{/* Workspace Image */}
					<div className="mt-8 mb-6 flex justify-center">
						<div className="relative max-w-md mx-auto">
							<Image
								src="/images/workspace-setup.jpg"
								alt="My workspace setup with multiple monitors and tech equipment"
								width={600}
								height={400}
								className="rounded-xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
								priority
							/>
							<div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
								Infrastructure Wizard's Lair
							</div>
						</div>
					</div>

					{/* Social Links */}
					<div className="flex flex-wrap items-center justify-center gap-3 pt-4">
						{socialLinks.map((link) => (
							<Button
								key={link.label}
								variant="outline"
								size="sm"
								asChild
								className={`transition-colors ${link.color}`}
							>
								<a href={link.href} target="_blank" rel="noopener noreferrer">
									<link.icon className="h-4 w-4 mr-2" />
									{link.label}
								</a>
							</Button>
						))}
					</div>

					<div className="pt-4">
						<Button size="lg" asChild className="group">
							<a
								href="https://sachin.cool/Harshit_Resume.pdf"
								target="_blank"
								rel="noopener noreferrer"
							>
								<FileText className="mr-2 h-5 w-5" />
								Download Resume
								<Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
							</a>
						</Button>
					</div>
				</div>
			</section>

			{/* About Me */}
			<section className="max-w-4xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-2xl">
							<BookOpen className="h-6 w-6 text-blue-500" />
							About Me
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-lg leading-relaxed">
						<p>
							Hey there! I&apos;m Harshit, but you might know me as{' '}
							<span className="font-mono text-purple-600 dark:text-purple-400">
								sachincool
							</span>{' '}
							in the digital realm. I&apos;m a passionate infrastructure
							engineer who loves playing with servers, orchestrating Kubernetes
							clusters, and occasionally making production environments cry (and
							then fixing them, of course).
						</p>

						<p>
							I started my journey with C in college, moved to Python for
							scripts, fell in love with Kotlin and Android, and somehow ended
							up in the beautiful chaos of DevOps and infrastructure. These
							days, I spend my time taming containers, writing Infrastructure as
							Code, and pretending to understand distributed systems.
						</p>

						<p>
							When I&apos;m not debugging why a pod is in CrashLoopBackOff,
							you&apos;ll find me exploring radio frequencies with SDR, hacking
							hardware with my Flipper Zero, training my Pwnagotchi, watching
							anime, grinding to 5k MMR in Dota 2 with my favorite heroes
							(Meepo, Tinker, Timbersaw), reliving the glory days of A3 India
							MMORPG, or contemplating the meaning of life over pizza and coffee
							at 3 AM.
						</p>

						<div className="bg-muted/50 rounded-lg p-4 mt-6 border-l-4 border-blue-500">
							<p className="text-sm font-medium text-muted-foreground mb-2">
								Random Weird Fact:
							</p>
							<p className="italic">&quot;{weirdFacts[weirdFact]}&quot;</p>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Quick Facts */}
			<section className="max-w-4xl mx-auto">
				<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
					<Sparkles className="h-6 w-6 text-yellow-500" />
					Quick Facts
				</h2>
				<div className="grid md:grid-cols-2 gap-4">
					<Card>
						<CardContent className="pt-6">
							<ul className="space-y-3">
								<li className="flex items-start gap-2">
									<span className="text-green-500">✓</span>
									<span>Cancer ♋ (if that matters to you)</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-green-500">✓</span>
									<span>Agnostic & Vegetarian 🌱</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-green-500">✓</span>
									<span>Proud Introvert who loves being an introvert</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-green-500">✓</span>
									<span>Professional Procrastinator™</span>
								</li>
							</ul>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<ul className="space-y-3">
								<li className="flex items-start gap-2">
									<span className="text-blue-500">✓</span>
									<span>Can&apos;t dance for shit 💃❌</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-blue-500">✓</span>
									<span>Loves crazy jokes, puns, and the internet</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-blue-500">✓</span>
									<span>Probably dumber than I may seem</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-blue-500">✓</span>
									<span className="text-sm italic">
										In emergency, contact via ouija board
									</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Skills & Tech Stack */}
			<section className="max-w-4xl mx-auto">
				<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
					<Server className="h-6 w-6 text-purple-500" />
					Tech Arsenal
				</h2>
				<Card>
					<CardContent className="pt-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{skills.map((skill, index) => (
								<div
									key={index}
									className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-default"
								>
									<span className="text-3xl">{skill.icon}</span>
									<span className="font-medium text-sm">{skill.name}</span>
									<Badge variant="secondary" className="text-xs">
										{skill.category}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Interests */}
			<section className="max-w-4xl mx-auto">
				<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
					<Heart className="h-6 w-6 text-red-500" />
					Beyond the Server Rack
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
					{interests.map((interest, index) => (
						<Card
							key={index}
							className="hover:shadow-lg transition-all hover:-translate-y-1"
						>
							<CardHeader>
								<div className="text-4xl mb-2">{interest.icon}</div>
								<CardTitle className="text-lg">{interest.label}</CardTitle>
								<CardDescription>{interest.desc}</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>
			</section>

			{/* Philosophy */}
			<section className="max-w-4xl mx-auto">
				<Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2">
					<CardContent className="pt-8 pb-8 text-center">
						<Coffee className="h-12 w-12 mx-auto mb-4 text-orange-500" />
						<blockquote className="text-xl font-medium italic mb-4">
							&quot;Hope I die after I vanquish my thirst for more
							knowledge.&quot;
						</blockquote>
						<p className="text-muted-foreground">
							This nasty programmer never keeps away. He is never idle. He does
							all head-butted stuffs to build his Webapps. A tech-savvy by
							nature and a professional programmer, this man is damn crazy.
						</p>
						<Separator className="my-6" />
						<p className="text-sm text-muted-foreground">
							<span className="font-mono">
								01000100 01000011 00100000 01010011 01110101 01100011 01101011
								01110011
							</span>
							<br />
						</p>
					</CardContent>
				</Card>
			</section>

			{/* CTA */}
			<section className="max-w-4xl mx-auto text-center">
				<Card>
					<CardContent className="pt-8 pb-8">
						<h2 className="text-2xl font-bold mb-4">Let&apos;s Connect!</h2>
						<p className="text-muted-foreground mb-6">
							Whether you want to discuss infrastructure, share anime
							recommendations, or debate the best pizza toppings, I&apos;m
							always up for a chat.
						</p>
						<div className="flex flex-wrap gap-4 justify-center">
							<Button asChild size="lg">
								<a href="mailto:contact@sachin.cool">
									<Mail className="mr-2 h-5 w-5" />
									Send me an email
								</a>
							</Button>
							<Button asChild size="lg" variant="outline">
								<a
									href="https://meet.harshit.cloud"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Calendar className="mr-2 h-5 w-5" />
									Schedule a meeting
								</a>
							</Button>
							<Button asChild size="lg" variant="outline">
								<Link href="/blog">
									<BookOpen className="mr-2 h-5 w-5" />
									Read my blog
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
