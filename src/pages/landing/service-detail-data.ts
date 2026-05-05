import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Container,
  Grip,
  Network,
  ClipboardCheck,
  Undo2,
  Contact,
  Warehouse,
  Globe,
  Truck,
  Package,
  BarChart3,
  Lock,
  Clock,
  MapPin,
  FileCheck,
  Scale,
  Receipt,
  Route,
  AlertTriangle,
  Languages,
  ShieldAlert,
  Users,
  Boxes,
  Settings,
  CheckCircle,
  Zap,
  HeartHandshake,
  Timer,
  BadgeCheck,
  Target,
  TrendingUp,
  Brain,
  Award,
} from "lucide-react";

export type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type HighlightCard = {
  title: string;
  description: string;
};

export type ServiceDetailData = {
  slug: string;
  title: string;
  subtitle: string;
  gallery: {
    images: string[];
    videoThumb: string;
  };
  overview: {
    badge: string;
    headingParts: { text: string; color: "red" | "navy" }[];
    paragraphs: string[];
    sidebarImage: string;
    sidebarCaption: string;
    stepIcons: LucideIcon[];
    benefits: string[];
    highlights: HighlightCard[];
  };
  features: {
    heading: string;
    subtitle: string;
    cards: FeatureCard[];
  };
  faq: {
    items: FaqItem[];
  };
  cta: {
    image: string;
    heading: string;
    description: string;
  };
};

export const SERVICES: ServiceDetailData[] = [
  {
    slug: "warehousing-distribution",
    title: "Warehousing & Distribution Services",
    subtitle:
      "Secure storage and efficient distribution solutions to keep your inventory flowing smoothly.",
    gallery: {
      images: [
        "https://images.pexels.com/photos/6169163/pexels-photo-6169163.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6170410/pexels-photo-6170410.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6169141/pexels-photo-6169141.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      ],
      videoThumb:
        "https://images.pexels.com/photos/6169193/pexels-photo-6169193.jpeg?auto=compress&cs=tinysrgb&w=900&h=800&fit=crop",
    },
    overview: {
      badge: "SERVICE OVERVIEW",
      headingParts: [
        { text: "Secure and Efficient", color: "red" },
        { text: "Warehousing & Distribution", color: "navy" },
        { text: "Solutions", color: "red" },
      ],
      paragraphs: [
        "In today's fast-paced and competitive market, businesses need secure and efficient warehousing and distribution solutions to manage their inventory and ensure timely deliveries.",
        "Our Warehousing & Distribution services provide secure, safe, flexible, and efficient solutions to manage your inventory and streamline order fulfillment. With strategically located warehouses, advanced inventory systems, and expert logistics management, we ensure your products are stored safely and distributed promptly to meet customer demands.",
        "Whether you need short-term storage for seasonal inventory or long-term warehousing solutions, our team is dedicated to supporting your distribution goals with reliability and care, ensuring your goods are managed efficiently and securely at all times.",
      ],
      sidebarImage:
        "https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      sidebarCaption:
        "Solutions are designed to help businesses safeguard their inventory, streamline operations, and deliver products quickly and cost-effectively",
      stepIcons: [Warehouse, Truck, Package],
      benefits: [
        "Cost Savings",
        "Faster Turnaround",
        "Reduced Risk of Loss",
        "Customer Satisfaction",
      ],
      highlights: [
        {
          title: "Secure Warehousing",
          description:
            "Protection of goods against theft, damage, and loss, combined with full compliance with industry regulations",
        },
        {
          title: "Efficient Distribution",
          description:
            "Streamlined processes to manage inventory, reduce handling time, and ensure timely delivery of products.",
        },
      ],
    },
    features: {
      heading: "Stop Worrying About Shipping Problems",
      subtitle:
        "Our global team of warehousing and distribution experts can help you to configure the best kit of value-added services in accordance with your needs and include them as part of our value proposition.",
      cards: [
        {
          icon: ShieldCheck,
          title: "High-Security Facility",
          description:
            "All warehouses are equipped with advanced security measures, climate control options, and 24/7 surveillance.",
        },
        {
          icon: Container,
          title: "Inventory Management",
          description:
            "Real-time tracking and inventory control systems allow you to manage stock levels and get accurate insights on product movement.",
        },
        {
          icon: Grip,
          title: "Flexible Storage Options",
          description:
            "Choose from short-term, long-term, level-term or seasonal storage plans tailored to your want and business needs.",
        },
        {
          icon: Network,
          title: "Distribution Network",
          description:
            "Access to a vast distribution network, making it easy to reach customers locally, regionally, and globally.",
        },
        {
          icon: ClipboardCheck,
          title: "Efficient Order Fulfillment",
          description:
            "Quick and accurate order processing ensures prompt packing, dispatch, and timely delivery, meeting customer expectations efficiently.",
        },
        {
          icon: Undo2,
          title: "Reverse Logistics Support",
          description:
            "Streamlined return handling and inventory restocking to improve customer satisfaction and reduce waste.",
        },
      ],
    },
    faq: {
      items: [
        {
          question:
            "How do you ensure the security of products stored in your warehouses?",
          answer:
            "Our warehouses are equipped with 24/7 surveillance, advanced alarm systems, restricted access zones, and trained security personnel. We also carry comprehensive insurance to protect your goods.",
        },
        {
          question: "Can I track my inventory levels in real time?",
          answer:
            "Yes, we offer a real-time inventory management portal where you can monitor stock levels, track shipments, and get analytics on your supply chain performance.",
        },
        {
          question:
            "Do you offer customized storage options for different types of products?",
          answer:
            "Absolutely. We offer flexible storage solutions, including climate-controlled spaces for temperature-sensitive goods, short-term or long-term plans, and customized shelving as needed.",
        },
        {
          question:
            "How fast can orders be processed and shipped from your warehouse?",
          answer:
            "We offer same-day processing for orders received before the cut-off time, and most orders are shipped within 24-48 hours depending on the service level selected.",
        },
      ],
    },
    cta: {
      image:
        "https://images.pexels.com/photos/36552175/pexels-photo-36552175.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
      heading: "Discuss How Our System of Warehouse Works",
      description:
        "Our services can support your business and streamline your logistics needs.",
    },
  },
  {
    slug: "customs-brokerage",
    title: "Customs Brokerage Services",
    subtitle:
      "Navigating customs with ease, ensuring your goods clear borders swiftly and compliantly.",
    gallery: {
      images: [
        "https://images.pexels.com/photos/6169027/pexels-photo-6169027.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6170400/pexels-photo-6170400.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6169024/pexels-photo-6169024.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      ],
      videoThumb:
        "https://images.pexels.com/photos/6407551/pexels-photo-6407551.jpeg?auto=compress&cs=tinysrgb&w=900&h=800&fit=crop",
    },
    overview: {
      badge: "SERVICE OVERVIEW",
      headingParts: [
        { text: "Expert and Reliable", color: "red" },
        { text: "Customs Brokerage", color: "navy" },
        { text: "Solutions", color: "red" },
      ],
      paragraphs: [
        "International trade involves complex customs procedures and strict regulatory compliance. Our Customs Brokerage services simplify the entire process, helping your shipments clear borders quickly and without complications.",
        "We handle all customs documentation, duty calculations, tariff classifications, and regulatory filings on your behalf. Our experienced brokers stay current with evolving trade regulations to ensure full compliance and minimize delays at the border.",
        "From import and export declarations to trade compliance consulting, we provide end-to-end customs solutions that save you time, reduce risk, and keep your supply chain moving smoothly across international boundaries.",
      ],
      sidebarImage:
        "https://images.pexels.com/photos/6169027/pexels-photo-6169027.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      sidebarCaption:
        "Expert customs clearance to keep your international shipments moving without delays",
      stepIcons: [Contact, FileCheck, Globe],
      benefits: [
        "Faster Clearance",
        "Compliance Assurance",
        "Cost Optimization",
        "Risk Mitigation",
      ],
      highlights: [
        {
          title: "Trade Compliance",
          description:
            "Full compliance with international trade regulations, tariff classifications, and duty calculations for hassle-free customs clearance.",
        },
        {
          title: "Documentation Management",
          description:
            "Complete handling of all customs paperwork, including import/export declarations, certificates of origin, and regulatory filings.",
        },
      ],
    },
    features: {
      heading: "Stop Worrying About Customs Delays",
      subtitle:
        "Our team of licensed customs brokers handles the complexity of international trade so you can focus on growing your business.",
      cards: [
        {
          icon: FileCheck,
          title: "Customs Documentation",
          description:
            "Complete preparation and filing of all required customs documents for seamless border clearance.",
        },
        {
          icon: Scale,
          title: "Duty & Tariff Management",
          description:
            "Accurate duty calculations and tariff classifications to ensure compliance and minimize costs.",
        },
        {
          icon: Receipt,
          title: "Trade Compliance",
          description:
            "Stay compliant with ever-changing trade regulations across all major markets worldwide.",
        },
        {
          icon: Route,
          title: "Import & Export Solutions",
          description:
            "End-to-end management of both import and export procedures across multiple jurisdictions.",
        },
        {
          icon: AlertTriangle,
          title: "Risk Assessment",
          description:
            "Proactive identification and mitigation of trade compliance risks to protect your business.",
        },
        {
          icon: Languages,
          title: "Multi-Country Support",
          description:
            "Customs brokerage services across multiple countries with local expertise in each market.",
        },
      ],
    },
    faq: {
      items: [
        {
          question: "How long does customs clearance typically take?",
          answer:
            "Standard customs clearance takes 1-3 business days. With our priority services, we can often achieve same-day clearance for time-sensitive shipments.",
        },
        {
          question:
            "Do you handle both import and export customs procedures?",
          answer:
            "Yes, we provide comprehensive customs brokerage for both imports and exports, including all documentation, duty payments, and regulatory compliance.",
        },
        {
          question: "What happens if my shipment is flagged by customs?",
          answer:
            "Our experienced team handles customs inquiries and inspections on your behalf, providing all necessary documentation and working to resolve issues quickly.",
        },
        {
          question: "Can you help with trade compliance consulting?",
          answer:
            "Absolutely. We offer trade compliance consulting services including tariff classification reviews, free trade agreement utilization, and compliance audits.",
        },
      ],
    },
    cta: {
      image:
        "https://images.pexels.com/photos/6169027/pexels-photo-6169027.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
      heading: "Let Us Handle Your Customs Clearance",
      description:
        "Partner with our expert customs brokers to streamline your international trade operations.",
    },
  },
  {
    slug: "supply-chain-management",
    title: "Supply Chain Management Services",
    subtitle:
      "Optimizing every step of your supply chain for streamlined, efficient and cost-effective operations.",
    gallery: {
      images: [
        "https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6170400/pexels-photo-6170400.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6169163/pexels-photo-6169163.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      ],
      videoThumb:
        "https://images.pexels.com/photos/4170172/pexels-photo-4170172.jpeg?auto=compress&cs=tinysrgb&w=900&h=800&fit=crop",
    },
    overview: {
      badge: "SERVICE OVERVIEW",
      headingParts: [
        { text: "End-to-End", color: "red" },
        { text: "Supply Chain Management", color: "navy" },
        { text: "Solutions", color: "red" },
      ],
      paragraphs: [
        "In an increasingly complex global marketplace, effective supply chain management is crucial for maintaining competitive advantage and meeting customer expectations.",
        "Our Supply Chain Management services provide comprehensive visibility and control over your entire logistics network. From procurement and sourcing to distribution and delivery, we optimize every link in your supply chain for maximum efficiency.",
        "Using advanced analytics and proven methodologies, we help you reduce costs, improve delivery performance, and build resilient supply chains that adapt to changing market conditions.",
      ],
      sidebarImage:
        "https://images.pexels.com/photos/4487363/pexels-photo-4487363.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      sidebarCaption:
        "Comprehensive supply chain solutions to optimize operations and drive business growth",
      stepIcons: [BarChart3, Settings, TrendingUp],
      benefits: [
        "Improved Visibility",
        "Cost Reduction",
        "Faster Delivery",
        "Better Planning",
      ],
      highlights: [
        {
          title: "Strategic Planning",
          description:
            "Data-driven supply chain strategies designed to optimize inventory, reduce costs, and improve overall operational efficiency.",
        },
        {
          title: "Performance Analytics",
          description:
            "Real-time analytics and reporting to monitor KPIs, identify bottlenecks, and continuously improve supply chain performance.",
        },
      ],
    },
    features: {
      heading: "Transform Your Supply Chain",
      subtitle:
        "Our supply chain experts work with you to design, implement, and manage solutions that drive efficiency and growth.",
      cards: [
        {
          icon: BarChart3,
          title: "Demand Forecasting",
          description:
            "Advanced predictive analytics to forecast demand accurately and optimize inventory levels.",
        },
        {
          icon: Network,
          title: "Network Optimization",
          description:
            "Strategic network design to minimize costs and maximize service levels across your distribution network.",
        },
        {
          icon: Settings,
          title: "Process Automation",
          description:
            "Automated workflows and integrations to eliminate manual processes and reduce operational overhead.",
        },
        {
          icon: Globe,
          title: "Global Sourcing",
          description:
            "Strategic sourcing solutions to find the best suppliers and optimize procurement costs globally.",
        },
        {
          icon: Target,
          title: "Performance Management",
          description:
            "KPI dashboards and performance tracking to ensure continuous improvement across your supply chain.",
        },
        {
          icon: Brain,
          title: "Risk Management",
          description:
            "Proactive risk identification and mitigation strategies to build resilient supply chains.",
        },
      ],
    },
    faq: {
      items: [
        {
          question: "How do you assess our current supply chain performance?",
          answer:
            "We conduct a comprehensive supply chain audit analyzing your current processes, costs, delivery performance, and technology stack to identify improvement opportunities.",
        },
        {
          question: "Can you integrate with our existing systems?",
          answer:
            "Yes, our solutions integrate with all major ERP, WMS, and TMS platforms. We also offer custom API integrations for proprietary systems.",
        },
        {
          question: "How quickly can we see results from optimization?",
          answer:
            "Most clients see measurable improvements within 3-6 months, with significant cost reductions and efficiency gains within the first year.",
        },
        {
          question:
            "Do you support global supply chain operations?",
          answer:
            "Absolutely. We manage supply chains across multiple continents with local expertise and global visibility.",
        },
      ],
    },
    cta: {
      image:
        "https://images.pexels.com/photos/4170172/pexels-photo-4170172.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
      heading: "Optimize Your Supply Chain Today",
      description:
        "Let our experts analyze and transform your supply chain for maximum efficiency.",
    },
  },
  {
    slug: "cross-border-solutions",
    title: "Cross-Border Solutions",
    subtitle:
      "Seamless cross-border logistics to connect your business with international markets.",
    gallery: {
      images: [
        "https://images.pexels.com/photos/6407551/pexels-photo-6407551.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6169027/pexels-photo-6169027.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6170467/pexels-photo-6170467.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      ],
      videoThumb:
        "https://images.pexels.com/photos/2226458/pexels-photo-2226458.jpeg?auto=compress&cs=tinysrgb&w=900&h=800&fit=crop",
    },
    overview: {
      badge: "SERVICE OVERVIEW",
      headingParts: [
        { text: "Seamless", color: "red" },
        { text: "Cross-Border Logistics", color: "navy" },
        { text: "Solutions", color: "red" },
      ],
      paragraphs: [
        "Expanding into international markets requires reliable cross-border logistics that handle the complexities of customs, regulations, and multi-modal transportation.",
        "Our Cross-Border Solutions provide end-to-end management of international shipments, ensuring compliance with local regulations while maintaining speed and cost-efficiency.",
        "From documentation and customs clearance to last-mile delivery in the destination country, we ensure your goods reach their international destination safely and on time.",
      ],
      sidebarImage:
        "https://images.pexels.com/photos/2226458/pexels-photo-2226458.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      sidebarCaption:
        "International logistics solutions designed to connect your business with global markets seamlessly",
      stepIcons: [Globe, ShieldAlert, MapPin],
      benefits: [
        "Global Reach",
        "Regulatory Compliance",
        "Cost Efficiency",
        "Faster Transit",
      ],
      highlights: [
        {
          title: "International Shipping",
          description:
            "Multi-modal international shipping solutions with optimized routes and competitive rates for global trade.",
        },
        {
          title: "Customs & Compliance",
          description:
            "Full regulatory compliance management across all destination countries with local expertise and support.",
        },
      ],
    },
    features: {
      heading: "Go Global Without the Complexity",
      subtitle:
        "Our cross-border experts handle the intricacies of international logistics so you can focus on expanding your business worldwide.",
      cards: [
        {
          icon: Globe,
          title: "Multi-Country Operations",
          description:
            "Seamless logistics operations across multiple countries with local expertise in each market.",
        },
        {
          icon: FileCheck,
          title: "Regulatory Compliance",
          description:
            "Comprehensive compliance with import/export regulations, trade agreements, and local requirements.",
        },
        {
          icon: Route,
          title: "Optimized Routes",
          description:
            "Multi-modal transportation solutions with optimized routing for speed and cost efficiency.",
        },
        {
          icon: Lock,
          title: "Secure Transportation",
          description:
            "End-to-end security for your shipments with tracking, insurance, and risk management.",
        },
        {
          icon: Receipt,
          title: "Trade Finance",
          description:
            "Support with trade finance solutions including letters of credit, duty management, and payment terms.",
        },
        {
          icon: Users,
          title: "Local Partnerships",
          description:
            "Strong network of local partners and agents ensuring reliable last-mile delivery worldwide.",
        },
      ],
    },
    faq: {
      items: [
        {
          question: "Which countries do you serve?",
          answer:
            "We operate in over 100 countries across all major trade lanes with dedicated local teams in key markets.",
        },
        {
          question: "How do you handle different customs regulations?",
          answer:
            "Our team of licensed customs brokers and compliance specialists stay current with regulations in each market to ensure smooth clearance.",
        },
        {
          question: "Can you handle oversized or special cargo internationally?",
          answer:
            "Yes, we specialize in project cargo and oversized shipments with custom solutions for complex international logistics requirements.",
        },
        {
          question:
            "What tracking visibility do I get for international shipments?",
          answer:
            "We provide end-to-end visibility with real-time tracking, milestone notifications, and estimated delivery updates for all international shipments.",
        },
      ],
    },
    cta: {
      image:
        "https://images.pexels.com/photos/6407551/pexels-photo-6407551.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
      heading: "Expand Your Business Globally",
      description:
        "Partner with us for seamless cross-border logistics that connect you with international markets.",
    },
  },
  {
    slug: "last-mile-delivery",
    title: "Last-Mile Delivery Services",
    subtitle:
      "Reliable last-mile delivery that gets your products to customers' doorsteps with precision.",
    gallery: {
      images: [
        "https://images.pexels.com/photos/6169017/pexels-photo-6169017.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/7362903/pexels-photo-7362903.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6169184/pexels-photo-6169184.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      ],
      videoThumb:
        "https://images.pexels.com/photos/6169193/pexels-photo-6169193.jpeg?auto=compress&cs=tinysrgb&w=900&h=800&fit=crop",
    },
    overview: {
      badge: "SERVICE OVERVIEW",
      headingParts: [
        { text: "Fast and Reliable", color: "red" },
        { text: "Last-Mile Delivery", color: "navy" },
        { text: "Solutions", color: "red" },
      ],
      paragraphs: [
        "The last mile is the most critical and often the most challenging part of the delivery journey. Our Last-Mile Delivery services ensure your products reach customers quickly and reliably.",
        "We combine advanced route optimization technology with a dedicated fleet of drivers to provide same-day and next-day delivery options that meet today's consumer expectations for speed and convenience.",
        "From real-time tracking and delivery notifications to proof of delivery and returns management, we provide a complete last-mile solution that enhances your customer experience.",
      ],
      sidebarImage:
        "https://images.pexels.com/photos/6169017/pexels-photo-6169017.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      sidebarCaption:
        "Reliable last-mile solutions designed to exceed customer delivery expectations every time",
      stepIcons: [Package, Truck, CheckCircle],
      benefits: [
        "Same-Day Delivery",
        "Real-Time Tracking",
        "Customer Satisfaction",
        "Flexible Scheduling",
      ],
      highlights: [
        {
          title: "Speed & Reliability",
          description:
            "Same-day and next-day delivery options with industry-leading on-time delivery rates and real-time tracking.",
        },
        {
          title: "Customer Experience",
          description:
            "Delivery notifications, flexible time windows, and professional drivers that represent your brand perfectly.",
        },
      ],
    },
    features: {
      heading: "Deliver Excellence to Every Doorstep",
      subtitle:
        "Our last-mile delivery network ensures your products reach customers faster and more reliably than ever before.",
      cards: [
        {
          icon: Zap,
          title: "Same-Day Delivery",
          description:
            "Rapid delivery services to get your products to customers on the same day they order.",
        },
        {
          icon: MapPin,
          title: "Route Optimization",
          description:
            "AI-powered route planning to maximize delivery efficiency and minimize transit times.",
        },
        {
          icon: Clock,
          title: "Flexible Scheduling",
          description:
            "Let customers choose delivery windows that work for them with flexible scheduling options.",
        },
        {
          icon: BadgeCheck,
          title: "Proof of Delivery",
          description:
            "Digital proof of delivery with photos, signatures, and GPS confirmation for every drop-off.",
        },
        {
          icon: HeartHandshake,
          title: "White-Glove Service",
          description:
            "Premium delivery experiences for high-value items with inside delivery and setup options.",
        },
        {
          icon: Undo2,
          title: "Returns Management",
          description:
            "Hassle-free returns processing with convenient pickup options and fast refund processing.",
        },
      ],
    },
    faq: {
      items: [
        {
          question: "What delivery speed options do you offer?",
          answer:
            "We offer same-day, next-day, and scheduled delivery options. Delivery windows can be as narrow as 2-hour slots for premium service.",
        },
        {
          question: "Can customers track their deliveries in real time?",
          answer:
            "Yes, customers receive real-time tracking links with live driver location, estimated arrival time, and automatic notifications at each delivery milestone.",
        },
        {
          question: "How do you handle failed delivery attempts?",
          answer:
            "We attempt redelivery the next business day and notify the customer. Customers can also reschedule via our online portal or have the package held at a nearby location.",
        },
        {
          question:
            "Do you offer delivery services for fragile or oversized items?",
          answer:
            "Yes, we provide specialized handling for fragile, oversized, and high-value items with white-glove delivery options.",
        },
      ],
    },
    cta: {
      image:
        "https://images.pexels.com/photos/7362903/pexels-photo-7362903.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
      heading: "Deliver Faster, Delight Customers",
      description:
        "Partner with us to provide the last-mile delivery experience your customers deserve.",
    },
  },
  {
    slug: "project-cargo-handling",
    title: "Project Cargo Handling Services",
    subtitle:
      "Specialized handling for oversized or complex shipments, with tailored logistics solutions.",
    gallery: {
      images: [
        "https://images.pexels.com/photos/6170467/pexels-photo-6170467.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "https://images.pexels.com/photos/6407445/pexels-photo-6407445.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      ],
      videoThumb:
        "https://images.pexels.com/photos/2226458/pexels-photo-2226458.jpeg?auto=compress&cs=tinysrgb&w=900&h=800&fit=crop",
    },
    overview: {
      badge: "SERVICE OVERVIEW",
      headingParts: [
        { text: "Specialized", color: "red" },
        { text: "Project Cargo Handling", color: "navy" },
        { text: "Solutions", color: "red" },
      ],
      paragraphs: [
        "Project cargo requires meticulous planning, specialized equipment, and expert execution. Our Project Cargo Handling services are designed for oversized, heavy, and complex shipments that require custom solutions.",
        "From route surveys and permit acquisition to heavy-lift operations and on-site installation support, we manage every aspect of your project cargo logistics with precision and care.",
        "Our experienced team has handled complex projects across industries including energy, construction, mining, and infrastructure, delivering on time and within budget.",
      ],
      sidebarImage:
        "https://images.pexels.com/photos/12234109/pexels-photo-12234109.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
      sidebarCaption:
        "Expert project cargo solutions for complex shipments requiring specialized planning and execution",
      stepIcons: [Boxes, Truck, Award],
      benefits: [
        "Expert Planning",
        "Heavy-Lift Capability",
        "On-Time Delivery",
        "Risk Management",
      ],
      highlights: [
        {
          title: "Heavy-Lift Operations",
          description:
            "Specialized equipment and expertise for heavy, oversized cargo including cranes, multi-axle trailers, and rigging solutions.",
        },
        {
          title: "Custom Engineering",
          description:
            "Bespoke transport solutions engineered for each project including custom cradles, frames, and securing systems.",
        },
      ],
    },
    features: {
      heading: "Handle Any Project, Any Size",
      subtitle:
        "Our project cargo specialists bring decades of experience to deliver even the most challenging shipments safely and on schedule.",
      cards: [
        {
          icon: Timer,
          title: "Project Planning",
          description:
            "Comprehensive project planning including route surveys, risk assessments, and detailed logistics blueprints.",
        },
        {
          icon: Truck,
          title: "Specialized Transport",
          description:
            "Access to specialized vehicles and equipment for oversized, heavy, and out-of-gauge cargo.",
        },
        {
          icon: ShieldAlert,
          title: "Permit Management",
          description:
            "Complete permit acquisition and regulatory compliance for oversized and heavy transport operations.",
        },
        {
          icon: Globe,
          title: "Multi-Modal Solutions",
          description:
            "Combining sea, air, road, and rail transport for optimal routing of project cargo worldwide.",
        },
        {
          icon: Lock,
          title: "Insurance & Risk",
          description:
            "Comprehensive cargo insurance and risk management programs tailored for high-value project cargo.",
        },
        {
          icon: Users,
          title: "On-Site Support",
          description:
            "Experienced supervisors and technical support for loading, unloading, and on-site installation.",
        },
      ],
    },
    faq: {
      items: [
        {
          question: "What qualifies as project cargo?",
          answer:
            "Project cargo includes oversized, heavy, high-value, or complex shipments that require specialized handling, equipment, and planning beyond standard freight services.",
        },
        {
          question: "How far in advance should I plan a project cargo shipment?",
          answer:
            "We recommend engaging us 3-6 months before the planned shipment date for complex projects, though we can accommodate shorter timelines when needed.",
        },
        {
          question: "Do you handle the permits and regulatory approvals?",
          answer:
            "Yes, we manage all necessary permits, route approvals, escort arrangements, and regulatory compliance for oversized and heavy transport.",
        },
        {
          question:
            "Can you provide on-site supervision and installation support?",
          answer:
            "Absolutely. Our team includes experienced project managers and technical supervisors who can support on-site operations from delivery through installation.",
        },
      ],
    },
    cta: {
      image:
        "https://images.pexels.com/photos/6170467/pexels-photo-6170467.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop",
      heading: "Plan Your Next Project Shipment",
      description:
        "Let our project cargo experts design a custom logistics solution for your complex shipment needs.",
    },
  },
];

export function getServiceBySlug(slug: string): ServiceDetailData | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
