import Image from "next/image";
import Logo from "../../public/images/logo.png"
import Whatsapp from "../../public/images/image-wpp.png"

export default function Home() {
  return (
    <>
      <header className="flex flex-col w-full bg-customSecondary px-40 py-10 h-screen bg-[url('/images/bg-hero.png')] bg-contain bg-no-repeat bg-[center_120px]">
        <div className="flex w-full">
          <div className="flex w-1/2">
            <Image 
            src={Logo}
            alt="Logo atender.me"
            />
          </div>

          <div className="flex w-1/2">
            text
          </div>
        </div>

        <div className="flex flex-col ">
            <p className="text-white text-4xl mt-10">
              Transforme seu whatsapp<br />
              em um atendente inteligente<br />
              que entende áudios, imagens<br />
              e vende para você 24/7.
            </p>

            <p className="text-2xl mt-8">
              Sem configurar fluxos.<br />
              <strong>
                Treinou, ele atende como<br />
                se fosse da sua equipe.
              </strong>
            </p>

            <button className="rounded-3xl border border-customPrimary py-3 px-8 mt-10 w-48">
              Vender mais!
            </button>
        </div>
      </header>
      <section className="flex px-40 py-20 bg-customPrimary text-white text-4xl"> 
        <p>
          Empresas economizam tempo e aumentam vendas com a <strong>atender.me</strong><br />
          a IA que <strong>aprende com você, responde como humano e nunca perde<br />
          uma oportunidade</strong>
        </p>
      </section>
      <section className="flex w-full px-40 py-20 text-4xl">
        <div className="flex flex-col items-center justify-center w-1/2">
          <p>
            Você não quer <br />
            perder mais<br />
            clientes, quer?
          </p>
        </div>
        <div>
          <Image 
          src={Whatsapp}
          alt="WhatsApp"
          />
        </div>
      </section>
    </>
  );
}
