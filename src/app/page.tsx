import Image from "next/image";
import Logo from "../../public/images/logo.png"
import Whatsapp from "../../public/images/image-wpp.png"
import Button from '@/components/Button';

export default function Home() {
  return (
    <>
      <header className="flex w-full bg-customGreen py-6 px-24">
        <div className="flex w-1/2">
          <Image 
          src={Logo}
          alt='Logo atender.me'
          />
        </div>
        
          <nav className="flex 1/2 items-center gap-5">
            <ul className="flex gap-5 text-white">
              <li>HOME</li>
              <li>COMO FUNCIONA</li>
              <li>PREÇOS</li>
            </ul>
             <Button
              text="ENTRAR"
              bgColor="bg-white"
              textColor="text-customPrimary"
              />

              <Button
              text="QUERO MEU AGENTE"
              bgColor="bg-customPrimary"
              textColor="text-white"
              />
          </nav>        
      </header>

      <section className="flex w-full px-24 py-14">
        <div className="flex flex-col w-1/2">
          <h2 className="text-5xl">Transforme seu whatsapp em um atendente inteligente que entende audios e imagens e vende para você 24h por dia 7 dias por semana!</h2>
          <h3 className="text-4xl">
            Sem configurar fluxos.<br />
            Treinou, ele atende como <br />
            se fosse da sua equipe.
          </h3>
          <Button
          text="QUERO MEU AGENTE"
          bgColor="bg-customPrimary"
          textColor="text-white"
          width="w-60"
          />
        </div>
      </section>
    </>
  );
}
