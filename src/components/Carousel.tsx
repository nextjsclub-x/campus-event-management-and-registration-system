'use client';

import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

export const Carousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (emblaApi) {
      // 设置自动播放间隔为1.5秒
      const autoplay = setInterval(() => {
        emblaApi.scrollNext();
      }, 1500);

      // 组件卸载时清除定时器
      return () => clearInterval(autoplay);
    }
  }, [emblaApi]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex-[0_0_100%] min-w-0 relative h-[400px]">
            <Image
              src={`/slides/${index}.jpg`}
              alt={`Slide ${index}`}
              fill
              className="object-cover"
              priority={index === 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};