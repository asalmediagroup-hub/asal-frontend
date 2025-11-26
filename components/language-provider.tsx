"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// Supported languages
export type Language = "eng" | "ar" | "so";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateText: (text: string, targetLang?: Language) => Promise<string>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// -----------------------------------------------------------------------------
// Translations (Header + Footer + Services + About + Portfolio + News/Admin)
// -----------------------------------------------------------------------------
const translations: Record<Language, Record<string, string>> = {
  eng: {
    // Common / controls
    all: "All",
    prev: "Prev",
    next: "Next",
    goToSlide: "Go to slide",
    pageOf: "Page {page} of {total}",
    featuredStory: "Featured Story",
    latestStories: "Latest Stories",
    readMore: "Read More",
    readMoreArrow: "Read more →",
    readFullStory: "Read Full Story",
    stayUpdated: "Stay Updated",
    emailPlaceholder: "Enter your email",
    subscribe: "Subscribe",
    close: "Close",
    untitled: "Untitled",
    newsDesk: "News Desk",
    testimonialsTile: "What Our Partners Say",
    testimonialsSubtitle: "Hear from our partners about their experience working with us.",

    // --- Header nav (NEW) ---
    homeNav: "Home",
    aboutNav: "About Us",
    servicesNav: "Services",
    brandsNav: "Brands",
    packagesNav: "Packages",
    portfolioNav: "Portfolio",
    contactNav: "Contact",
    adminNav: "Admin",
    moreNav: "More...",
    faqsNav: "FAQs",
    Nasiye: "Nasiye",

    // --- HERO ---
    heroTitleConnecting: "Connecting",
    heroTitleCultures: "Cultures",
    heroTitleThrough: "Through",
    heroTitleMedia: "Media",
    heroSubtitleMain:
      "Asal Media Group brings together four powerful brands to deliver exceptional content across television, digital platforms, and production services throughout the region.",
    watchOurStory: "Watch Our Story",

    // --- Brand Highlights ---
    brandsSectionTitleOur: "Our",
    brandsSectionTitleMedia: "Media",
    brandsSectionTitleBrands: "Networks",
    brandsSectionSubtitle:
      "A unified media network serving millions with trusted, high-quality content.",
    brandAsalTVName: "Asal TV",
    brandAsalTVDesc:
      "Premium television crafted with high-quality Somali content, entertainment, and original programming. ",
    brandJiilMediaName: "Jiil Media",
    brandJiilMediaDesc:
      "Digital-first media platform creating innovative content for today’s young audience.",
    brandMasraxProductionName: "Masrax Production",
    brandMasraxProductionDesc:
      "A full-service production house delivering high-quality film, TV, and high- quality corporate advertising videos.",
    brandNasiyePlatformName: "Nasiye Platform",
    brandNasiyePlatformDesc:
      "A premium streaming platform offering Somali films, global movies, series, and live channels.",
    explorePlatform: "Explore Platform",
    nasiyeHighlightDesc:
      "Experience the future of mobile entertainment with Nasiye. Our flagship streaming platform offers exclusive content, live TV, and on-demand shows optimized for mobile viewing.",

    // AsalTV / Common section terms
    News: "News",
    newsNewsletterSubtitle:
      "Subscribe to our newsletter and never miss the latest news from Asal Media Group",

    // Services (general page strings)
    servicesPageTitle: "Our Services",
    servicesPageSubtitle:
      "From concept to completion, we deliver exceptional content that engages your audience and elevates your brand",
    contact: "Contact Us",
    getStarted: "Get Started",
    viewPortfolio: "View Portfolio",
    ourProcess: "Our Process",
    ourProcessSubtitle:
      "From concept to completion, we follow a proven process to deliver exceptional results",
    readyToStart: "Ready to Start Your Project?",
    readyToStartSubtitle:
      "Let's discuss how we can bring your vision to life with our comprehensive media services",
    noServicesFound: "No services found.",
    discover: "Discover",
    discoverDesc: "Understand your needs",
    design: "Design",
    designDesc: "Build the right strategy",
    create: "Create",
    createDesc: "Produce high-quality content",
    approve: "Approve",
    approveDesc: "Refine and finalize",
    publish: "Publish",
    publishDesc: "Distribute across platforms",
    support: "Support",
    supportDesc: "Monitor performance",
    viewAllServices: "View All Services",
    latest: "Latest News",
    sub: "Stay updated with the latest developments, achievements, and announcements from Asal Media Group and our brand portfolio.",
    viewAll: "View All News",
    category: "News",

    // Hero
    "faq.hero.title": "FAQ",
    "faq.hero.subtitle": "Quick answers about Asal TV services, support, and advertising.",
    "faq.hero.searchPlaceholder": "Search questions…",
    "faq.hero.totalCount": "{count} questions total",

    // Groups
    "faq.groups.general.title": "General",
    "faq.groups.services.title": "Services",
    "faq.groups.corporate.title": "Corporate Services",
    "faq.groups.tech.title": "Technical Support",
    "faq.groups.advertising.title": "Advertising",

    // Q&A — General
    "faq.q.general.whatIs.title": "What is Asal TV?",
    "faq.q.general.whatIs.body":
      "Asal TV is a leading broadcasting and media production company based in Mogadishu, Somalia. We offer comprehensive media services including cable TV, corporate video production, IPTV in Nasiye and Mobile App, and film & TV series production under Masrax Productions.",
    "faq.q.general.location.title": "Where is Asal TV located?",
    "faq.q.general.location.body": "Asal TV is headquartered in Mogadishu, Somalia — Laami-yaraha Zoobe.",

    // Q&A — Services
    "faq.q.services.whatProvide.title": "What services does Asal TV provide?",
    "faq.q.services.whatProvide.body":
      "Asal TV provides a variety of services including:\n• Cable TV services\n• Corporate video production\n• Internet Protocol Television (IPTV) services in Nasiye\n• Film and TV series production in Masrax\n• Event packages\n• Advertisement release\n• Video production packages",
    "faq.q.services.subscribeCable.title": "How can I subscribe to Asal TV's cable services?",
    "faq.q.services.subscribeCable.body": "Dial *424# or contact our customer service team at 424 to subscribe to our cable TV services.",
    "faq.q.services.whatIsIptv.title": "What is IPTV and how does it work?",
    "faq.q.services.whatIsIptv.body":
      "IPTV (Internet Protocol Television) delivers television content over the internet instead of traditional satellite or cable. You need a stable internet connection and a compatible device to watch.",

    // Q&A — Corporate
    "faq.q.corporate.videoProd.title": "Does Asal TV offer corporate video production services?",
    "faq.q.corporate.videoProd.body":
      "Yes. We produce professional corporate videos for marketing, conferences, events, campaigns, and more — from concept to final delivery.",

    // Q&A — Tech
    "faq.q.tech.supportContact.title": "Who can I contact for technical support with my Asal TV services?",
    "faq.q.tech.supportContact.body": "For technical support, call our customer service at 424 or WhatsApp +252 619 993 395.",
    "faq.q.tech.iptvNotWorking.title": "What should I do if my IPTV service is not working?",
    "faq.q.tech.iptvNotWorking.body":
      "First check your internet connection and device compatibility. If the issue persists, contact our technical support team at 141 for assistance.",

    // Q&A — Advertising
    "faq.q.advertising.options.title": "Does Asal TV offer advertising opportunities?",
    "faq.q.advertising.options.body":
      "Yes. We offer a range of advertising options. Please contact our Marketing Department for rate cards and packages.",

    // UI labels
    "faq.openPill": "Open",
    "faq.permalink": "Permalink",
    "faq.copyLink": "Copy link",
    "faq.noResults": "No results. Try a different search.",

    // Contact block
    "faq.contact.title": "Still need help?",
    "faq.contact.subtitle": "Call 424, WhatsApp +252 619 993 395, or reach our technical support at 141.",
    "faq.contact.callCta": "Call 424",
    "faq.contact.whatsappTitle": "Chat on WhatsApp",


    // --- ServicesOverview card strings
    serviceContentProduction: "Content Production",
    serviceContentProductionDesc:
      "End-to-end production services for TV shows, documentaries, commercials, and digital content.",
    serviceBroadcastingVOD: "Broadcasting & VOD",
    serviceBroadcastingVODDesc:
      "Television broadcasting and video-on-demand services across multiple platforms and devices.",
    serviceAdvertisingSolutions: "Advertising Solutions",
    serviceAdvertisingSolutionsDesc:
      "Strategic advertising and marketing services to help brands reach their target audiences effectively.",
    serviceConsultingServices: "Consulting Services",
    serviceConsultingServicesDesc:
      "Expert media consulting to help organizations develop and execute their content strategies.",
    preProductionPlanning: "Pre-production Planning",
    professionalFilming: "Professional Filming",
    postProductionEditing: "Post-production Editing",
    distributionSupport: "Distribution Support",
    liveTVBroadcasting: "Live TV Broadcasting",
    vodPlatformManagement: "VOD Platform Management",
    multiPlatformDistribution: "Multi-platform Distribution",
    audienceAnalytics: "Audience Analytics",
    mediaPlanning: "Media Planning",
    creativeDevelopment: "Creative Development",
    campaignManagement: "Campaign Management",
    performanceTracking: "Performance Tracking",
    strategyDevelopment: "Strategy Development",
    marketAnalysis: "Market Analysis",
    brandPositioning: "Brand Positioning",
    growthPlanning: "Growth Planning",

    // Nasiye
    downloadForIOS: "Download for iOS",
    getOnAndroid: "Get on Android",
    downloads: "Downloads",
    appRating: "App Rating",
    hoursContent: "Hours Content",
    liveStreaming: "Live Streaming",
    platformFeatures: "Platform Features",
    platformFeaturesSubtitle:
      "Discover what makes Nasiye the premier mobile entertainment platform in the region.",
    contentCategories: "Content Categories",
    contentCategoriesSubtitle:
      "Explore our diverse content library spanning news, entertainment, culture, and more.",
    userReviews: "User Reviews",
    readyToStartStreaming: "Ready to Start Streaming?",
    finalCtaSubtitle:
      "Join over 1 million users who trust Nasiye for their daily entertainment needs.",
    downloadNow: "Download Now",
    learnMore: "Learn More",

    // Packages / channels
    Diini: "Diini",
    Social: "Social",
    Sports: "Sports",



    "contact.title": "Contact Us",
    "contact.subtitle": "We’re here to help. Reach out to our team and we’ll get back to you promptly.",

    // Form
    "contact.form.title": "Send us a message",
    "contact.form.subtitle": "Tell us how we can help and our team will respond shortly.",
    "contact.form.fullName": "Full Name",
    "contact.form.fullNamePlaceholder": "Enter your full name",
    "contact.form.email": "Email Address",
    "contact.form.emailPlaceholder": "you@example.com",
    "contact.form.phone": "Phone Number",
    "contact.form.phonePlaceholder": "+252 61 000 0000",
    "contact.form.company": "Company",
    "contact.form.companyPlaceholder": "Your company (optional)",
    "contact.form.department": "Department",
    "contact.form.selectDepartment": "Select a department",
    "contact.form.subject": "Subject",
    "contact.form.subjectPlaceholder": "What is this about?",
    "contact.form.message": "Message",
    "contact.form.messagePlaceholder": "Write your message here…",
    "contact.form.send": "Send Message",
    "contact.form.options.generalInquiry": "General Inquiry",
    "contact.form.options.careers": "Careers",
    "contact.form.options.partnerships": "Partnerships",

    // Info block
    "contact.info.title": "Get in touch",
    "contact.info.generalInquiries": "General Inquiries",
    "contact.info.mainOffice": "Main Office",
    "contact.info.headquarters": "Headquarters",
    "contact.info.businessHours": "Business Hours",

    // Social
    "contact.social.title": "Follow us",
    "contact.social.facebook": "Facebook",
    "contact.social.twitter": "Twitter",
    "contact.social.instagram": "Instagram",
    "contact.social.linkedin": "LinkedIn",
    "contact.social.youtube": "YouTube",
    "contact.social.tiktok": "TikTok",

    // Offices section
    "contact.offices.title": "Global Offices",
    "contact.offices.subtitle": "Find us in key cities across the region.",
    "contact.offices.departments": "Departments",

    // Office cities/countries
    "contact.offices.mogadishu.city": "Mogadishu",
    "contact.offices.mogadishu.country": "Somalia",
    "contact.offices.hargeisa.city": "Hargeisa",
    "contact.offices.hargeisa.country": "Somaliland",
    "contact.offices.nairobi.city": "Nairobi",
    "contact.offices.nairobi.country": "Kenya",
    "contact.offices.dubai.city": "Dubai",
    "contact.offices.dubai.country": "UAE",

    // Hours
    "contact.hours.sundayThursday": "Sunday–Thursday, 8:00–17:00",
    "contact.hours.mondayFriday": "Monday–Friday, 9:00–18:00",

    // Brand/department labels
    "contact.brands.asalTv": "Asal TV",
    "contact.brands.jiilMedia": "Jiil Media",
    "contact.brands.masrax": "Masrax Production",
    "contact.brands.nasiye": "Nasiye Platform",
    "contact.departments.administration": "Administration",
    "contact.departments.newsBureau": "News Bureau",
    "contact.departments.regionalOps": "Regional Operations",
    "contact.departments.technology": "Technology",

    // CTA
    "contact.cta.title": "Need help right away?",
    "contact.cta.subtitle": "Our support team is available during business hours to assist you.",
    "contact.cta.callNow": "Call Now",
    "contact.cta.liveChat": "Live Chat",

    "culturalIntegrity": "Cultural Integrity",
    "culturalIntegrityDesc": "We honour and preserve Somali values, language, and identity in everything we create.",

    "excellence": "Excellence",
    "excellenceDesc": "We strive to deliver the highest quality in storytelling, journalism, and production.",

    "inclusivity": "Inclusivity",
    "inclusivityDesc": "We represent all voices—urban and rural, youth and elders, women and men, local and diaspora.",

    "empowerment": "Empowerment",
    "empowermentDesc": "We uplift Somali talent, ideas, and narratives that inspire pride and progress.",

    "transparencyTrust": "Transparency & Trust",
    "transparencyTrustDesc": "We build trust through accuracy, fairness, and honest storytelling.",

    "innovation": "Innovation",
    "innovationDesc": "We embrace technology and creativity to tell stories in fresh, engaging ways.",

    // Admin / News page
    newsPressTitle: "News & Press",
    newsPressSubtitle:
      "Latest updates, press releases, and stories from across our brands and platforms.",
    adminNewsNewsletterSubtitle:
      "Subscribe to our newsletter and never miss the latest Islamic Somali news from Asal Media Group",

    // Portfolio
    portfolioTitle: "Our Portfolio",
    portfolioSubtitle:
      "Showcasing our finest work across all media platforms — documentaries, live productions, digital content and more.",
    totalViews: "Total Views",
    portfolioProjectsCompleted: "Projects Completed",
    portfolioAwardsWon: "Awards Won",
    happyClients: "Happy Clients",
    watch: "Watch",
    read: "Read",
    featuredVideo: "Featured video",
    noVideoAvailable: "No video available.",
    noTextAvailable: "No text available.",
    readyToCreate: "Ready to Create Something Amazing?",
    readyToCreateSubtitle:
      "Let's collaborate to bring your vision to life with our award-winning production team.",
    startYourProject: "Start Your Project",
    contactUs: "Contact Us",
    watchProjectVideo: "Watch project video",

    // About
    monthlyViewers: "Monthly Viewers",
    countries: "Countries",
    contentHours: "Hours of Content",
    aboutTitle: "About Asal Media Corporation",
    aboutSubtitle: "Connecting communities through powerful content.",
    ourStory: "Our Story",
    ourValues: "Our Values",
    readyToJoin: "Ready to Join Our Journey?",
    discoverOpportunities:
      "Discover opportunities to be part of the future of media in East Africa",
    storyParagraph1:
      "Asal Media Corporation is a leading media production and broadcasting company headquartered in Mogadishu, Somalia.",
    storyParagraph2:
      "Through our mission, Asal Media Corporation delivers multi-platform content and communication solutions tailored to the evolving needs of Somali audiences. Our diverse services span broadcasting, film production, event coverage, advertising, and digital media, ensuring a complete ecosystem of creative and communication excellence.",
    storyParagraph3:
      "through Asal TV and Nasiye IPTV, Masrax Productions, Jiil Media, Nasiye App and digital media, Asal Media operates an integrated portfolio of brands dedicated to informing, entertaining, and inspiring Somali communities both locally and globally.",
    culturalBridge: "Cultural Integrity",
    culturalBridgeDesc:
      "We honour and preserve Somali values, language, and identity in everything we create.",
    community: "Community",
    communityDesc:
      "Building strong relationships with our audiences and fostering meaningful connections.",
    valuesSubtitle:
      "The principles that guide everything we do at Asal Media Group",
    missionTitle: "Mission",
    missionP1:
      "To create authentic Somali content, empower local talent, promote unity, and connect the global Somali audience through inclusive media and sustainable partnerships.",
    missionP2:
      "We strive to be a bridge between cultures, empower voices, and deliver high-quality content that educates, entertains, and uplifts. Our mission is rooted in integrity, creativity, and a commitment to positive social impact.",
    missionCardCulturalExchangeTitle: "Cultural Exchange",
    missionCardCulturalExchangeDesc:
      "Building understanding and unity by sharing diverse stories from across the globe.",
    missionCardInnovationTitle: "Innovation",
    missionCardInnovationDesc:
      "Leveraging technology and creativity to deliver fresh, impactful media experiences.",
    missionCardCommunityTitle: "Community Empowerment",
    missionCardCommunityDesc:
      "Supporting and amplifying local voices to foster growth and positive change.",
    leadershipTitle: "Leadership",
    leadershipSubtitle:
      "Meet the passionate team driving Asal Media Group forward.",
    leader1Name: "Amina Ali",
    leader1Role: "Chief Executive Officer",
    leader1Bio: "Visionary leader with 15+ years in media and communications.",
    leader2Name: "Mohamed Hassan",
    leader2Role: "Chief Operating Officer",
    leader2Bio:
      "Expert in operations, digital strategy, and organizational growth.",
    leader3Name: "Fatima Yusuf",
    leader3Role: "Head of Production",
    leader3Bio: "Award-winning producer and creative storyteller.",
    awardsTitle: "Awards & Recognition",
    awardsSubtitle: "Celebrating our achievements and industry recognition.",
    awardItem1Title: "Best Media Innovation",
    awardItem1Org: "Africa Media Awards",
    awardItem1Year: "2024",
    awardItem2Title: "Outstanding Content Production",
    awardItem2Org: "Global TV Summit",
    awardItem2Year: "2023",
    awardItem3Title: "Community Impact Award",
    awardItem3Org: "Somali Media Forum",
    awardItem3Year: "2022",
    awardItem4Title: "Excellence in Digital Storytelling",
    awardItem4Org: "East Africa Creatives",
    awardItem4Year: "2021",
    awardItem5Title: "Best Regional TV Channel",
    awardItem5Org: "Media Excellence Awards",
    awardItem5Year: "2020",
    awardItem6Title: "Rising Star in Broadcasting",
    awardItem6Org: "African Broadcast Awards",
    awardItem6Year: "2019",
    careers: "Careers",
    liveBroadcasting: "Live Broadcasting",
    expertTeam: "Expert Team",
    watchLive: "Watch Live",
    twentyFourSevenProgramming: "24/7 Programming",
    awardWinningContent: "Award-Winning Content",

    // Footer
    footerCompanyTagline:
      "Connecting brands, creating stories. Your premier destination for quality media content across TV, digital platforms, and production services.",
    footerQuickLinks: "Quick Links",
    footerOurBrands: "Our Brands",
    footerDownloadNasiyeTitle: "Download Nasiye",
    footerDownloadNasiyeDesc:
      "Get the Nasiye app and enjoy premium content on the go.",
    appStore: "App Store",
    googlePlay: "Google Play",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    copyrightPrefix: "Copyright ©",
    allRightsReserved: "All Rights Reserved",

    // AsalTV
    // watchLive: "Watch Live",
    viewSchedule: "View Schedule",
    broadcasting: "Broadcasting",
    awardsWon: "Awards Won",
    dailyViewers: "Daily Viewers",
    // twentyFourSevenProgramming: "24/7 Programming",
    // liveBroadcasting: "Live Broadcasting",
    // awardWinningContent: "Award-Winning Content",
    // expertTeam: "Expert Team",
    featured: "Featured",
    programs: "Programs",
    watchNow: "Watch Now",
    experiencePremiumOn: "Experience Premium Content on",
    nasiyeCtaSubtitle:
      "Watch Asal TV content anytime, anywhere with the Nasiye mobile platform. Get exclusive access to our shows and live broadcasts.",
    downloadNasiyeApp: "Download Nasiye App",

    // Jiil
    watchContent: "Watch Content",
    followUs: "Follow Us",
    socialFollowers: "Social Followers",
    contentSeries: "Content Series",
    targetAge: "Target Age",
    mobileFirstContent: "Mobile-First Content",
    viralCampaigns: "Viral Campaigns",
    communityDriven: "Community Driven",
    multiPlatform: "Multi-Platform",
    popular: "Popular",
    content: "Content",
    getJiilOn: "Get Jiil Media Content on",
    jiilCtaSubtitle:
      "Access exclusive Jiil Media content and stay connected with the latest trends through the Nasiye platform.",

    // Masrax
    startProject: "Start Project",
    filmProduction: "Film Production",
    tvContent: "TV Content",
    awardWinning: "Award-Winning",
    projects: "Projects",
    viewProject: "View Project",
    watchMasraxOn: "Watch Masrax Productions on",
    masraxCtaSubtitle:
      "Experience our award-winning productions anytime, anywhere with the Nasiye streaming platform.",
    projectsCompleted: "Projects Completed",
    yearsExperience: "Years Experience",
    newsletterSubtitle:
      "Subscribe to our newsletter and never miss the latest Islamic Somali news from Asal Media Group",


    "careers.title": "Careers",
    "careers.heroSubtitle": "Join our mission to shape the future of media in East Africa and connect cultures worldwide",
    "careers.cta.viewOpenPositions": "View Open Positions",

    "careers.stats.teamMembers": "Team Members",
    "careers.stats.countries": "Countries",
    "careers.stats.employeeSatisfaction": "Employee Satisfaction",
    "careers.stats.officeLocations": "Office Locations",

    "careers.whyJoin.title": "Why Join Asal Media Group?",
    "careers.whyJoin.subtitle": "Be part of a dynamic team that's revolutionizing media across East Africa",

    "careers.benefits.health.title": "Health & Wellness",
    "careers.benefits.health.desc": "Comprehensive health insurance and wellness programs for you and your family",
    "careers.benefits.learning.title": "Learning & Development",
    "careers.benefits.learning.desc": "Continuous learning opportunities, training programs, and conference attendance",
    "careers.benefits.global.title": "Global Opportunities",
    "careers.benefits.global.desc": "Work across multiple countries and collaborate with international teams",
    "careers.benefits.balance.title": "Work-Life Balance",
    "careers.benefits.balance.desc": "Flexible working hours and remote work options to maintain healthy balance",
    "careers.benefits.transport.title": "Transportation",
    "careers.benefits.transport.desc": "Transportation allowance and parking facilities at all office locations",
    "careers.benefits.tech.title": "Technology",
    "careers.benefits.tech.desc": "Latest equipment, high-speed internet, and cutting-edge production tools",

    "careers.openPositions.title": "Open Positions",
    "careers.openPositions.subtitle": "Find your perfect role across our departments",
    "careers.openPositions.count": "40 open positions",

    "careers.departments.production": "Production",
    "careers.departments.technical": "Technical",
    "careers.departments.editorial": "Editorial",
    "careers.departments.marketing": "Marketing",
    "careers.departments.jiilMedia": "Jiil Media",
    "careers.departments.asalTV": "Asal TV",
    "careers.departments.nasiyePlatform": "Nasiye Platform",

    "careers.types.fullTime": "Full-time",

    "careers.experience.5plus": "5+ years",
    "careers.experience.3plus": "3+ years",
    "careers.experience.2plus": "2+ years",
    "careers.experience.2to4": "2–4 years",

    "careers.locations.mogadishu": "Mogadishu, Somalia",
    "careers.locations.remote": "Remote",
    "careers.locations.hargeisa": "Hargeisa, Somaliland",
    "careers.locations.nairobi": "Nairobi, Kenya",
    "careers.locations.dubai": "Dubai, UAE",
    "careers.locations.london": "London, UK",

    "careers.jobs.applyNow": "Apply Now",
    "careers.jobs.postedOn": "Posted {date}",
    "careers.jobs.keyRequirements": "Key Requirements:",

    "careers.jobs.seniorVideoProducer.title": "Senior Video Producer",
    "careers.jobs.seniorVideoProducer.desc":
      "Lead video production projects from concept to completion, managing crews and ensuring high-quality content delivery.",
    "careers.jobs.seniorVideoProducer.req.1": "5+ years video production experience",
    "careers.jobs.seniorVideoProducer.req.2": "Leadership skills",
    "careers.jobs.seniorVideoProducer.req.3": "Technical expertise",
    "careers.jobs.seniorVideoProducer.req.4": "Creative vision",

    "careers.jobs.digitalContentCreator.title": "Digital Content Creator",
    "careers.jobs.digitalContentCreator.desc":
      "Create engaging digital content for social media platforms, focusing on youth-oriented programming and viral content.",
    "careers.jobs.digitalContentCreator.req.1": "Social media expertise",
    "careers.jobs.digitalContentCreator.req.2": "Content creation skills",
    "careers.jobs.digitalContentCreator.req.3": "Video editing",
    "careers.jobs.digitalContentCreator.req.4": "Trend awareness",

    "careers.jobs.broadcastEngineer.title": "Broadcast Engineer",
    "careers.jobs.broadcastEngineer.desc":
      "Maintain and operate broadcasting equipment, ensure signal quality, and support live television production.",
    "careers.jobs.broadcastEngineer.req.1": "Broadcasting technology knowledge",
    "careers.jobs.broadcastEngineer.req.2": "Technical troubleshooting",
    "careers.jobs.broadcastEngineer.req.3": "Equipment maintenance",
    "careers.jobs.broadcastEngineer.req.4": "Live TV experience",

    "careers.jobs.newsReporter.title": "News Reporter",
    "careers.jobs.newsReporter.desc":
      "Research, investigate, and report on current events affecting East African communities and diaspora populations.",
    "careers.jobs.newsReporter.req.1": "Journalism degree",
    "careers.jobs.newsReporter.req.2": "Field reporting experience",
    "careers.jobs.newsReporter.req.3": "Language skills",
    "careers.jobs.newsReporter.req.4": "Cultural awareness",

    "careers.jobs.softwareDeveloper.title": "Software Developer",
    "careers.jobs.softwareDeveloper.desc":
      "Develop and maintain streaming platform features, focusing on user experience and scalable architecture.",
    "careers.jobs.softwareDeveloper.req.1": "Full-stack development",
    "careers.jobs.softwareDeveloper.req.2": "Streaming technology",
    "careers.jobs.softwareDeveloper.req.3": "Mobile development",
    "careers.jobs.softwareDeveloper.req.4": "Cloud platforms",

    "careers.jobs.marketingSpecialist.title": "Marketing Specialist",
    "careers.jobs.marketingSpecialist.desc":
      "Develop and execute marketing campaigns for global audiences, focusing on diaspora community engagement.",
    "careers.jobs.marketingSpecialist.req.1": "Digital marketing",
    "careers.jobs.marketingSpecialist.req.2": "Campaign management",
    "careers.jobs.marketingSpecialist.req.3": "Analytics",
    "careers.jobs.marketingSpecialist.req.4": "Cross-cultural communication",

    "careers.cta.impactTitle": "Ready to Make an Impact?",
    "careers.cta.impactSubtitle":
      "Don't see the perfect role? Send us your resume and let us know how you'd like to contribute",
    "careers.cta.submitResume": "Submit Resume",
    "careers.cta.contactHR": "Contact HR",

    "nasiye.hero.title": "Nasiye App",
    "nasiye.hero.subtitle":
      "Your trusted Islamic knowledge and lifestyle companion. Access authentic content, daily reminders, and a vibrant community — all in one app.",
    "nasiye.hero.buttons.appStore": "App Store",
    "nasiye.hero.buttons.playStore": "Play Store",

    "nasiye.features.title": "Features",
    "nasiye.features.dailyReminders.title": "Daily Reminders",
    "nasiye.features.dailyReminders.desc":
      "Get personalized Islamic reminders and motivational quotes every day.",
    "nasiye.features.curatedContent.title": "Curated Content",
    "nasiye.features.curatedContent.desc":
      "Access articles, videos, and podcasts from trusted scholars and creators.",
    "nasiye.features.community.title": "Community",
    "nasiye.features.community.desc":
      "Join discussions, ask questions, and connect with a supportive community.",

    "nasiye.categories.title": "Categories",
    "nasiye.categories.quranTafsir.title": "Qur’an & Tafsir",
    "nasiye.categories.quranTafsir.desc":
      "Read, listen, and learn with authentic resources.",
    "nasiye.categories.lecturesPodcasts.title": "Lectures & Podcasts",
    "nasiye.categories.lecturesPodcasts.desc":
      "Watch and listen to inspiring talks and series.",
    "nasiye.categories.familyYouth.title": "Family & Youth",
    "nasiye.categories.familyYouth.desc":
      "Guidance for all ages, from parenting to youth issues.",
    "nasiye.categories.downloads.title": "Downloads",
    "nasiye.categories.downloads.desc":
      "Save your favorite content for offline access.",
    visionTitle: "Vision",
    visionP1: "To be the most trusted and influential Somali media platform, connecting local and diaspora communities through inspiring, authentic, and culturally rich content."

    // Nasiye
    // downloadForIOS: "Download for iOS",
    // getOnAndroid: "Get on Android",
    // downloads: "Downloads",
    // appRating: "App Rating",
    // hoursContent: "Hours Content",
    // liveStreaming: "Live Streaming",
    // platformFeatures: "Platform Features",
    // platformFeaturesSubtitle:
    //   "Discover what makes Nasiye the premier mobile entertainment platform in the region.",
    // contentCategories: "Content Categories",
    // contentCategoriesSubtitle:
    //   "Explore our diverse content library spanning news, entertainment, culture, and more.",
    // userReviews: "User Reviews",
    // readyToStartStreaming: "Ready to Start Streaming?",
    // finalCtaSubtitle:
    //   "Join over 1 million users who trust Nasiye for their daily entertainment needs.",
    // downloadNow: "Download Now",
    // learnMore: "Learn More",

  },

  ar: {
    // Common / controls
    all: "الكل",
    prev: "السابق",
    next: "التالي",
    goToSlide: "الذهاب إلى الشريحة",
    pageOf: "صفحة {page} من {total}",
    featuredStory: "القصة المميزة",
    latestStories: "أحدث القصص",
    watchLive: "شاهد البث المباشر",
    readMore: "اقرأ المزيد",
    readMoreArrow: "اقرأ المزيد →",
    readFullStory: "اقرأ القصة كاملة",
    stayUpdated: "ابقَ على اطلاع",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    subscribe: "اشترك",
    close: "إغلاق",
    untitled: "بدون عنوان",
    newsDesk: "قسم الأخبار",
    twentyFourSevenProgramming: "برمجة على مدار 24/7",
    testimonialsTile: "ماذا يقول شركاؤنا",
    testimonialsSubtitle: "استمع إلى آراء شركائنا حول تجربتهم في العمل معنا.",

    "culturalIntegrity": "النزاهة الثقافية",
    "culturalIntegrityDesc": "نُكرّم ونحافظ على القيم واللغة والهوية الصومالية في كل ما نُبدعه.",

    "excellence": "التميّز",
    "excellenceDesc": "نسعى لتقديم أعلى مستويات الجودة في السرد، والصحافة، والإنتاج.",

    "inclusivity": "الشمولية",
    "inclusivityDesc": "نمثل جميع الأصوات — في المدن والأرياف، الشباب وكبار السن، النساء والرجال، في الداخل والمهجر.",

    "empowerment": "التمكين",
    "empowermentDesc": "ننهض بالمواهب والأفكار والحكايات الصومالية التي تُلهم الفخر والتقدّم.",

    "transparencyTrust": "الشفافية والثقة",
    "transparencyTrustDesc": "نبني الثقة عبر الدقّة والإنصاف والسرد الصادق.",

    "innovation": "الابتكار",
    "innovationDesc": "نحتضن التكنولوجيا والإبداع لرواية القصص بطرق جديدة وجاذبة.",


    // Hero
    "contact.title": "تواصل معنا",
    "contact.subtitle": "نحن هنا لخدمتك. تواصل مع فريقنا وسنرد عليك قريبًا.",

    // Form
    "contact.form.title": "أرسل لنا رسالة",
    "contact.form.subtitle": "أخبرنا كيف يمكننا المساعدة وسيتواصل معك فريقنا قريبًا.",
    "contact.form.fullName": "الاسم الكامل",
    "contact.form.fullNamePlaceholder": "أدخل اسمك الكامل",
    "contact.form.email": "البريد الإلكتروني",
    "contact.form.emailPlaceholder": "you@example.com",
    "contact.form.phone": "رقم الهاتف",
    "contact.form.phonePlaceholder": "+252 61 000 0000",
    "contact.form.company": "الشركة",
    "contact.form.companyPlaceholder": "اسم شركتك (اختياري)",
    "contact.form.department": "القسم",
    "contact.form.selectDepartment": "اختر قسمًا",
    "contact.form.subject": "الموضوع",
    "contact.form.subjectPlaceholder": "ما موضوع الرسالة؟",
    "contact.form.message": "نص الرسالة",
    "contact.form.messagePlaceholder": "اكتب رسالتك هنا…",
    "contact.form.send": "إرسال الرسالة",
    "contact.form.options.generalInquiry": "استفسار عام",
    "contact.form.options.careers": "التوظيف",
    "contact.form.options.partnerships": "الشراكات",

    // Info block
    "contact.info.title": "تواصل",
    "contact.info.generalInquiries": "استفسارات عامة",
    "contact.info.mainOffice": "المكتب الرئيسي",
    "contact.info.headquarters": "المقر",
    "contact.info.businessHours": "ساعات العمل",

    // Social
    "contact.social.title": "تابعنا",
    "contact.social.facebook": "فيسبوك",
    "contact.social.twitter": "تويتر",
    "contact.social.instagram": "إنستغرام",
    "contact.social.linkedin": "لينكدإن",
    "contact.social.youtube": "يوتيوب",
    "contact.social.tiktok": "تيك توك",

    // Offices section
    "contact.offices.title": "مكاتبنا العالمية",
    "contact.offices.subtitle": "تجدنا في مدن رئيسية عبر المنطقة.",
    "contact.offices.departments": "الأقسام",

    // Office cities/countries
    "contact.offices.mogadishu.city": "مقديشو",
    "contact.offices.mogadishu.country": "الصومال",
    "contact.offices.hargeisa.city": "هرجيسا",
    "contact.offices.hargeisa.country": "أرض الصومال",
    "contact.offices.nairobi.city": "نيروبي",
    "contact.offices.nairobi.country": "كينيا",
    "contact.offices.dubai.city": "دبي",
    "contact.offices.dubai.country": "الإمارات",

    // Hours
    "contact.hours.sundayThursday": "الأحد–الخميس، 8:00–17:00",
    "contact.hours.mondayFriday": "الاثنين–الجمعة، 9:00–18:00",

    // Brand/department labels
    "contact.brands.asalTv": "أسال تي في",
    "contact.brands.jiilMedia": "جيل ميديا",
    "contact.brands.masrax": "مصنع ماسراكس",
    "contact.brands.nasiye": "منصة نَسِيِّ",
    "contact.departments.administration": "الإدارة",
    "contact.departments.newsBureau": "مكتب الأخبار",
    "contact.departments.regionalOps": "العمليات الإقليمية",
    "contact.departments.technology": "التقنية",

    // CTA
    "contact.cta.title": "تحتاج مساعدة فورية؟",
    "contact.cta.subtitle": "فريق الدعم متاح خلال ساعات العمل لمساعدتك.",
    "contact.cta.callNow": "اتصل الآن",
    "contact.cta.liveChat": "دردشة مباشرة",

    "careers.title": "الوظائف",
    "careers.heroSubtitle": "انضم إلى مهمتنا لصناعة مستقبل الإعلام في شرق إفريقيا وربط الثقافات حول العالم",
    "careers.cta.viewOpenPositions": "عرض الوظائف الشاغرة",

    "careers.stats.teamMembers": "أعضاء الفريق",
    "careers.stats.countries": "دول",
    "careers.stats.employeeSatisfaction": "رضا الموظفين",
    "careers.stats.officeLocations": "مكاتب",

    "careers.whyJoin.title": "لماذا تنضم إلى أسال ميديا جروب؟",
    "careers.whyJoin.subtitle": "كن جزءًا من فريق ديناميكي يُحدث ثورة في الإعلام عبر شرق إفريقيا",

    "careers.benefits.health.title": "الصحة والرفاه",
    "careers.benefits.health.desc": "تأمين صحي شامل وبرامج رفاه لك ولعائلتك",
    "careers.benefits.learning.title": "التعلم والتطوير",
    "careers.benefits.learning.desc": "فرص تعلم مستمرة وبرامج تدريبية وحضور المؤتمرات",
    "careers.benefits.global.title": "فرص عالمية",
    "careers.benefits.global.desc": "العمل عبر دول متعددة والتعاون مع فرق دولية",
    "careers.benefits.balance.title": "توازن العمل والحياة",
    "careers.benefits.balance.desc": "ساعات عمل مرنة وخيارات العمل عن بُعد للحفاظ على التوازن",
    "careers.benefits.transport.title": "المواصلات",
    "careers.benefits.transport.desc": "بدل مواصلات ومواقف سيارات في جميع المكاتب",
    "careers.benefits.tech.title": "التقنية",
    "careers.benefits.tech.desc": "أحدث المعدات وإنترنت سريع وأدوات إنتاج متقدمة",

    "careers.openPositions.title": "الوظائف الشاغرة",
    "careers.openPositions.subtitle": "اعثر على دورك المثالي عبر أقسامنا",
    "careers.openPositions.count": "40 وظائف شاغرة",

    "careers.departments.production": "الإنتاج",
    "careers.departments.technical": "التقنية",
    "careers.departments.editorial": "التحرير",
    "careers.departments.marketing": "التسويق",
    "careers.departments.jiilMedia": "جيل ميديا",
    "careers.departments.asalTV": "أسال تي في",
    "careers.departments.nasiyePlatform": "منصة نسيي",

    "careers.types.fullTime": "دوام كامل",

    "careers.experience.5plus": "5+ سنوات",
    "careers.experience.3plus": "3+ سنوات",
    "careers.experience.2plus": "2+ سنوات",
    "careers.experience.2to4": "2–4 سنوات",

    "careers.locations.mogadishu": "مقديشو، الصومال",
    "careers.locations.remote": "عن بُعد",
    "careers.locations.hargeisa": "هرجيسا، أرض الصومال",
    "careers.locations.nairobi": "نيروبي، كينيا",
    "careers.locations.dubai": "دبي، الإمارات",
    "careers.locations.london": "لندن، المملكة المتحدة",

    "careers.jobs.applyNow": "قدّم الآن",
    "careers.jobs.postedOn": "نُشِر في {date}",
    "careers.jobs.keyRequirements": "المتطلبات الرئيسية:",

    "careers.jobs.seniorVideoProducer.title": "منتج فيديو أول",
    "careers.jobs.seniorVideoProducer.desc":
      "قيادة مشاريع إنتاج الفيديو من الفكرة إلى التسليم، وإدارة الفرق وضمان جودة المحتوى.",
    "careers.jobs.seniorVideoProducer.req.1": "خبرة 5+ سنوات في إنتاج الفيديو",
    "careers.jobs.seniorVideoProducer.req.2": "مهارات قيادية",
    "careers.jobs.seniorVideoProducer.req.3": "خبرة تقنية",
    "careers.jobs.seniorVideoProducer.req.4": "رؤية إبداعية",

    "careers.jobs.digitalContentCreator.title": "منشئ محتوى رقمي",
    "careers.jobs.digitalContentCreator.desc":
      "ابتكار محتوى جذاب لمنصات التواصل الاجتماعي مع التركيز على الشباب والمحتوى الرائج.",
    "careers.jobs.digitalContentCreator.req.1": "خبرة في وسائل التواصل",
    "careers.jobs.digitalContentCreator.req.2": "مهارات إنشاء المحتوى",
    "careers.jobs.digitalContentCreator.req.3": "تحرير الفيديو",
    "careers.jobs.digitalContentCreator.req.4": "متابعة الترندات",

    "careers.jobs.broadcastEngineer.title": "مهندس بث",
    "careers.jobs.broadcastEngineer.desc":
      "تشغيل وصيانة أجهزة البث، وضمان جودة الإشارة، ودعم الإنتاج التلفزيوني المباشر.",
    "careers.jobs.broadcastEngineer.req.1": "معرفة بتقنيات البث",
    "careers.jobs.broadcastEngineer.req.2": "استكشاف الأخطاء التقنية",
    "careers.jobs.broadcastEngineer.req.3": "صيانة المعدات",
    "careers.jobs.broadcastEngineer.req.4": "خبرة في البث المباشر",

    "careers.jobs.newsReporter.title": "مراسل أخبار",
    "careers.jobs.newsReporter.desc":
      "بحث وتحقيق وتغطية الأحداث الجارية التي تمس مجتمعات شرق إفريقيا والشتات.",
    "careers.jobs.newsReporter.req.1": "شهادة في الصحافة",
    "careers.jobs.newsReporter.req.2": "خبرة ميدانية",
    "careers.jobs.newsReporter.req.3": "مهارات لغوية",
    "careers.jobs.newsReporter.req.4": "وعي ثقافي",

    "careers.jobs.softwareDeveloper.title": "مطوّر برمجيات",
    "careers.jobs.softwareDeveloper.desc":
      "تطوير ميزات منصة البث وصيانتها مع التركيز على تجربة المستخدم والقدرة على التوسع.",
    "careers.jobs.softwareDeveloper.req.1": "تطوير الواجهة والخلفية",
    "careers.jobs.softwareDeveloper.req.2": "تقنيات البث",
    "careers.jobs.softwareDeveloper.req.3": "تطوير الموبايل",
    "careers.jobs.softwareDeveloper.req.4": "منصات السحابة",

    "careers.jobs.marketingSpecialist.title": "أخصائي تسويق",
    "careers.jobs.marketingSpecialist.desc":
      "بناء وتنفيذ حملات تسويقية للجمهور العالمي مع التركيز على تفاعل الجاليات.",
    "careers.jobs.marketingSpecialist.req.1": "التسويق الرقمي",
    "careers.jobs.marketingSpecialist.req.2": "إدارة الحملات",
    "careers.jobs.marketingSpecialist.req.3": "التحليلات",
    "careers.jobs.marketingSpecialist.req.4": "التواصل عبر الثقافات",

    "careers.cta.impactTitle": "جاهز لترك بصمة؟",
    "careers.cta.impactSubtitle":
      "لم تجد الدور المثالي؟ أرسل سيرتك الذاتية وأخبرنا كيف تود أن تُسهم.",
    "careers.cta.submitResume": "أرسل السيرة الذاتية",
    "careers.cta.contactHR": "تواصل مع الموارد البشرية",

    "nasiye.hero.title": "تطبيق نَسِيِّ",
    "nasiye.hero.subtitle":
      "رفيقك الموثوق للمعرفة والحياة الإسلامية. محتوى موثوق، تذكيرات يومية، ومجتمع نابض — في تطبيق واحد.",
    "nasiye.hero.buttons.appStore": "متجر App Store",
    "nasiye.hero.buttons.playStore": "متجر Play",

    "nasiye.features.title": "المميزات",
    "nasiye.features.dailyReminders.title": "تذكيرات يومية",
    "nasiye.features.dailyReminders.desc":
      "احصل على تذكيرات إسلامية مخصصة واقتباسات تحفيزية كل يوم.",
    "nasiye.features.curatedContent.title": "محتوى مُنتقى",
    "nasiye.features.curatedContent.desc":
      "مقالات وفيديوهات وبودكاست من علماء وصنّاع موثوقين.",
    "nasiye.features.community.title": "المجتمع",
    "nasiye.features.community.desc":
      "انضم للنقاشات، اطرح أسئلتك، وتواصل مع مجتمع داعم.",

    "nasiye.categories.title": "التصنيفات",
    "nasiye.categories.quranTafsir.title": "القرآن والتفسير",
    "nasiye.categories.quranTafsir.desc":
      "اقرأ واستمع وتعلّم من مصادر موثوقة.",
    "nasiye.categories.lecturesPodcasts.title": "محاضرات وبودكاست",
    "nasiye.categories.lecturesPodcasts.desc":
      "شاهد واستمع إلى سلاسل وحديثات ملهمة.",
    "nasiye.categories.familyYouth.title": "الأسرة والشباب",
    "nasiye.categories.familyYouth.desc":
      "إرشاد لكل المراحل من التربية إلى قضايا الشباب.",
    "nasiye.categories.downloads.title": "التحميلات",
    "nasiye.categories.downloads.desc":
      "احفظ محتواك المفضل للوصول دون إنترنت.",


    // Hero
    "faq.hero.title": "الأسئلة الشائعة",
    "faq.hero.subtitle": "إجابات سريعة حول خدمات أسال تي في والدعم والإعلانات.",
    "faq.hero.searchPlaceholder": "ابحث في الأسئلة…",
    "faq.hero.totalCount": "{count} سؤالًا بالمجموع",

    // Groups
    "faq.groups.general.title": "عام",
    "faq.groups.services.title": "الخدمات",
    "faq.groups.corporate.title": "الخدمات المؤسسية",
    "faq.groups.tech.title": "الدعم الفني",
    "faq.groups.advertising.title": "الإعلانات",

    // Q&A — General
    "faq.q.general.whatIs.title": "ما هي أسال تي في؟",
    "faq.q.general.whatIs.body":
      "أسال تي في هي شركة رائدة في البث وإنتاج المحتوى الإعلامي مقرها مقديشو، الصومال. نقدم خدمات شاملة تشمل تلفزيون الكيبل، إنتاج فيديوهات للشركات، وخدمات IPTV عبر منصة نَسِيِّ وتطبيق الموبايل، إضافة إلى إنتاج الأفلام والمسلسلات عبر ماسراكس برودكشن.",
    "faq.q.general.location.title": "أين تقع أسال تي في؟",
    "faq.q.general.location.body": "يقع المقر الرئيسي لأسال تي في في مقديشو، الصومال — لامي-يرها زوبي.",

    // Q&A — Services
    "faq.q.services.whatProvide.title": "ما هي الخدمات التي تقدمها أسال تي في؟",
    "faq.q.services.whatProvide.body":
      "تقدم أسال تي في مجموعة من الخدمات تشمل:\n• خدمات تلفزيون الكيبل\n• إنتاج فيديوهات الشركات\n• تلفزيون بروتوكول الإنترنت (IPTV) عبر منصة نَسِيِّ\n• إنتاج الأفلام والمسلسلات عبر ماسراكس\n• باقات المناسبات\n• نشر الإعلانات\n• باقات إنتاج الفيديو",
    "faq.q.services.subscribeCable.title": "كيف أشترك في خدمة الكيبل لدى أسال تي في؟",
    "faq.q.services.subscribeCable.body": "اتصل على *424# أو بخدمة العملاء على 424 للاشتراك في خدمة الكيبل.",
    "faq.q.services.whatIsIptv.title": "ما هو IPTV وكيف يعمل؟",
    "faq.q.services.whatIsIptv.body":
      "يعرض IPTV (تلفزيون بروتوكول الإنترنت) المحتوى التلفزيوني عبر الإنترنت بدل الأقمار أو الكيبل التقليدي. تحتاج اتصال إنترنت ثابت وجهازًا متوافقًا للمشاهدة.",

    // Q&A — Corporate
    "faq.q.corporate.videoProd.title": "هل تقدّم أسال تي في إنتاج فيديوهات للشركات؟",
    "faq.q.corporate.videoProd.body":
      "نعم. ننتج فيديوهات احترافية للشركات للتسويق والمؤتمرات والفعاليات والحملات وغيرها — من الفكرة حتى التسليم النهائي.",

    // Q&A — Tech
    "faq.q.tech.supportContact.title": "مع من أتواصل للدعم الفني لخدمات أسال تي في؟",
    "faq.q.tech.supportContact.body": "للدعم الفني اتصل بخدمة العملاء على 424 أو واتساب +252 619 993 395.",
    "faq.q.tech.iptvNotWorking.title": "ماذا أفعل إذا لم تعمل خدمة IPTV لدي؟",
    "faq.q.tech.iptvNotWorking.body":
      "تحقق أولًا من اتصال الإنترنت وتوافق الجهاز. إن استمرت المشكلة، تواصل مع فريق الدعم الفني على 141.",

    // Q&A — Advertising
    "faq.q.advertising.options.title": "هل توجد فرص للإعلان لدى أسال تي في؟",
    "faq.q.advertising.options.body":
      "نعم، نوفر خيارات متعددة للإعلان. يُرجى التواصل مع قسم التسويق للحصول على قائمة الأسعار والباقات.",

    // UI labels
    "faq.openPill": "فتح",
    "faq.permalink": "الرابط الدائم",
    "faq.copyLink": "انسخ الرابط",
    "faq.noResults": "لا توجد نتائج. جرّب بحثًا آخر.",

    // Contact block
    "faq.contact.title": "لا تزال تحتاج مساعدة؟",
    "faq.contact.subtitle": "اتصل 424، أو واتساب +252 619 993 395، أو تواصل مع الدعم الفني على 141.",
    "faq.contact.callCta": "اتصل 424",
    "faq.contact.whatsappTitle": "الدردشة على واتساب",

    // --- Header nav (NEW) ---
    homeNav: "الرئيسية",
    aboutNav: "من نحن",
    servicesNav: "الخدمات",
    brandsNav: "العلامات التجارية",
    packagesNav: "الباقات",
    portfolioNav: "الأعمال",
    contactNav: "اتصل بنا",
    adminNav: "لوحة التحكم",
    moreNav: "المزيد...",
    faqsNav: "الأسئلة الشائعة",
    Nasiye: "ناسية",

    latest: "أحدث الأخبار",
    sub: "ابق على اطلاع على أحدث التطورات والإنجازات والبيانات الصحفية من مجموعة أسال الإعلامية وعلاماتنا التجارية.",
    viewAll: "عرض جميع الأخبار",
    category: "الأخبار",

    // --- HERO ---
    heroTitleConnecting: "ربط",
    heroTitleCultures: "الثقافات",
    heroTitleThrough: "من خلال",
    heroTitleMedia: "الإعلام",
    heroSubtitleMain:
      "تجمع مجموعة أسال الإعلامية أربع علامات قوية لتقديم محتوى استثنائي عبر التلفزيون والمنصات الرقمية وخدمات الإنتاج في جميع أنحاء المنطقة.",
    watchOurStory: "شاهد قصتنا",

    // --- Brand Highlights ---
    brandsSectionTitleOur: "علاماتنا",
    brandsSectionTitleMedia: "الإعلامية",
    brandsSectionTitleBrands: "كياگا",
    brandsSectionSubtitle:
      "أربع علامات مميزة، رؤية واحدة موحّدة. اكتشف كيف تخدم كل علامة جمهورًا مختلفًا مع الحفاظ على التزامنا بالمحتوى عالي الجودة.",
    brandAsalTVName: "أصل تي في",
    brandAsalTVDesc:
      "محتوى تلفزيوني متميز مع برامج حائزة على جوائز، وأخبار، وترفيه.",
    brandJiilMediaName: "جيل ميديا",
    brandJiilMediaDesc:
      "منصة إعلامية رقمية أولاً تستهدف الشباب بمحتوى وصيغ مبتكرة.",
    brandMasraxProductionName: "مسرح للإنتاج",
    brandMasraxProductionDesc:
      "بيت إنتاج متكامل يصنع قصصًا مؤثرة للسينما والتلفزيون والمنصات الرقمية.",
    brandNasiyePlatformName: "منصّة نسيّة",
    brandNasiyePlatformDesc:
      "منصة بث ثورية تجلب المحتوى المتميز مباشرة إلى هاتفك المحمول.",
    explorePlatform: "استكشف المنصة",
    nasiyeHighlightDesc:
      "اختبر مستقبل الترفيه المحمول مع «ناسية». منصتنا الرائدة تقدم محتوى حصريًا، وقنوات مباشرة، وبرامج عند الطلب مُحسّنة للمشاهدة عبر الهاتف.",

    // AsalTV / Common section terms
    News: "الأخبار",
    newsNewsletterSubtitle:
      "اشترك في النشرة البريدية ولا تفوّت آخر الأخبار من مجموعة أسال الإعلامية",

    // Services
    servicesPageTitle: "خدمات إنتاج الوسائط الاحترافية",
    servicesPageSubtitle:
      "من المفهوم إلى الإنجاز، نقدم محتوى استثنائيًا يجذب جمهورك ويرفع علامتك التجارية",
    contact: "اتصل بنا",
    getStarted: "ابدأ الآن",
    viewPortfolio: "عرض الأعمال",
    ourProcess: "عمليتنا",
    ourProcessSubtitle:
      "من المفهوم إلى الإنجاز، نتبع عملية مثبتة لتقديم نتائج استثنائية",
    readyToStart: "هل أنت مستعد لبدء مشروعك؟",
    readyToStartSubtitle:
      "دعنا نناقش كيف يمكننا تحقيق رؤيتك بخدماتنا الإعلامية الشاملة",
    noServicesFound: "لم يتم العثور على خدمات.",
    discover: "اكتشف",
    discoverDesc: "فهم احتياجاتك",
    design: "تصميم",
    designDesc: "بناء الاستراتيجية الصحيحة",
    create: "إنشاء",
    createDesc: "إنتاج محتوى عالي الجودة",
    approve: "الموافقة",
    approveDesc: "تحسين وإنهاء",
    publish: "نشر",
    publishDesc: "التوزيع عبر المنصات",
    support: "الدعم",
    supportDesc: "مراقبة الأداء",
    viewAllServices: "عرض جميع الخدمات",

    // ServicesOverview
    serviceContentProduction: "إنتاج المحتوى",
    serviceContentProductionDesc:
      "خدمات إنتاج شاملة للبرامج التلفزيونية والأفلام الوثائقية والإعلانات والمحتوى الرقمي.",
    serviceBroadcastingVOD: "البث والفيديو حسب الطلب",
    serviceBroadcastingVODDesc:
      "خدمات البث التلفزيوني والفيديو حسب الطلب عبر منصات وأجهزة متعددة.",
    serviceAdvertisingSolutions: "حلول الإعلانات",
    serviceAdvertisingSolutionsDesc:
      "استراتيجيات إعلانية وتسويقية لمساعدة العلامات على الوصول الفعّال إلى جمهورها المستهدف.",
    serviceConsultingServices: "الخدمات الاستشارية",
    serviceConsultingServicesDesc:
      "استشارات إعلامية احترافية لمساعدة المؤسسات على تطوير وتنفيذ استراتيجيات المحتوى.",
    preProductionPlanning: "تخطيط ما قبل الإنتاج",
    professionalFilming: "تصوير احترافي",
    postProductionEditing: "مونتاج وما بعد الإنتاج",
    distributionSupport: "دعم التوزيع",
    liveTVBroadcasting: "بث تلفزيوني مباشر",
    vodPlatformManagement: "إدارة منصات VOD",
    multiPlatformDistribution: "توزيع متعدد المنصات",
    audienceAnalytics: "تحليلات الجمهور",
    mediaPlanning: "تخطيط إعلامي",
    creativeDevelopment: "تطوير إبداعي",
    campaignManagement: "إدارة الحملات",
    performanceTracking: "تتبع الأداء",
    strategyDevelopment: "تطوير الاستراتيجيات",
    marketAnalysis: "تحليل السوق",
    brandPositioning: "تموضع العلامة",
    growthPlanning: "تخطيط النمو",

    // Nasiye
    downloadForIOS: "تحميل لنظام iOS",
    getOnAndroid: "احصل عليه على أندرويد",
    downloads: "عمليات التحميل",
    appRating: "تقييم التطبيق",
    hoursContent: "ساعات من المحتوى",
    liveStreaming: "بث مباشر",
    platformFeatures: "مزايا المنصة",
    platformFeaturesSubtitle:
      "اكتشف ما يجعل «ناسية» منصة الترفيه المحمولة الأولى في المنطقة.",
    contentCategories: "فئات المحتوى",
    contentCategoriesSubtitle:
      "استكشف مكتبتنا المتنوعة من الأخبار والترفيه والثقافة والمزيد.",
    userReviews: "آراء المستخدمين",
    readyToStartStreaming: "هل أنت مستعد للبدء في المشاهدة؟",
    finalCtaSubtitle:
      "انضم إلى أكثر من مليون مستخدم يثقون بناسية لتلبية احتياجاتهم الترفيهية اليومية.",
    downloadNow: "حمّل الآن",
    learnMore: "اعرف المزيد",

    // Packages / channels
    Diini: "ديني",
    Social: "اجتماعي",
    Sports: "رياضة",

    // Admin / News page
    newsPressTitle: "الأخبار والبيانات الصحفية",
    newsPressSubtitle:
      "آخر التحديثات والبيانات الصحفية والقصص عبر علاماتنا ومنصاتنا.",
    adminNewsNewsletterSubtitle:
      "اشترك في النشرة الإخبارية ولن تفوّت آخر الأخبار الإسلامية الصومالية من مجموعة أسال الإعلامية",

    // Portfolio
    portfolioTitle: "أعمالنا",
    portfolioSubtitle:
      "نعرض أفضل أعمالنا عبر جميع المنصات — أفلام وثائقية، بث مباشر، محتوى رقمي والمزيد.",
    totalViews: "إجمالي المشاهدات",
    portfolioProjectsCompleted: "مشاريع منجزة",
    portfolioAwardsWon: "جوائز محققة",
    happyClients: "عملاء سعداء",
    watch: "مشاهدة",
    read: "قراءة",
    featuredVideo: "فيديو مميز",
    noVideoAvailable: "لا يوجد فيديو متاح.",
    noTextAvailable: "لا يوجد نص متاح.",
    readyToCreate: "هل أنت مستعد لصنع شيء مذهل؟",
    readyToCreateSubtitle:
      "لنتعاون سويًا لتحقيق رؤيتك مع فريق إنتاجنا الحائز على جوائز.",
    startYourProject: "ابدأ مشروعك",
    contactUs: "اتصل بنا",
    watchProjectVideo: "مشاهدة فيديو المشروع",

    // About
    monthlyViewers: "مشاهدون شهريًا",
    countries: "دول",
    contentHours: "ساعات من المحتوى",
    aboutTitle: "حول شركة أصل للإعلام",
    aboutSubtitle: "ربط المجتمعات من خلال المحتوى القوي.",
    ourStory: "قصتنا",
    ourValues: "قيمنا",
    readyToJoin: "هل أنت مستعد للانضمام إلى رحلتنا؟",
    discoverOpportunities:
      "اكتشف الفرص لتكون جزءًا من مستقبل الإعلام في شرق إفريقيا",
    storyParagraph1:
      "شركة أصل للإعلام هي شركة رائدة في إنتاج وبث المحتوى الإعلامي، ومقرها الرئيسي في مقديشو، الصومال.",
    storyParagraph2:
      "من خلال مهمتنا، تقدم شركة أصل للإعلام محتوى متعدد المنصات وحلول اتصال مصممة خصيصًا للاحتياجات المتطورة للجماهير الصومالية. تمتد خدماتنا المتنوعة عبر البث، وإنتاج الأفلام، وتغطية الأحداث، والإعلان، والإعلام الرقمي، مما يضمن نظامًا بيئيًا كاملاً للإبداع والتميز في الاتصال.",
    storyParagraph3:
      "من خلال تلفزيون أصل وناسية IPTV، وإنتاجات مسرح، وإعلام جيل، وتطبيق ناسية والإعلام الرقمي، تعمل أصل للإعلام على محفظة متكاملة من العلامات التجارية المكرسة لإعلام وترفيه وإلهام المجتمعات الصومالية محليًا وعالميًا.",
    culturalBridge: "النزاهة الثقافية",
    culturalBridgeDesc:
      ".نحترم ونحافظ على القيم واللغة والهوية الصومالية في كل ما نقدّمه",

    community: "المجتمع",
    communityDesc:
      "بناء علاقات قوية مع جمهورنا وتعزيز الروابط الهادفة.",
    valuesSubtitle:
      "المبادئ التي توجه كل ما نقوم به في مجموعة أسال الإعلامية",
    missionTitle: "المهمة",
    missionP1:
      "إنشاء محتوى صومالي أصيل، وتمكين المواهب المحلية، وتعزيز الوحدة، وربط الجمهور الصومالي العالمي من خلال الإعلام الشامل والشراكات المستدامة.",
    missionP2:
      "نسعى لأن نكون جسرًا بين الثقافات، وتمكين الأصوات، وتقديم محتوى عالي الجودة يثقف ويُسلي ويرفع من شأن المجتمع. جذورنا في النزاهة والإبداع والأثر الاجتماعي الإيجابي.",
    missionCardCulturalExchangeTitle: "التبادل الثقافي",
    missionCardCulturalExchangeDesc:
      "بناء الفهم والوحدة عبر مشاركة قصص متنوعة من أنحاء العالم.",
    missionCardInnovationTitle: "الابتكار",
    missionCardInnovationDesc:
      "تسخير التقنية والإبداع لتقديم تجارب إعلامية متجددة وفعّالة.",
    missionCardCommunityTitle: "تمكين المجتمع",
    missionCardCommunityDesc:
      "دعم الأصوات المحلية وتضخيمها لتعزيز النمو والتغيير الإيجابي.",
    leadershipTitle: "القيادة",
    leadershipSubtitle:
      "تعرّف على الفريق الشغوف الذي يدفع مجموعة أسال الإعلامية قدمًا.",
    leader1Name: "أمينة علي",
    leader1Role: "الرئيس التنفيذي",
    leader1Bio: "قائدة برؤية وخبرة تتجاوز 15 عامًا في الإعلام والاتصال.",
    leader2Name: "محمد حسن",
    leader2Role: "الرئيس التنفيذي للعمليات",
    leader2Bio: "خبير في العمليات والاستراتيجية الرقمية ونمو المؤسسات.",
    leader3Name: "فاطمة يوسف",
    leader3Role: "رئيسة الإنتاج",
    leader3Bio: "منتجة حائزة على جوائز وروائية مبدعة.",
    awardsTitle: "الجوائز والتكريم",
    awardsSubtitle: "نحتفل بإنجازاتنا وتقدير الصناعة لنا.",
    awardItem1Title: "أفضل ابتكار إعلامي",
    awardItem1Org: "جوائز الإعلام الإفريقي",
    awardItem1Year: "2024",
    awardItem2Title: "إنتاج محتوى متميز",
    awardItem2Org: "قمة التلفزيون العالمية",
    awardItem2Year: "2023",
    awardItem3Title: "جائزة الأثر المجتمعي",
    awardItem3Org: "منتدى الإعلام الصومالي",
    awardItem3Year: "2022",
    awardItem4Title: "التميز في السرد الرقمي",
    awardItem4Org: "مبدعو شرق أفريقيا",
    awardItem4Year: "2021",
    awardItem5Title: "أفضل قناة تلفزيونية إقليمية",
    awardItem5Org: "جوائز التميز الإعلامي",
    awardItem5Year: "2020",
    awardItem6Title: "نجم صاعد في البث",
    awardItem6Org: "جوائز البث الإفريقية",
    awardItem6Year: "2019",
    careers: "الوظائف",
    liveBroadcasting: "بث مباشر",

    // Footer
    footerCompanyTagline:
      "نربط العلامات ونصنع القصص. وجهتك الأولى لمحتوى إعلامي عالي الجودة عبر التلفزيون والمنصات الرقمية وخدمات الإنتاج.",
    footerQuickLinks: "روابط سريعة",
    footerOurBrands: "علاماتنا",
    footerDownloadNasiyeTitle: "حمّل تطبيق ناسية",
    footerDownloadNasiyeDesc:
      "احصل على تطبيق ناسية واستمتع بالمحتوى المميز أينما كنت.",
    appStore: "متجر التطبيقات",
    googlePlay: "متجر جوجل بلاي",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    copyrightPrefix: "حقوق النشر ©",
    allRightsReserved: "جميع الحقوق محفوظة",
    expertTeam: "فريق خبير",
    awardWinningContent: "محتوى حائز على جوائز",

    // AsalTV
    // watchLive: "شاهد البث المباشر",
    viewSchedule: "عرض الجدول",
    broadcasting: "البث",
    awardsWon: "الجوائز المحققة",
    dailyViewers: "المشاهدون يوميًا",
    // twentyFourSevenProgramming: "برمجة على مدار 24/7",
    // liveBroadcasting: "بث مباشر",
    // awardWinningContent: "محتوى حائز على جوائز",
    // expertTeam: "فريق خبير",
    featured: "المميز",
    programs: "البرامج",
    watchNow: "شاهد الآن",
    experiencePremiumOn: "اختبر المحتوى المتميز على",
    nasiyeCtaSubtitle:
      "شاهد محتوى أسال تي في في أي وقت ومن أي مكان عبر منصة ناسية للهاتف المحمول. احصل على وصول حصري لبرامجنا والبث المباشر.",
    downloadNasiyeApp: "حمّل تطبيق ناسية",

    // Jiil
    watchContent: "شاهد المحتوى",
    followUs: "تابعنا",
    socialFollowers: "متابعون على وسائل التواصل",
    contentSeries: "سلاسل محتوى",
    targetAge: "الفئة العمرية",
    mobileFirstContent: "محتوى موجّه للهواتف",
    viralCampaigns: "حملات رائجة",
    communityDriven: "مدفوع بالمجتمع",
    multiPlatform: "متعدد المنصات",
    popular: "الأكثر رواجًا",
    content: "المحتوى",
    getJiilOn: "احصل على محتوى Jiil Media على",
    jiilCtaSubtitle:
      "احصل على محتوى حصري من Jiil Media وابقَ على اتصال بآخر الصيحات عبر منصة ناسية.",

    // Masrax
    startProject: "ابدأ مشروعًا",
    filmProduction: "إنتاج الأفلام",
    tvContent: "محتوى تلفزيوني",
    awardWinning: "حائز على جوائز",
    projects: "المشاريع",
    viewProject: "عرض المشروع",
    watchMasraxOn: "شاهد أعمال Masrax على",
    masraxCtaSubtitle:
      "استمتع بأعمالنا الحائزة على جوائز في أي وقت وأي مكان عبر منصة ناسية للبث.",
    projectsCompleted: "مشاريع منجزة",
    yearsExperience: "سنوات خبرة",
    newsletterSubtitle:
      "اشترك في النشرة البريدية ولا تفوّت آخر الأخبار الإسلامية الصومالية من مجموعة أسال الإعلامية",
    visionTitle: "الرؤية",
    visionP1: "أن نكون المنصة الإعلامية الصومالية الأكثر ثقة وتأثيرًا، وربط المجتمعات المحلية والمهاجرة من خلال محتوى ملهم وأصيل وغني ثقافيًا."

    // Nasiye
    // downloadForIOS: "تحميل لنظام iOS",
    // getOnAndroid: "احصل عليه على أندرويد",
    // downloads: "عمليات التحميل",
    // appRating: "تقييم التطبيق",
    // hoursContent: "ساعات من المحتوى",
    // liveStreaming: "بث مباشر",
    // platformFeatures: "مزايا المنصة",
    // platformFeaturesSubtitle:
    //   "اكتشف ما يجعل «ناسية» منصة الترفيه المحمولة الأولى في المنطقة.",
    // contentCategories: "فئات المحتوى",
    // contentCategoriesSubtitle:
    //   "استكشف مكتبتنا المتنوعة من الأخبار والترفيه والثقافة والمزيد.",
    // userReviews: "آراء المستخدمين",
    // readyToStartStreaming: "هل أنت مستعد للبدء في المشاهدة؟",
    // finalCtaSubtitle:
    //   "انضم إلى أكثر من مليون مستخدم يثقون بناسية لتلبية احتياجاتهم الترفيهية اليومية.",
    // downloadNow: "حمّل الآن",
    // learnMore: "اعرف المزيد",
  },

  so: {
    // Common / controls

    "nasiye.hero.title": "Nasiye App",
    "nasiye.hero.subtitle":
      "Saaxiibkaaga lagu kalsoonaan karo ee aqoonta iyo nolosha Islaamka. Hel nuxur sugan, xasuusin maalinle ah, iyo bulsho firfircoon — dhammaan hal app gudaheed.",
    "nasiye.hero.buttons.appStore": "App Store",
    "nasiye.hero.buttons.playStore": "Play Store",

    "nasiye.features.title": "Astaamaha",
    "nasiye.features.dailyReminders.title": "Xasuusin Maalinle",
    "nasiye.features.dailyReminders.desc":
      "Hel xasuusin Islaami ah oo adiga kuu gaar ah iyo oraahyo dhiirrigelin maalin kasta.",
    "nasiye.features.curatedContent.title": "Nuxur La-Sooxulay",
    "nasiye.features.curatedContent.desc":
      "Gali maqaal, muuqaallo, iyo podcastyo ka imanaya culumo iyo abuurayaal lagu aamini karo.",
    "nasiye.features.community.title": "Bulsho",
    "nasiye.features.community.desc":
      "Ka qaybgal doodaha, weydii su’aalo, oo ku xirmo bulsho ku taageerta.",

    "nasiye.categories.title": "Qaybaha",
    "nasiye.categories.quranTafsir.title": "Qur’aan & Tafsiir",
    "nasiye.categories.quranTafsir.desc":
      "Akhri, dhagayso, oo baro agabyo sugan.",
    "nasiye.categories.lecturesPodcasts.title": "Muxaadarooyin & Podcasts",
    "nasiye.categories.lecturesPodcasts.desc":
      "Daawo oo dhagayso muxaadarooyin iyo silsilado dhiirrigelin leh.",
    "nasiye.categories.familyYouth.title": "Qoys & Dhalinyaro",
    "nasiye.categories.familyYouth.desc":
      "Hagid dhammaan da’da, laga bilaabo waalidnimo ilaa arrimaha dhalinyarada.",
    "nasiye.categories.downloads.title": "Soo-degisyada",
    "nasiye.categories.downloads.desc":
      "Keydi nuxurka aad jeceshahay si aad offline ugu isticmaasho.",

    "careers.title": "Shaqooyinka",
    "careers.heroSubtitle":
      "Nagala soo qaybgal himiladeenna ah in aan dib u qaabeyno warbaahinta Bariga Afrika oo aan isku xirno dhaqammo kala duwan adduunka",
    "careers.cta.viewOpenPositions": "Eeg Shaqooyinka Bannaan",

    "careers.stats.teamMembers": "Xubnaha Kooxda",
    "careers.stats.countries": "Dalal",
    "careers.stats.employeeSatisfaction": "Raalli-gelinta Shaqaalaha",
    "careers.stats.officeLocations": "Xarumaha",

    "careers.whyJoin.title": "Maxaad ugu biiraysaa Asal Media Group?",
    "careers.whyJoin.subtitle": "Ku biir koox firfircoon oo kacaaya warbaahinta guud ahaan Bariga Afrika",

    "careers.benefits.health.title": "Caafimaad & Daryeel",
    "careers.benefits.health.desc": "Caymis caafimaad oo dhamaystiran iyo barnaamijyo daryeel adiga iyo qoyskaagaba",
    "careers.benefits.learning.title": "Barasho & Horumarin",
    "careers.benefits.learning.desc": "Fursado barasho joogto ah, tababaro iyo ka-qaybgal shirar",
    "careers.benefits.global.title": "Fursado Caalami ah",
    "careers.benefits.global.desc": "Ka shaqee dalal kala duwan oo la shaqee kooxo caalami ah",
    "careers.benefits.balance.title": "Isu-dheelitirnaanta Nolosha & Shaqada",
    "careers.benefits.balance.desc": "Saacado shaqo oo dabacsan iyo fursado fogaan-ka-shaqayn si isu-dheelitirnaan loo helo",
    "careers.benefits.transport.title": "Gaadiid",
    "careers.benefits.transport.desc": "Gunno gaadiid iyo meelaha baarkinka ee dhammaan xafiisyada",
    "careers.benefits.tech.title": "Tignoolaji",
    "careers.benefits.tech.desc": "Qalab casri ah, internet xawaare sare leh, iyo agabyo wax-soosaar oo horumarsan",

    "careers.openPositions.title": "Shaqooyinka Bannaan",
    "careers.openPositions.subtitle": "Ka hel booska kugu habboon qaybaha kala duwan",
    "careers.openPositions.count": "60 shaqooyin bannaan",

    "careers.departments.production": "Soo-saar",
    "careers.departments.technical": "Farsamo",
    "careers.departments.editorial": "Tifaftir",
    "careers.departments.marketing": "Suuq-geyn",
    "careers.departments.jiilMedia": "Jiil Media",
    "careers.departments.asalTV": "Asal TV",
    "careers.departments.nasiyePlatform": "Nasiye Platform",


    // Hero
    "contact.title": "Nala Xiriir",
    "contact.subtitle": "Waxaan diyaar u nahay caawintaada. Nala soo xiriir, waxaanan kuugu jawaabi doonaa si dhakhso ah.",

    // Form
    "contact.form.title": "Noo soo dir fariin",
    "contact.form.subtitle": "Noo sheeg sida aan kuugu caawin karno, kooxdeennu waxay kula soo xiriiri doonaan goor dhow.",
    "contact.form.fullName": "Magaca oo Dhan",
    "contact.form.fullNamePlaceholder": "Geli magacaaga oo dhan",
    "contact.form.email": "Cinwaanka Email-ka",
    "contact.form.emailPlaceholder": "you@example.com",
    "contact.form.phone": "Lambarka Taleefanka",
    "contact.form.phonePlaceholder": "+252 61 000 0000",
    "contact.form.company": "Shirkad",
    "contact.form.companyPlaceholder": "Magaca shirkadda (ikhtiyaari)",
    "contact.form.department": "Qaybta",
    "contact.form.selectDepartment": "Xulo qayb",
    "contact.form.subject": "Cinwaan",
    "contact.form.subjectPlaceholder": "Fariintu maxay ku saabsan tahay?",
    "contact.form.message": "Fariin",
    "contact.form.messagePlaceholder": "Halkan ku qor fariintaada…",
    "contact.form.send": "Dir Fariinta",
    "contact.form.options.generalInquiry": "Su’aal Guud",
    "contact.form.options.careers": "Shaqooyinka",
    "contact.form.options.partnerships": "Iskaashi",

    // Info block
    "contact.info.title": "Nala soo xirir",
    "contact.info.generalInquiries": "Su’aalaha Guud",
    "contact.info.mainOffice": "Xafiiska Dhexe",
    "contact.info.headquarters": "Xarunta Dhexe",
    "contact.info.businessHours": "Saacadaha Shaqada",

    // Social
    "contact.social.title": "Raac baraha bulshada",
    "contact.social.facebook": "Facebook",
    "contact.social.twitter": "Twitter",
    "contact.social.instagram": "Instagram",
    "contact.social.linkedin": "LinkedIn",
    "contact.social.youtube": "YouTube",
    "contact.social.tiktok": "TikTok",

    // Offices section
    "contact.offices.title": "Xafiisyada Caalamka",
    "contact.offices.subtitle": "Waxaan ka joognaa magaalooyin muhiim ah oo gobolka ka tirsan.",
    "contact.offices.departments": "Qaybaha",

    // Office cities/countries
    "contact.offices.mogadishu.city": "Muqdisho",
    "contact.offices.mogadishu.country": "Soomaaliya",
    "contact.offices.hargeisa.city": "Hargeysa",
    "contact.offices.hargeisa.country": "Soomaaliland",
    "contact.offices.nairobi.city": "Nayroobi",
    "contact.offices.nairobi.country": "Kenya",
    "contact.offices.dubai.city": "Dubai",
    "contact.offices.dubai.country": "UAE",

    // Hours
    "contact.hours.sundayThursday": "Axad–Khamiis, 8:00–17:00",
    "contact.hours.mondayFriday": "Isniin–Jimce, 9:00–18:00",

    // Brand/department labels
    "contact.brands.asalTv": "Asal TV",
    "contact.brands.jiilMedia": "Jiil Media",
    "contact.brands.masrax": "Masrax Production",
    "contact.brands.nasiye": "Nasiye Platform",
    "contact.departments.administration": "Maamulka",
    "contact.departments.newsBureau": "Xafiiska Wararka",
    "contact.departments.regionalOps": "Hawlaha Gobolka",
    "contact.departments.technology": "Tignoolajiyada",

    // CTA
    "contact.cta.title": "Gargaarka degdegga ah ma u baahan tahay?",
    "contact.cta.subtitle": "Kooxda taageeradu waxay diyaar u yihiin inay ku caawiyaan inta lagu jiro saacadaha shaqada.",
    "contact.cta.callNow": "Wac Hadda",
    "contact.cta.liveChat": "Chat Toos ah",

    "careers.types.fullTime": "Waqti-buuxa",

    "careers.experience.5plus": "5+ sano",
    "careers.experience.3plus": "3+ sano",
    "careers.experience.2plus": "2+ sano",
    "careers.experience.2to4": "2–4 sano",

    "careers.locations.mogadishu": "Muqdisho, Soomaaliya",
    "careers.locations.remote": "Fogaan-ka-shaqayn",
    "careers.locations.hargeisa": "Hargeysa, Soomaaliland",
    "careers.locations.nairobi": "Nayroobi, Kenya",
    "careers.locations.dubai": "Dubai, UAE",
    "careers.locations.london": "London, UK",

    "careers.jobs.applyNow": "Hadda Codso",
    "careers.jobs.postedOn": "La daabacay {date}",
    "careers.jobs.keyRequirements": "Shuruudaha Muhiimka ah:",

    "careers.jobs.seniorVideoProducer.title": "Soo-saaraha Video ee Sare",
    "careers.jobs.seniorVideoProducer.desc":
      "Hogaami mashaariicda soo-saarka muuqaalka laga bilaabo fikrad ilaa dhammaystir, maamul shaqaalaha oo hubi tayada nuxurka.",
    "careers.jobs.seniorVideoProducer.req.1": "Khibrad 5+ sano ah soo-saarka muuqaalka",
    "careers.jobs.seniorVideoProducer.req.2": "Xirfado hoggaamineed",
    "careers.jobs.seniorVideoProducer.req.3": "Aqoonta farsamada",
    "careers.jobs.seniorVideoProducer.req.4": "Aragti hal-abuur leh",

    "careers.jobs.digitalContentCreator.title": "Abuuraha Nuxurka Dijitaalka",
    "careers.jobs.digitalContentCreator.desc":
      "Soo saar nuxur xiiso leh ee baraha bulshada, adigoo diiradda saaraya dhallinyarada iyo waxyaabaha u-baxa (viral).",
    "careers.jobs.digitalContentCreator.req.1": "Khibrad baraha bulshada",
    "careers.jobs.digitalContentCreator.req.2": "Xirfado abuurista nuxurka",
    "careers.jobs.digitalContentCreator.req.3": "Tafatirka muuqaalka",
    "careers.jobs.digitalContentCreator.req.4": "Ogaanshaha isbeddellada (trends)",

    "careers.jobs.broadcastEngineer.title": "Injineerka Baahinta",
    "careers.jobs.broadcastEngineer.desc":
      "Ku shaqee oo dayactir qalabka baahinta, xaqiiji tayada calaamadda, una taageer soo-saarista TV-ga tooska ah.",
    "careers.jobs.broadcastEngineer.req.1": "Aqoonta tignoolajiyada baahinta",
    "careers.jobs.broadcastEngineer.req.2": "Xallinta ciladaha farsamo",
    "careers.jobs.broadcastEngineer.req.3": "Dayactirka qalabka",
    "careers.jobs.broadcastEngineer.req.4": "Khibrad TV-ga tooska ah",

    "careers.jobs.newsReporter.title": "Wariye Warar",
    "careers.jobs.newsReporter.desc":
      "Baadh, baar, oo ka warbixi dhacdooyinka saameeya bulshada Bariga Afrika iyo qurbo-joogta.",
    "careers.jobs.newsReporter.req.1": "Shahaado saxaafadeed",
    "careers.jobs.newsReporter.req.2": "Khibrad goob-warbixin",
    "careers.jobs.newsReporter.req.3": "Xirfado luqadeed",
    "careers.jobs.newsReporter.req.4": "Wacyi dhaqan",

    "careers.jobs.softwareDeveloper.title": "Horumariye Software",
    "careers.jobs.softwareDeveloper.desc":
      "Horumari oo dayactir astaamaha madal-da baahinta, diiradda saaraya UX iyo miisaamid-fudayd.",
    "careers.jobs.softwareDeveloper.req.1": "Horumarin full-stack",
    "careers.jobs.softwareDeveloper.req.2": "Tignoolajiyada baahinta",
    "careers.jobs.softwareDeveloper.req.3": "Horumarin moobeel",
    "careers.jobs.softwareDeveloper.req.4": "Daruuraha (cloud)",

    "careers.jobs.marketingSpecialist.title": "Khabiir Suuq-geyn",
    "careers.jobs.marketingSpecialist.desc":
      "Horumari oo fuliso ololeyaal suuq-geyn oo caalami ah adigoo diiradda saaraya ka-qaybgalka qurbo-joogta.",
    "careers.jobs.marketingSpecialist.req.1": "Suuq-geyn dijitaal ah",
    "careers.jobs.marketingSpecialist.req.2": "Maareynta ololaha",
    "careers.jobs.marketingSpecialist.req.3": "Falanqayn iyo cabbirro",
    "careers.jobs.marketingSpecialist.req.4": "Isgaarsiin dhaqan-dheer",

    "careers.cta.impactTitle": "Diyaar ma u tahay inaad saamayn reebto?",
    "careers.cta.impactSubtitle":
      "Ma aragto booska kugu habboon? Noo soo dir CV-gaaga oo noo sheeg sida aad u dooran lahayd inaad ka qeyb-qaadato.",
    "careers.cta.submitResume": "Gudbi CV",
    "careers.cta.contactHR": "La Xiriir HR",

    // Hero
    "faq.hero.title": "Su’aalaha Badanaa La Isweydiiyo",
    "faq.hero.subtitle": "Jawaabo degdeg ah oo ku saabsan adeegyada Asal TV, taageerada, iyo xayaysiiska.",
    "faq.hero.searchPlaceholder": "Raadi su’aalaha…",
    "faq.hero.totalCount": "{count} su’aal guud ahaan",

    // Groups
    "faq.groups.general.title": "Guud",
    "faq.groups.services.title": "Adeegyada",
    "faq.groups.corporate.title": "Adeegyada Shirkadaha",
    "faq.groups.tech.title": "Taageerada Farsamada",
    "faq.groups.advertising.title": "Xayaysiis",

    // Q&A — General
    "faq.q.general.whatIs.title": "Waa maxay Asal TV?",
    "faq.q.general.whatIs.body":
      "Asal TV waa shirkad hormuud u ah baahinta iyo soo-saarka warbaahinta oo fadhigeedu yahay Muqdisho, Soomaaliya. Waxaan bixinnaa adeegyo dhammaystiran sida cable TV, soo-saarka muuqaalka shirkadaha, IPTV ee Nasiye iyo App-ka moobeelka, iyo soo-saarka filimada & taxanayaasha hoos yimaada Masrax Productions.",
    "faq.q.general.location.title": "Xagee ayuu ku yaal Asal TV?",
    "faq.q.general.location.body": "Xarunta dhexe ee Asal TV waxay ku taallaa Muqdisho, Soomaaliya — Laami-yaraha Zoobe.",

    // Q&A — Services
    "faq.q.services.whatProvide.title": "Adeegyo noocee ah ayuu Asal TV bixiyaa?",
    "faq.q.services.whatProvide.body":
      "Asal TV waxa uu bixiyaa adeegyo kala duwan oo ay ka mid yihiin:\n• Adeegga Cable TV\n• Soo-saarka muuqaallada shirkadaha\n• Internet Protocol Television (IPTV) ee Nasiye\n• Soo-saarka filimada iyo taxanayaasha ee Masrax\n• Xirmooyinka dhacdooyinka (events)\n• Faafinta xayaysiisyada\n• Xirmooyinka soo-saarka muuqaalka",
    "faq.q.services.subscribeCable.title": "Sideen ugu qortaa adeegga cable-ka ee Asal TV?",
    "faq.q.services.subscribeCable.body":
      "Wac *424# ama la xiriir adeegga macaamiisha 424 si aad ugu qorto cable TV-ga.",
    "faq.q.services.whatIsIptv.title": "Waa maxay IPTV, sideese u shaqeeyaa?",
    "faq.q.services.whatIsIptv.body":
      "IPTV (Internet Protocol Television) waxa uu keenaa daawashada TV-ga iyada oo loo marayo internet halkii satellite/cable dhaqameed laga adeegsan lahaa. Waxaad u baahan tahay internet deggan iyo qalab la jaanqaadi kara si aad u daawato.",

    // Q&A — Corporate
    "faq.q.corporate.videoProd.title": "Asal TV ma bixisaa adeegga soo-saarka video-ga shirkadaha?",
    "faq.q.corporate.videoProd.body":
      "Haa. Waxaan soo-saarnaa muuqaallo xirfadaysan oo loogu talagalay suuq-geyn, shirar, dhacdooyin, ololayaal iyo wixii la mid ah — laga bilaabo fikradda ilaa keenista kama dambaysta ah.",

    // Q&A — Tech
    "faq.q.tech.supportContact.title": "Yaa aan la xiriiri karaa taageerada farsamada?",
    "faq.q.tech.supportContact.body":
      "Taageerada farsamo: wac 424 ama WhatsApp +252 619 993 395.",
    "faq.q.tech.iptvNotWorking.title": "Maxaan sameeyaa haddii IPTV-gaygu shaqayn waayo?",
    "faq.q.tech.iptvNotWorking.body":
      "Marka hore hubi internet-kaaga iyo la jaanqaadka qalabka. Haddii mushkiladdu sii jirto, la xiriir kooxda taageerada farsamada 141.",

    // Q&A — Advertising
    "faq.q.advertising.options.title": "Ma jiraan fursado xayaysiis oo Asal TV bixiso?",
    "faq.q.advertising.options.body":
      "Haa, waxaan bixinnaa doorashooyin xayaysiis oo kala duwan. Fadlan la xiriir Qaybta Suuq-geynta si aad u hesho qiimaynta iyo xirmooyinka.",

    // UI labels
    "faq.openPill": "Fur",
    "faq.permalink": "Xiriir joogto ah",
    "faq.copyLink": "Koobi link-ga",
    "faq.noResults": "Natiijo lama helin. Tijaabi ereyo kale.",

    // Contact block
    "faq.contact.title": "Weli caawin ma u baahan tahay?",
    "faq.contact.subtitle": "Wac 424, WhatsApp +252 619 993 395, ama la xiriir taageerada farsamada 141.",
    "faq.contact.callCta": "Wac 424",
    "faq.contact.whatsappTitle": "Chat ku fur WhatsApp",

    "culturalIntegrity": "Daacadnimo Dhaqameed",
    "culturalIntegrityDesc": "Waxaan maamuusnaa oo ilaalinnaa qiyamka, afka, iyo aqoonsiga Soomaaliyeed dhammaan waxa aan abuurno.",

    "excellence": "Heer-Sare",
    "excellenceDesc": "Waxaan ku dadaalnaa inaan bixino tayo ugu sarreysa sheeko-werinta, saxaafadda, iyo soo-saarka.",

    "inclusivity": "Wada-Dhan",
    "inclusivityDesc": "Waxaan metelnaa dhammaan codadka — magaalo iyo miyi, dhallinyaro iyo waayeel, haween iyo rag, gudaha iyo qurbo-joog.",

    "empowerment": "Xoog-siin",
    "empowermentDesc": "Waxaan kor u qaadnaa kartida, fikradaha, iyo sheekooyinka Soomaaliyeed ee abuura sharaf iyo horumar.",

    "transparencyTrust": "Hufnaan & Aaminaad",
    "transparencyTrustDesc": "Waxaan dhisnaa kalsooni annagoo adeegsanayna saxnaan, caddaalad, iyo sheeko-xogeed daacad ah.",

    "innovation": "Hal-abuur",
    "innovationDesc": "Waxaan qaabilnaa tignoolajiyada iyo hal-abuurka si aan ugu sheekayno siyaabo cusub oo soo jiidasho leh.",

    all: "Dhammaan",
    prev: "Hore",
    watchLive: "Daawo Toos",
    next: "Xiga",
    goToSlide: "U gudub bogga",
    pageOf: "Bogga {page} ee {total}",
    featuredStory: "Sheekada La Xulay",
    latestStories: "Sheekooyinka Ugu Dambeeya",
    readMore: "Akhri Dheeraad",
    readMoreArrow: "Akhri dheeraad →",
    readFullStory: "Akhri Sheekada Oo Dhan",
    stayUpdated: "La Soco",
    emailPlaceholder: "Geli iimaylkaaga",
    subscribe: "Ku Biir",
    close: "Xir",
    untitled: "Aan Cinwaan Lahayn",
    newsDesk: "Qolka Wararka",
    twentyFourSevenProgramming: "Barnaamijyo 24/7",
    awardWinningContent: "Nuxur Abaal-marin ku guuleystay",
    testimonialsTile: "Maxay la-hawlgalayaasheennu ka yiraahdaan?",
    testimonialsSubtitle: "Dhageyso waxa ay la-hawlgalayaasheennu ka sheegayaan khibraddooda la-shaqaynta nala.",

    // --- Header nav (NEW) ---
    homeNav: "Hoyga",
    aboutNav: "Nagu Saabsan",
    servicesNav: "Adeegyada",
    brandsNav: "Calaamadaha",
    packagesNav: "Xirmooyinka",
    portfolioNav: "Horyaal",
    contactNav: "Nala Soo Xiriir",
    adminNav: "Maamulka",
    moreNav: "Wax dheeraad ah...",
    faqsNav: "Su'aalaha",
    Nasiye: "Nasiye",

    // --- HERO ---
    heroTitleConnecting: "Isku Xiridda",
    heroTitleCultures: "Dhaqamada",
    heroTitleThrough: "Iyadoo loo marayo",
    heroTitleMedia: "Warbaahinta",
    heroSubtitleMain:
      "Asal Media Group waxay mideysaa afar summadood oo awood leh si ay u keenaan nuxur heer sare ah TV, baraha dijitaalka ah, iyo adeegyadii soosaarka guud ahaan gobolka.",
    watchOurStory: "Daawo Sheekadeenna",

    // --- Brand Highlights ---
    brandsSectionTitleOur: "Calaamadaha",
    brandsSectionTitleMedia: "Warbaahinta",
    brandsSectionTitleBrands: "kayaga",
    brandsSectionSubtitle:
      "Afar calaamadood oo kala duwan, hal aragti mideysan. Ka ogow sida mid walba uu ugu adeego dhagaystayaal kala duwan iyadoo la ilaalinayo tayada nuxurka.",
    brandAsalTVName: "Asal TV",
    brandAsalTVDesc:
      "Nuxur TV oo heer sare ah: barnaamijyo abaal-marin leh, warar iyo madadaalo.",
    brandJiilMediaName: "Jiil Media",
    brandJiilMediaDesc:
      "Madalsan dijitaal-ka-horeeya oo beegsanaya dhallinyarada, nuxur iyo qaabab hal-abuurnimo leh.",
    brandMasraxProductionName: "Masrax Production",
    brandMasraxProductionDesc:
      "Guri soo saar oo dhammaystiran; sheekooyin saamayn leh filim, TV iyo madallo dijitaal ah.",
    brandNasiyePlatformName: "Nasiye Platform",
    brandNasiyePlatformDesc:
      "Madal qulqul ah oo kacaankii keentay, nuxur heer sare si toos ah ugu keenaysa moobilkaaga.",
    explorePlatform: "Soo sahami Madasha",
    nasiyeHighlightDesc:
      "La kulmo mustaqbalka madadaalada moobilka adigoo isticmaalaya Nasiye. Madalkeenna hormuudka ahi waxay bixisaa nuxur gaar ah, TV toos ah iyo bandhigyo dalab ah oo loogu habeeyay moobilka.",

    // AsalTV / Common section terms
    News: "Warar",
    newsNewsletterSubtitle:
      "Ku biir warsidahayaga si aadan u seegin wararkii ugu dambeeyay ee Asal Media Group",

    // Services
    servicesPageTitle: "Adeegyada Soo Saarista Warbaahinta Xirfadlayaasha",
    servicesPageSubtitle:
      "Laga bilaabo fikradda ilaa dhammaadka, waxaan bixinaa nuxur gaar ah oo soo jiidanaya dhagaystayaashaada oo kor u qaadaya summaddaada",
    contact: "Nala Soo Xiriir",
    getStarted: "Bilow Hadda",
    viewPortfolio: "Arag Shaqooyinka",
    ourProcess: "Habkeenna",
    ourProcessSubtitle:
      "Laga bilaabo fikradda ilaa dhammaadka, waxaan raacnaa hab la hubiyey si aan u bixinno natiijooyin gaar ah",
    readyToStart: "Ma Diyaar u tahay inaad Bilowdo Mashruucaaga?",
    readyToStartSubtitle:
      "Aan ka wada hadalno sida aan aragiddaada ugu soo noolaysan karno adeegyadayada warbaahinta oo dhammaystiran",
    noServicesFound: "Adeegyo lama helin.",
    discover: "Helitaanka",
    discoverDesc: "Fahamka baahiyahaada",
    design: "Qaabeynta",
    designDesc: "Dhisida istaraatiijiyadda saxda ah",
    create: "Abuurista",
    createDesc: "Soo saarista waxyaabaha tayo sare leh",
    approve: "Ansixinta",
    approveDesc: "Hagaajinta iyo dhammaystirka",
    publish: "Daabacada",
    publishDesc: "Qaybinta goobaha kala duwan",
    support: "Taageerada",
    supportDesc: "Kormeerka waxqabadka",
    viewAllServices: "Dhammaan Adeegyada",

    latest: "Akhbaartii ugu Dambeysey",
    sub: "Aan u bixinaa nuxur gaar ah oo soo jiidanaya dhagaystayaashaada oo kor u qaadaya summaddaada",
    viewAll: "Dhammaan Akhbaartii",
    category: "Akhbaartii",
    expertTeam: "Koox Khibrad Leh",

    // ServicesOverview
    serviceContentProduction: "Soo saarista Nuxurka",
    serviceContentProductionDesc:
      "Adeegyo dhamaystiran oo soo saarista barnaamijyo TV, dukumentiyo, xayeysiisyo, iyo nuxur dijitaal ah.",
    serviceBroadcastingVOD: "Baahinta & VOD",
    serviceBroadcastingVODDesc:
      "Baahin TV iyo adeegyo VOD oo ka shaqeeya madallo iyo qalab kala duwan.",
    serviceAdvertisingSolutions: "Xalalka Xayeysiiska",
    serviceAdvertisingSolutionsDesc:
      "Istaraatiijiyad xayeysiis iyo suuq-geyn si calaamadaha ay u gaadhaan dhagaystayaashooda si wax-ku-ool ah.",
    serviceConsultingServices: "Adeegyada La-talinta",
    serviceConsultingServicesDesc:
      "La-talin warbaahineed oo khabiir ah si loo horumariyo loona fuliyo istaraatiijiyado nuxur.",
    preProductionPlanning: "Qorshaynta Kahor-soo-saarista",
    professionalFilming: "Duubis Xirfadeed",
    postProductionEditing: "Tafarruq & Ka-dambeeya-soo-saar",
    distributionSupport: "Taageerada Qaybinta",
    liveTVBroadcasting: "Baahin TV Toos ah",
    vodPlatformManagement: "Maamulka Madalaha VOD",
    multiPlatformDistribution: "Qaybin Madallo Badan",
    audienceAnalytics: "Falanqaynta Dhagaystayaasha",
    mediaPlanning: "Qorshaynta Warbaahinta",
    creativeDevelopment: "Horumarinta Hal-abuurka",
    campaignManagement: "Maareynta Ololaha",
    performanceTracking: "Dabagalka Waxqabadka",
    strategyDevelopment: "Horumarinta Istaraatiijiyadda",
    marketAnalysis: "Falanqaynta Suuqa",
    brandPositioning: "Meelaynta Summadda",
    growthPlanning: "Qorshaynta Kobaca",

    // Nasiye
    downloadForIOS: "Soo deji iOS",
    getOnAndroid: "Ka hel Android",
    downloads: "Soo dejinno",
    appRating: "Qiimaynta App-ka",
    hoursContent: "Saacado Nuxur",
    liveStreaming: "Baahin Toos ah",
    platformFeatures: "Astaamaha Madasha",
    platformFeaturesSubtitle:
      "Ogow waxa Nasiye ka dhigaya madal hibbo leh oo madadaalo moobil ah gobolka.",
    contentCategories: "Qaybaha Nuxurka",
    contentCategoriesSubtitle:
      "Soo sahami maktabaddeenna kala duwan: war, madadaalo, dhaqan iyo in ka badan.",
    userReviews: "Faallooyinka Isticmaalayaasha",
    readyToStartStreaming: "Diyaar ma u tahay daawasho?",
    finalCtaSubtitle:
      "Ku biir in ka badan 1 milyan isticmaaleyaal oo ku tiirsan Nasiye madadaaladooda maalinlaha ah.",
    downloadNow: "Soo deji Hadda",
    learnMore: "Wax dheeri ah baro",

    // Packages / channels
    Diini: "Diini",
    Social: "Bulsho",
    Sports: "Ciyaaraha",

    // Admin / News page
    newsPressTitle: "War & Warbaahin",
    newsPressSubtitle:
      "Wararkii ugu dambeeyay, bayaannada saxaafadda, iyo sheekooyinka ka imanaya calaamadahayaga iyo madalaha.",
    adminNewsNewsletterSubtitle:
      "Ku biir warsidahayaga si aadan u seegin wararkii diinta ee Soomaalida ee ka socda Asal Media Group",

    // Portfolio
    portfolioTitle: "Horyaalkeenna",
    portfolioSubtitle:
      "Waxaan soo bandhignaa shaqooyinkeenna ugu fiican — dukumentiyo, baahin toos ah, nuxur dijitaal ah iyo in ka badan.",
    totalViews: "Daawasho Guud",
    portfolioProjectsCompleted: "Mashaariic La Dhameeyey",
    portfolioAwardsWon: "Abaalmarinno",
    happyClients: "Macaamiil Faraxsan",
    watch: "Daawo",
    read: "Akhri",
    featuredVideo: "Fiidiyow La Xulay",
    noVideoAvailable: "Fiidiyow lama heli karo.",
    noTextAvailable: "Qoraal lama heli karo.",
    readyToCreate: "Diyaar ma u tahay inaad wax cajiib ah abuurno?",
    readyToCreateSubtitle:
      "Aan iska kaashanno si aan aragtidaada ugu xaqiijino kooxdayada abaalmarinta ku guuleysatay.",
    startYourProject: "Bilow Mashruucaaga",
    contactUs: "Nala Soo Xiriir",
    watchProjectVideo: "Daawo fiidiyowga mashruuca",

    // About
    monthlyViewers: "Daawadayaal Bishiiba",
    countries: "Dalal",
    contentHours: "Saacado Nuxur",
    aboutTitle: "Ku Saabsan Shirkadda Warbaahinta Asal",
    aboutSubtitle: "Ku xirista bulshada iyada oo loo marayo waxyaabaha awood leh.",
    ourStory: "Sheekaydayada",
    ourValues: "Qiyamkayaga",
    readyToJoin: "Diyaar ma u tahay inaad nala safarto?",
    discoverOpportunities:
      "Ka hel fursado aad uga mid noqoto mustaqbalka warbaahinta Bariga Afrika",
    storyParagraph1:
      "Shirkadda Warbaahinta Asal waa shirkad hogaamineysa soo saarista iyo gudbinta warbaahinta, oo xaruntaheedu tahay Muqdisho, Soomaaliya.",
    storyParagraph2:
      "Iyada oo loo marayo ujeedkayaga, Shirkadda Warbaahinta Asal waxay soo saartaa waxyaabaha goobaha kala duwan iyo xalalka isgaarsiinta oo loo habeeyay baahiyaha isbeddelaya ee dadka Soomaaliyeed. Adeegyadayada kala duwan waxay ka kooban yihiin gudbinta, soo saarista filimada, dabagalka dhacdooyinka, xayaysiinta, iyo warbaahinta dijitaalka ah, iyada oo hubinaysa nidaam dhamaystiran oo hal-abuur iyo heer-sare isgaarsiin ah.",
    storyParagraph3:
      "Iyada oo loo marayo Asal TV iyo Nasiye IPTV, Masrax Productions, Jiil Media, Abka Nasiye iyo warbaahinta dijitaalka ah, Shirkadda Warbaahinta Asal waxay maamushaa xirmooyin isku dhafan oo calaamado ah oo u go'an inay warbixin, madadaalo, iyo dhiirigelin bulshada Soomaaliyeed gudaha iyo dibadda adduunka.",
    culturalBridge: "Dhammaystir Dhaqameed",
    culturalBridgeDesc:
      "Waxaan sharafnaa oo ilaalinnaa qiyamka, afka, iyo aqoonsiga Soomaaliyeed dhammaan waxa aan abuurno",
    community: "Bulsho",
    communityDesc:
      "Dhiska xiriirro xooggan oo lala yeesho dhagaystayaasha iyo kobcinta isku-xidhka wax-ku-oolka ah.",
    valuesSubtitle:
      "Qiyamka nagu hago wax kasta oo aan qabanno ee Asal Media Group",
    missionTitle: "Ujeedka",
    missionP1:
      "Inaan abuurno waxyaabaha Soomaaliyeed ee dhabta ah, awoodsiino talantada maxalliga ah, horumariyo midaynta, oo ku xirno daawadayaasha Soomaaliyeed ee adduunka oo dhan iyada oo loo marayo warbaahinta wada-helid leh iyo iskaashiga waara.",
    visionTitle: "Aragti",
    visionP1: "Inaan noqono goobta warbaahinta Soomaaliyeed ee ugu aaminan iyo ugu saameyn badan, oo ku xirta bulshada maxalliga ah iyo qurbajoogta iyada oo loo marayo waxyaabaha dhiirigeliyo, dhab ah, oo dhaqan aad u hodan.",

    missionP2:
      "Waxaan dooneynaa inaan noqono buundada u dhexeysa dhaqamada, korna u qaadno codadka, aanna soo saarno nuxur tayo sare leh oo wax baro, maaweeliya oo dhiirrigeliya. Hadafkeenna waxa sal u ah daacadnimo, hal-abuurnimo iyo saameyn bulsho oo togan.",
    missionCardCulturalExchangeTitle: "Is-weydaarsi Dhaqameed",
    missionCardCulturalExchangeDesc:
      "Dhisidda is-fahanka iyo midnimada annagoo wadaagna sheekooyin kala duwan oo ka imanaya daafaha dunida.",
    missionCardInnovationTitle: "Hal-abuurnimo",
    missionCardInnovationDesc:
      "Ka faa’iidaysiga tignoolajiyada iyo hal-abuurka si loo bixiyo waayo-aragnimo warbaahineed oo saameyn leh.",
    missionCardCommunityTitle: "Kobcinta Bulshada",
    missionCardCommunityDesc:
      "Taageerida iyo baahinta codadka maxalliga ah si loo kiciyo korriin iyo isbeddel togan.",
    leadershipTitle: "Hoggaan",
    leadershipSubtitle: "La kulma kooxda xambaarsan hamiga Asal Media Group.",
    leader1Name: "Amina Ali",
    leader1Role: "Maareeye Guud (CEO)",
    leader1Bio:
      "Hoggaamiye leh aragti iyo 15+ sano oo khibrad ah warbaahinta iyo isgaadhsiinta.",
    leader2Name: "Mohamed Hassan",
    leader2Role: "Maareeye Hawlgal (COO)",
    leader2Bio:
      "Khabiir ku takhasusay hawlgallada, istaraatiijiyadda dijitaalka iyo koboca urorada.",
    leader3Name: "Fatima Yusuf",
    leader3Role: "Madaxa Soo Saarista",
    leader3Bio:
      "Soo saare abaal-marin ku guuleystay iyo hal-abuur sheeko-yaqaan.",
    awardsTitle: "Abaalmarino & Aqoonsi",
    awardsSubtitle: "Waxaan u dabaaldegnaa guulaha iyo aqoonsiga warshadaha.",
    awardItem1Title: "Hal-abuurnimada Warbaahinta Ugu Fiican",
    awardItem1Org: "Abaalmarinta Warbaahinta Afrika",
    awardItem1Year: "2024",
    awardItem2Title: "Soo Saarista Nuxur Heer Sare",
    awardItem2Org: "Shirwaynaha TV-ga Adduunka",
    awardItem2Year: "2023",
    awardItem3Title: "Abaalmarinta Saameynta Bulshada",
    awardItem3Org: "Golaha Warbaahinta Soomaaliyeed",
    awardItem3Year: "2022",
    awardItem4Title: "Heer Sare ee Sheeko-dhiska Dijitaalka",
    awardItem4Org: "Hal-abuuro Bariga Afrika",
    awardItem4Year: "2021",
    awardItem5Title: "Kanaalka TV-ga Gobolka Ugu Fiican",
    awardItem5Org: "Abaalmarinta Heerka Warbaahinta",
    awardItem5Year: "2020",
    awardItem6Title: "Xidig Soo Baxa ee Baahinta",
    awardItem6Org: "Abaalmarinta Baahinta Afrika",
    awardItem6Year: "2019",
    careers: "Shaqooyin",
    liveBroadcasting: "Baahin Toos ah",

    // Footer
    footerCompanyTagline:
      "Waxaan isku xidhnaa calaamadaha, annagoo abuurnayna sheekooyin. Meesha koowaad ee nuxur warbaahineed tayaysan: TV, dijitaal iyo soo saarid.",
    footerQuickLinks: "Xiriiriyeyaasha Degdegga ah",
    footerOurBrands: "Calaamadaha Nala Jiro",
    footerDownloadNasiyeTitle: "Soo deji Nasiye",
    footerDownloadNasiyeDesc:
      "Ka hel app-ka Nasiye oo ku raaxayso nuxur heer sare ah meel kasta.",
    appStore: "App Store",
    googlePlay: "Google Play",
    privacyPolicy: "Siyaasadda Qarsoodiga",
    termsOfService: "Shuruudaha Adeegga",
    copyrightPrefix: "Xuquuqda daabacaadda ©",
    allRightsReserved: "Dhammaan xuquuqaha way xifdiyaan",

    // AsalTV
    // watchLive: "Daawo Toos",
    viewSchedule: "Eeg Jadwalka",
    broadcasting: "Baahinta",
    awardsWon: "Abaalmarino La Helay",
    dailyViewers: "Daawadayaal Maalinle",
    // twentyFourSevenProgramming: "Barnaamijyo 24/7",
    // liveBroadcasting: "Baahin Toos ah",
    // awardWinningContent: "Nuxur Abaal-marin ku guuleystay",
    // expertTeam: "Koox Khibrad Leh",
    featured: "La Xulay",
    programs: "Barnaamijyo",
    watchNow: "Daawo Hadda",
    experiencePremiumOn: "Ku raaxayso Nuxur Heer Sare oo ku saabsan",
    nasiyeCtaSubtitle:
      "Daawo nuxurka Asal TV wakhti kasta, meel kasta adigoo adeegsanaya madal taleefanka Nasiye. Ka hel helitaan gaar ah barnaamijyadeenna iyo baahinta tooska ah.",
    downloadNasiyeApp: "Soo deji App-ka Nasiye",

    // Jiil
    watchContent: "Daawo Nuxurka",
    followUs: "Raac Nala",
    socialFollowers: "Raacayaal Bulsho",
    contentSeries: "Taxanayaal Nuxur",
    targetAge: "Da’da Bartilmaameedka",
    mobileFirstContent: "Nuxur Moobil-ku Horeeyo",
    viralCampaigns: "Ololayaal Caan Baxa",
    communityDriven: "Bulsho Hoggaamineed",
    multiPlatform: "Madallo Badan",
    popular: "Caan",
    content: "Nuxur",
    getJiilOn: "Hel Nuxurka Jiil Media ku",
    jiilCtaSubtitle:
      "Ka hel nuxurka gaarka ah ee Jiil Media oo la soco isbeddellada ugu dambeeya adigoo adeegsanaya madasha Nasiye.",

    // Masrax
    startProject: "Bilow Mashruuc",
    filmProduction: "Soo Saarista Filimada",
    tvContent: "Nuxur TV",
    awardWinning: "Abaal-marin Ku Guuleystay",
    projects: "Mashaariic",
    viewProject: "Eeg Mashruuca",
    watchMasraxOn: "Daawo Masrax Productions ku",
    masraxCtaSubtitle:
      "La kulmo wax-soo-saarradayada abaal-marinada ku guuleystay wakhti kasta, meel kasta adigoo isticmaalaya madasha qulqulka Nasiye.",
    projectsCompleted: "Mashaariic La Dhameeyey",
    yearsExperience: "Sano Khibrad",

    newsletterSubtitle:
      "Ku biir warsidahayaga si aadan u seegin wararka Islaamiga ah ee Soomaalida ee Asal Media Group",

    // Nasiye
    // downloadForIOS: "Soo deji iOS",
    // getOnAndroid: "Ka hel Android",
    // downloads: "Soo dejinno",
    // appRating: "Qiimaynta App-ka",
    // hoursContent: "Saacado Nuxur",
    // liveStreaming: "Baahin Toos ah",
    // platformFeatures: "Astaamaha Madasha",
    // platformFeaturesSubtitle:
    //   "Ogow waxa Nasiye ka dhigaya madal hibbo leh oo madadaalo moobil ah gobolka.",
    // contentCategories: "Qaybaha Nuxurka",
    // contentCategoriesSubtitle:
    //   "Soo sahami maktabaddeenna kala duwan: war, madadaalo, dhaqan iyo in ka badan.",
    // userReviews: "Faallooyinka Isticmaalayaasha",
    // readyToStartStreaming: "Diyaar ma u tahay daawasho?",
    // finalCtaSubtitle:
    //   "Ku biir in ka badan 1 milyan isticmaaleyaal oo ku tiirsan Nasiye madadaaladooda maalinlaha ah.",
    // downloadNow: "Soo deji Hadda",
    // learnMore: "Wax dheeri ah baro",
  },
};

// -----------------------------------------------------------------------------
// Translation cache + simple free API (MyMemory)
// -----------------------------------------------------------------------------
const translationCache = new Map<string, string>();

async function translateWithAPI(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const cacheKey = `${text}|${sourceLang}|${targetLang}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey)!;

  try {
    const langMap: Record<string, string> = { eng: "en", ar: "ar", so: "so" };
    const source = langMap[sourceLang] || "en";
    const target = langMap[targetLang] || "en";
    if (source === target) return text;

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${source}|${target}`
    );
    if (!response.ok) return text;

    const data = await response.json();
    const translated = data?.responseData?.translatedText || text;
    translationCache.set(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
}

// -----------------------------------------------------------------------------
// Provider + Hook
// -----------------------------------------------------------------------------
const STORAGE_KEY = "language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("eng");
  const [mounted, setMounted] = useState(false);

  // Mount + restore
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && ["eng", "ar", "so"].includes(stored)) {
        setLanguageState(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Reflect dir/lang on <html>
  useEffect(() => {
    if (!mounted) return;
    const map: Record<Language, string> = { eng: "en", ar: "ar", so: "so" };
    const htmlLang = map[language] ?? "en";
    const rtl = language === "ar";
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", htmlLang);
    }
  }, [language, mounted]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      translationCache.clear();
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string): string =>
      translations[language]?.[key] ?? translations.eng[key] ?? key,
    [language]
  );

  const translateText = useCallback(
    async (text: string, targetLang?: Language): Promise<string> => {
      if (!text || !text.trim()) return text;
      const to = targetLang || language;
      if (to === "eng") return text;
      return translateWithAPI(text, "eng", to);
    },
    [language]
  );

  const isRTL = language === "ar";

  if (!mounted) return null;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, translateText, isRTL }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
