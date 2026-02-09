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
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AboutPageClient() {
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

		const glitchInterval = setInterval(() => {
			setGlitchText(activities[Math.floor(Math.random() * activities.length)]);
		}, 2000);

		const factInterval = setInterval(() => {
			setWeirdFact((prev) => (prev + 1) % weirdFacts.length);
		}, 8000);

		return () => {
			clearInterval(glitchInterval);
			clearInterval(factInterval);
		};
	}, []);

	const skills = [
		{ name: 'Kubernetes', icon: '☸', category: 'Infrastructure', level: 92 },
		{ name: 'Docker', icon: '🐳', category: 'Infrastructure', level: 95 },
		{ name: 'AWS', icon: '☁', category: 'Cloud', level: 88 },
		{ name: 'Terraform', icon: '🏗', category: 'IaC', level: 85 },
		{ name: 'Python', icon: '🐍', category: 'Languages', level: 80 },
		{ name: 'Go', icon: '🔷', category: 'Languages', level: 75 },
		{ name: 'TypeScript', icon: 'TS', category: 'Languages', level: 82 },
		{ name: 'Next.js', icon: '▲', category: 'Frontend', level: 78 },
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
			{/* Hero Section - Enhanced with animated gradient and glowing profile */}
			<section className="relative py-12 overflow-hidden">
				{/* Animated gradient background */}
				<motion.div
					className="absolute inset-0 -z-10 rounded-3xl"
					animate={{
						background: [
							'linear-gradient(to bottom right, oklch(0.95 0.05 250), oklch(0.95 0.05 300), oklch(0.95 0.05 350))',
							'linear-gradient(to bottom right, oklch(0.95 0.05 260), oklch(0.95 0.05 310), oklch(0.95 0.05 340))',
							'linear-gradient(to bottom right, oklch(0.95 0.05 250), oklch(0.95 0.05 300), oklch(0.95 0.05 350))',
						],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: 'linear',
					}}
					style={{
						background:
							'linear-gradient(to bottom right, oklch(0.95 0.05 250), oklch(0.95 0.05 300), oklch(0.95 0.05 350))',
					}}
				/>
				<div className="absolute inset-0 -z-10 rounded-3xl dark:bg-gradient-to-br dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

				<motion.div
					className="text-center space-y-6"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<motion.div
						className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.2, duration: 0.4 }}
					>
						<Terminal className="h-4 w-4" />
						<span>$ whoami</span>
					</motion.div>

					<motion.h1
						className="text-4xl md:text-6xl font-bold"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.6 }}
					>
						<span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
							Harshit Luthra
						</span>
					</motion.h1>

					<motion.p
						className="text-xl text-muted-foreground max-w-2xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.6 }}
					>
						aka{' '}
						<span className="font-mono text-purple-600 dark:text-purple-400">
							sachincool
						</span>{' '}
						— Infrastructure Wizard 🧙 | Chaos Engineer | Professional Server
						Whisperer
					</motion.p>

					{/* Typing cursor effect */}
					<motion.div
						className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.6 }}
					>
						<span>Currently:</span>
						<span className="font-mono text-blue-600 dark:text-blue-400 min-w-[140px] text-left">
							{glitchText}
							<motion.span
								className="inline-block w-[2px] h-4 bg-blue-600 dark:bg-blue-400 ml-1"
								animate={{ opacity: [1, 0, 1] }}
								transition={{ duration: 0.8, repeat: Infinity }}
							/>
						</span>
						<Code2 className="h-4 w-4 animate-pulse" />
					</motion.div>

					{/* Profile image with glowing border */}
					<motion.div
						className="mt-8 mb-6 flex justify-center"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.6, duration: 0.6 }}
					>
						<div className="relative max-w-md mx-auto">
							{/* Rotating gradient border */}
							<motion.div
								className="absolute -inset-1 rounded-xl opacity-75 blur-sm"
								animate={{
									background: [
										'linear-gradient(0deg, oklch(0.6 0.3 250), oklch(0.6 0.3 300), oklch(0.6 0.3 250))',
										'linear-gradient(360deg, oklch(0.6 0.3 250), oklch(0.6 0.3 300), oklch(0.6 0.3 250))',
									],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: 'linear',
								}}
								style={{
									background:
										'linear-gradient(0deg, oklch(0.6 0.3 250), oklch(0.6 0.3 300), oklch(0.6 0.3 250))',
								}}
							/>
							<div className="relative">
								<Image
									src="/images/workspace-setup.jpg"
									alt="My workspace setup with multiple monitors and tech equipment"
									width={600}
									height={400}
									className="rounded-xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
									priority
								/>
								<div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
									Infrastructure Wizard&apos;s Lair
								</div>
							</div>
						</div>
					</motion.div>

					{/* Staggered social links */}
					<div className="flex flex-wrap items-center justify-center gap-3 pt-4">
						{socialLinks.map((link, index) => (
							<motion.div
								key={link.label}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
							>
								<Button
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
							</motion.div>
						))}
					</div>

					{/* Resume button with pulse effect */}
					<motion.div
						className="pt-4"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 1.2, duration: 0.5 }}
					>
						<Button size="lg" asChild className="group relative overflow-hidden">
							<a
								href="/Harshit_Resume.pdf"
								target="_blank"
								rel="noopener noreferrer"
							>
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
									animate={{
										scale: [1, 1.2, 1],
										opacity: [0.5, 0.8, 0.5],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
								/>
								<FileText className="mr-2 h-5 w-5 relative z-10" />
								<span className="relative z-10">Download Resume</span>
								<Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform relative z-10" />
							</a>
						</Button>
					</motion.div>
				</motion.div>
			</section>

			{/* About Me Section */}
			<motion.section
				className="max-w-4xl mx-auto"
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-80px' }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
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

						<motion.div
							className="bg-muted/50 rounded-lg p-4 mt-6 border-l-4 border-blue-500"
							key={weirdFact}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<p className="text-sm font-medium text-muted-foreground mb-2">
								Random Weird Fact:
							</p>
							<p className="italic">&quot;{weirdFacts[weirdFact]}&quot;</p>
						</motion.div>
					</CardContent>
				</Card>
			</motion.section>

			{/* Quick Facts Section - Alternating slide animations */}
			<motion.section
				className="max-w-4xl mx-auto"
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-80px' }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
				<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
					<Sparkles className="h-6 w-6 text-yellow-500" />
					Quick Facts
				</h2>
				<div className="grid md:grid-cols-2 gap-4">
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: '-80px' }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<Card>
							<CardContent className="pt-6">
								<ul className="space-y-3">
									{[
										'Cancer ♋ (if that matters to you)',
										'Agnostic & Vegetarian 🌱',
										'Proud Introvert who loves being an introvert',
										'Professional Procrastinator™',
									].map((fact, index) => (
										<motion.li
											key={index}
											className="flex items-start gap-2"
											initial={{ opacity: 0, x: -20 }}
											whileInView={{ opacity: 1, x: 0 }}
											viewport={{ once: true }}
											transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
										>
											<span className="text-green-500">✓</span>
											<span>{fact}</span>
										</motion.li>
									))}
								</ul>
							</CardContent>
						</Card>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: '-80px' }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<Card>
							<CardContent className="pt-6">
								<ul className="space-y-3">
									{[
										'Can&apos;t dance for shit 💃❌',
										'Loves crazy jokes, puns, and the internet',
										'Probably dumber than I may seem',
										{ text: 'In emergency, contact via ouija board', italic: true },
									].map((fact, index) => (
										<motion.li
											key={index}
											className="flex items-start gap-2"
											initial={{ opacity: 0, x: 20 }}
											whileInView={{ opacity: 1, x: 0 }}
											viewport={{ once: true }}
											transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
										>
											<span className="text-blue-500">✓</span>
											<span className={typeof fact === 'object' && fact.italic ? 'text-sm italic' : ''}>
												{typeof fact === 'string' ? fact : fact.text}
											</span>
										</motion.li>
									))}
								</ul>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</motion.section>

			{/* Tech Arsenal Section - Animated skill bars */}
			<motion.section
				className="max-w-4xl mx-auto"
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-80px' }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
				<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
					<Server className="h-6 w-6 text-purple-500" />
					Tech Arsenal
				</h2>
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-6">
							{skills.map((skill, index) => (
								<motion.div
									key={index}
									className="space-y-2"
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.1, duration: 0.4 }}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="text-3xl">{skill.icon}</span>
											<div>
												<span className="font-medium">{skill.name}</span>
												<Badge variant="secondary" className="text-xs ml-2">
													{skill.category}
												</Badge>
											</div>
										</div>
										<span className="text-sm font-medium text-muted-foreground">
											{skill.level}%
										</span>
									</div>
									<div className="h-2 bg-muted rounded-full overflow-hidden">
										<motion.div
											className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
											initial={{ width: 0 }}
											whileInView={{ width: `${skill.level}%` }}
											viewport={{ once: true }}
											transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
										/>
									</div>
								</motion.div>
							))}
						</div>
					</CardContent>
				</Card>
			</motion.section>

			{/* Beyond the Server Rack Section - Animated cards */}
			<motion.section
				className="max-w-4xl mx-auto"
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-80px' }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
				<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
					<Heart className="h-6 w-6 text-red-500" />
					Beyond the Server Rack
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
					{interests.map((interest, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							whileInView={{ opacity: 1, scale: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.05, duration: 0.4 }}
						>
							<Card
								className="hover:shadow-lg transition-all hover:-translate-y-1 group cursor-default relative overflow-hidden"
							>
								<motion.div
									className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								/>
								<CardHeader className="relative z-10">
									<motion.div
										className="text-4xl mb-2"
										whileHover={{ scale: 1.2, rotate: 5 }}
										transition={{ type: 'spring', stiffness: 300 }}
									>
										{interest.icon}
									</motion.div>
									<CardTitle className="text-lg">{interest.label}</CardTitle>
									<CardDescription>{interest.desc}</CardDescription>
								</CardHeader>
							</Card>
						</motion.div>
					))}
				</div>
			</motion.section>

			{/* Quote Section - Enhanced with floating quotes */}
			<motion.section
				className="max-w-4xl mx-auto"
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-80px' }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
				<Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 relative overflow-hidden">
					{/* Floating quote marks */}
					<motion.div
						className="absolute top-4 left-4 text-6xl text-blue-500/20 font-serif"
						animate={{
							y: [0, -10, 0],
							opacity: [0.2, 0.4, 0.2],
						}}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					>
						&ldquo;
					</motion.div>
					<motion.div
						className="absolute bottom-4 right-4 text-6xl text-purple-500/20 font-serif"
						animate={{
							y: [0, 10, 0],
							opacity: [0.2, 0.4, 0.2],
						}}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: 'easeInOut',
							delay: 2,
						}}
					>
						&rdquo;
					</motion.div>

					<CardContent className="pt-8 pb-8 text-center relative z-10">
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							whileInView={{ scale: 1, opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<Coffee className="h-12 w-12 mx-auto mb-4 text-orange-500" />
						</motion.div>
						<motion.blockquote
							className="text-xl font-medium italic mb-4"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2, duration: 0.6 }}
						>
							&quot;Hope I die after I vanquish my thirst for more
							knowledge.&quot;
						</motion.blockquote>
						<motion.p
							className="text-muted-foreground"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.3, duration: 0.6 }}
						>
							This nasty programmer never keeps away. He is never idle. He
							head-butts his way through problems to build his Webapps. A tech-savvy by
							nature and a professional programmer, this man is damn crazy.
						</motion.p>
						<Separator className="my-6" />
						<motion.p
							className="text-sm text-muted-foreground font-mono"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.5, duration: 1 }}
						>
							<motion.span
								animate={{
									opacity: [0.3, 1, 0.3],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
							>
								01000100 01000011 00100000 01010011 01110101 01100011 01101011
								01110011
							</motion.span>
						</motion.p>
					</CardContent>
				</Card>
			</motion.section>

			{/* Connect Section - Staggered buttons with pulse */}
			<motion.section
				className="max-w-4xl mx-auto text-center"
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-80px' }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
				<Card>
					<CardContent className="pt-8 pb-8">
						<motion.h2
							className="text-2xl font-bold mb-4"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							Let&apos;s Connect!
						</motion.h2>
						<motion.p
							className="text-muted-foreground mb-6"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1, duration: 0.5 }}
						>
							Whether you want to discuss infrastructure, share anime
							recommendations, or debate the best pizza toppings, I&apos;m
							always up for a chat.
						</motion.p>
						<div className="flex flex-wrap gap-4 justify-center">
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.2, duration: 0.4 }}
							>
								<Button asChild size="lg" className="relative overflow-hidden group">
									<a href="mailto:contact@sachin.cool">
										<motion.div
											className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30"
											animate={{
												scale: [1, 1.5, 1],
												opacity: [0.3, 0.6, 0.3],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: 'easeInOut',
											}}
										/>
										<Mail className="mr-2 h-5 w-5 relative z-10" />
										<span className="relative z-10">Send me an email</span>
									</a>
								</Button>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.3, duration: 0.4 }}
							>
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
							</motion.div>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.4, duration: 0.4 }}
							>
								<Button asChild size="lg" variant="outline">
									<Link href="/blog">
										<BookOpen className="mr-2 h-5 w-5" />
										Read my blog
									</Link>
								</Button>
							</motion.div>
						</div>
					</CardContent>
				</Card>
			</motion.section>
		</div>
	);
}
