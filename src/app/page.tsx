import Image from "next/image";
import Logo from "../../public/images/logo.png"
import Whatsapp from "../../public/images/image-wpp.png"

export default function Home() {
  return (
    <>
      <header className="flex w-full bg-customGreen h-28">
        <div className="flex w-1/2">
          <Image 
          src={Logo}
          width={226}
          height={35}
          alt='Logo atender.me'
          />
        </div>
        <div className="flex w1/2"></div>
      </header>
    </>
  );
}
