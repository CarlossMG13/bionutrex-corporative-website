import * as React from "react";

import heroImage from "@/assets/images/heroSection-img.webp";

export default function HeroSection() {
  return (
    <div className="flex flex-col my-20 justify-center items-center overflow-hidden gap-10">
      <div className="top-content canada px-5 flex items-center justify-center flex-col | md:px-20 | xl:px-40 | 2xl:px-50">
        <span className="text-[#333] text-xs font-bold text-center">
          ALCANZA TUS METAS
        </span>
        <h2 className="text-[#333] leading-10 text-5xl font-bold text-center | sm:text-8xl sm:leading-19 | xl:text-9xl xl:leading-25">
          ENCUENTRA <br />
          TU FUERZA
        </h2>
      </div>
      <div className="bottom-content px-5 h-80 w-full | md:h-100 md:px-20 | xl:px-40 | 2xl:px-50 2xl:h-120">
        <div className="widget relative h-full w-full overflow-hidden rounded-md">
          <img
            src={heroImage}
            alt="Hero Image"
            className="inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 h-full w-full flex flex-col items-center justify-center text-white">
            <h2 className="canada leading-10 text-5xl font-bold text-center | sm:text-8xl sm:leading-19 | xl:text-9xl xl:leading-25">
              DENTRO Y <br />
              FUERA.
            </h2>
          </div>
          <div className="absolute inset-0 h-full w-full flex items-end justify-center p-5 | sm:justify-start">
            <span className="text-[#cdcdcd] raleway leading-4 text-xs text-center | sm:text-start">
              Nos dedicamos a ayudarte a encontrar tus metas <br />
              fitness y mejorar tu salud.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
