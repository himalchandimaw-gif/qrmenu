"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Coffee,
  Eye,
  LayoutDashboard,
  Menu,
  Palette,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Tags,
  Upload,
  Utensils,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-gray-950 text-white">
      <section className="relative px-4 py-6">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />

        <nav className="relative mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
              <QrCode className="h-6 w-6" />
            </div>

            <div>
              <h1 className="font-black">QR Menu</h1>
              <p className="text-xs text-white/50">Digital Restaurant Menu</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm font-semibold text-white/70 md:flex">
            <a href="#features">Features</a>
            <a href="#packages">Packages</a>
            <a href="#demo">Demo</a>
          </div>

          <a
            href="/login"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-gray-950"
          >
            Admin Login
          </a>
        </nav>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 pb-20 pt-20 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-orange-200 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Modern QR menu system for restaurants
            </div>

            <h2 className="text-5xl font-black leading-tight md:text-7xl">
              Scan QR. <br />
              View Menu. <br />
              <span className="text-orange-300">Update Anytime.</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">
              A complete digital menu system for restaurants, hotels and cafes.
              Customers scan a QR code and view the live menu. Owners can update
              items, prices, photos and categories from the admin panel.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/menu/wikara-cafe"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-4 font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700"
              >
                View Live Demo
                <ArrowRight className="h-5 w-5" />
              </a>

              <a
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                Admin Panel
                <LayoutDashboard className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              <MiniStat title="QR Menu" value="Live" />
              <MiniStat title="Admin" value="Easy" />
              <MiniStat title="Hosting" value="Cloud" />
            </div>
          </motion.div>

          <motion.div
            id="demo"
            initial={{ opacity: 0, y: 45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.75 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[3rem] bg-orange-500/20 blur-3xl" />

            <div className="relative mx-auto max-w-sm rounded-[3rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-[2.5rem] bg-orange-50 p-4 text-gray-900">
                <div className="rounded-[2rem] bg-gradient-to-br from-orange-700 to-gray-950 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                      <Coffee className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-xs text-white/60">Digital QR Menu</p>
                      <h3 className="font-black">Wikara Cafe</h3>
                    </div>
                  </div>

                  <h4 className="mt-8 text-3xl font-black">
                    Taste the best from our kitchen.
                  </h4>
                </div>

                <div className="mt-4 rounded-3xl bg-white p-3 shadow">
                  <div className="mb-3 flex gap-2">
                    <span className="rounded-full bg-orange-700 px-3 py-2 text-xs font-bold text-white">
                      All
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-2 text-xs font-bold">
                      Rice
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-2 text-xs font-bold">
                      Drinks
                    </span>
                  </div>

                  <FoodPreview
                    name="Chicken Fried Rice"
                    desc="Chicken, egg, vegetables and special sauce"
                    price="950"
                    icon={<Utensils className="h-7 w-7" />}
                  />

                  <FoodPreview
                    name="Iced Coffee"
                    desc="Cold coffee with milk and cream"
                    price="550"
                    icon={<Coffee className="h-7 w-7" />}
                  />

                  <FoodPreview
                    name="Chocolate Cake"
                    desc="Soft chocolate cake slice"
                    price="650"
                    icon={<Star className="h-7 w-7" />}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="bg-white px-4 py-20 text-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-black text-orange-700">Features</p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Everything needed for a digital menu
            </h2>

            <p className="mt-4 text-gray-500">
              Built for restaurants, hotels, cafes, bakeries and food businesses.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<QrCode />}
              title="QR Menu Link"
              text="Each restaurant gets a unique menu link that can be used for QR codes."
            />

            <FeatureCard
              icon={<Menu />}
              title="Menu Management"
              text="Add, edit and delete menu items with prices, descriptions and categories."
            />

            <FeatureCard
              icon={<Upload />}
              title="Food Photos"
              text="Upload food images directly from the admin panel."
            />

            <FeatureCard
              icon={<Tags />}
              title="Categories"
              text="Create categories like rice, kottu, coffee, desserts, drinks and more."
            />

            <FeatureCard
              icon={<Palette />}
              title="Custom Theme"
              text="Change restaurant name, logo, colors and background style."
            />

            <FeatureCard
              icon={<Smartphone />}
              title="Mobile Friendly"
              text="Customers can scan and view the menu perfectly on any phone."
            />
          </div>
        </div>
      </section>

      <section id="packages" className="bg-gray-100 px-4 py-20 text-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-black text-orange-700">Packages</p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Choose your restaurant package
            </h2>

            <p className="mt-4 text-gray-500">
              Start with QR menu now. Ordering and full restaurant system can be
              added later.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <PackageCard
              title="Starter Menu"
              badge="Package 1"
              price="Basic QR Menu"
              highlight
              features={[
                "QR menu page",
                "Admin login",
                "Add/edit/delete items",
                "Categories",
                "Food photos",
                "Price updates",
                "Available / unavailable",
                "Theme color",
              ]}
            />

            <PackageCard
              title="Smart Order"
              badge="Package 2"
              price="Menu + Ordering"
              features={[
                "Everything in Package 1",
                "Customer cart",
                "Place order",
                "Table number",
                "Order dashboard",
                "Order status",
                "WhatsApp notification",
              ]}
            />

            <PackageCard
              title="Restaurant Pro"
              badge="Package 3"
              price="Full System"
              features={[
                "Everything in Package 2",
                "Kitchen view",
                "Sales reports",
                "Staff accounts",
                "Combo offers",
                "QR per table",
                "Custom domain",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-950 px-4 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <StepCard
            number="01"
            title="Create Menu"
            text="Add restaurant details, categories, food items, prices and photos."
          />

          <StepCard
            number="02"
            title="Generate QR"
            text="Use the restaurant menu link to create and print the QR code."
          />

          <StepCard
            number="03"
            title="Customer Scan"
            text="Customers scan QR code and view the menu on their phone."
          />

          <StepCard
            number="04"
            title="Update Anytime"
            text="Owner can change prices and items anytime from admin panel."
          />
        </div>
      </section>

      <section className="bg-orange-600 px-4 py-20 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <ShieldCheck className="mx-auto h-14 w-14" />

          <h2 className="mt-5 text-4xl font-black md:text-5xl">
            Ready to go digital?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-orange-100">
            Give your restaurant a modern QR menu with live updates, admin
            dashboard and mobile-friendly customer menu.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/menu/wikara-cafe"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-orange-700"
            >
              View Demo Menu
              <Eye className="h-5 w-5" />
            </a>

            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-950 px-6 py-4 font-black text-white"
            >
              Open Admin Panel
              <LayoutDashboard className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 px-4 py-8 text-center text-sm text-white/50">
        <p>© 2026 QR Menu System. Built for restaurants, cafes and hotels.</p>
      </footer>
    </main>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-white/50">{title}</p>
    </div>
  );
}

function FoodPreview({
  name,
  desc,
  price,
  icon,
}: {
  name: string;
  desc: string;
  price: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-3 flex gap-3 rounded-2xl border border-gray-100 p-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-black">{name}</h4>

          <p className="rounded-full bg-orange-700 px-3 py-1 text-xs font-black text-white">
            Rs. {price}
          </p>
        </div>

        <p className="mt-1 text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
        {icon}
      </div>

      <h3 className="text-xl font-black">{title}</h3>

      <p className="mt-3 leading-7 text-gray-500">{text}</p>
    </motion.div>
  );
}

function PackageCard({
  title,
  badge,
  price,
  features,
  highlight = false,
}: {
  title: string;
  badge: string;
  price: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`rounded-[2rem] p-6 shadow-sm ${
        highlight
          ? "bg-gray-950 text-white ring-4 ring-orange-500"
          : "bg-white text-gray-950"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-4 py-2 text-xs font-black ${
            highlight
              ? "bg-orange-500 text-white"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {badge}
        </span>

        {highlight && (
          <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
            Best for first client
          </span>
        )}
      </div>

      <h3 className="mt-6 text-3xl font-black">{title}</h3>

      <p className={highlight ? "mt-2 text-white/60" : "mt-2 text-gray-500"}>
        {price}
      </p>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <CheckCircle2
              className={`h-5 w-5 ${
                highlight ? "text-orange-300" : "text-orange-600"
              }`}
            />

            <p className={highlight ? "text-white/80" : "text-gray-600"}>
              {feature}
            </p>
          </div>
        ))}
      </div>

      <a
        href={highlight ? "/menu/wikara-cafe" : "#packages"}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black ${
          highlight
            ? "bg-orange-600 text-white"
            : "bg-gray-100 text-gray-950"
        }`}
      >
        {highlight ? "View Package 1 Demo" : "Coming Soon"}
        <ArrowRight className="h-5 w-5" />
      </a>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
      <p className="text-4xl font-black text-orange-300">{number}</p>

      <h3 className="mt-5 text-xl font-black">{title}</h3>

      <p className="mt-3 leading-7 text-white/55">{text}</p>
    </div>
  );
}