"use client";
import Banner from "@/components/banner";
import Cabecalho from "@/components/Cabecalho";
import Galeria from "@/components/Galeria";

export default function Home() {  
  return (
    <main className="min-h-screen">
      <Cabecalho />
      <Banner/>
      <Galeria/>
    </main>
  );
}
