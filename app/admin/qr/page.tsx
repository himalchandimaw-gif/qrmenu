"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, QrCode } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function QRPage() {
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    loadQRData();
  }, []);

  async function loadQRData() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/login");
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("restaurant_admins")
      .select("restaurant_id")
      .limit(1)
      .single();

    if (adminError || !adminData) {
      alert("No restaurant assigned.");
      setLoading(false);
      return;
    }

    const { data: restaurantData } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", adminData.restaurant_id)
      .single();

    setRestaurant(restaurantData);

    const origin = window.location.origin;
    setMenuUrl(`${origin}/menu/${restaurantData.slug}`);

    setLoading(false);
  }

  function downloadQR() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || !restaurant) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1200;
    canvas.height = 1200;

    img.onload = () => {
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 100, 100, 1000, 1000);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");

      link.href = pngUrl;
      link.download = `${restaurant.slug}-qr-menu.png`;
      link.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        Loading QR...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/admin")}
          className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold shadow"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Admin
        </button>

        <section className="rounded-[2rem] bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-700">
            <QrCode className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-black">QR Menu Code</h1>

          <p className="mt-2 text-gray-500">
            Print this QR and place it on tables, counters, flyers or menu cards.
          </p>

          <div className="mt-8 flex justify-center">
            <div
              ref={qrRef}
              className="rounded-[2rem] border bg-white p-6 shadow"
            >
              <QRCodeSVG
                value={menuUrl}
                size={280}
                level="H"
                includeMargin
              />
            </div>
          </div>

          <h2 className="mt-6 text-xl font-black">
            {restaurant?.name}
          </h2>

          <p className="mx-auto mt-2 max-w-xl break-all rounded-2xl bg-gray-100 p-4 text-sm text-gray-600">
            {menuUrl}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={menuUrl}
              target="_blank"
              className="rounded-2xl bg-gray-950 px-6 py-4 font-black text-white"
            >
              Open Menu
            </a>

            <button
              onClick={downloadQR}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-700 px-6 py-4 font-black text-white"
            >
              <Download className="h-5 w-5" />
              Download QR
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}