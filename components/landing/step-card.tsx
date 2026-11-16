import Image from 'next/image';

export interface StepCardProps {
  number: number;
  title: string;
  description: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  theme: 1 | 2 | 3 | 4;
  breakTitle?: boolean;
}

export function StepCard({
  number,
  title,
  description,
  image,
  imageWidth,
  imageHeight,
  theme,
  breakTitle = false,
}: StepCardProps) {
  return (
    <li className={`hiw-step hiw-step-${theme} relative min-h-[290px] rounded-[18px] border p-[26px] pb-[30px] min-[1101px]:min-h-[250px] min-[1101px]:p-5 min-[1101px]:pb-6`}>
      <div className="flex h-[120px] items-start justify-between max-[639px]:h-[132px] min-[1101px]:h-[96px]">
        <span className={`hiw-step-number hiw-step-number-${theme} mt-[22px] grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-xl font-extrabold num min-[1101px]:mt-3`}>
          {number}
        </span>
        <Image
          src={image}
          alt=""
          width={imageWidth}
          height={imageHeight}
          loading="lazy"
          className="-mr-1.5 -mt-7 h-32 w-auto max-w-[70%] object-contain drop-shadow-[0_10px_14px_var(--hiw-illustration-shadow)] min-[1101px]:-mt-5 min-[1101px]:h-28"
        />
      </div>
      <h3 className="mt-[14px] font-display text-[26px] font-bold leading-[1.15] tracking-[-0.01em] text-foreground min-[1101px]:mt-2 min-[1101px]:text-[23px]">
        {breakTitle ? <>Pitch to the<br />AI Fund Manager</> : title}
      </h3>
      <p className="mt-3 text-base leading-[1.6] text-hiw-copy min-[1101px]:mt-2 min-[1101px]:text-[15px] min-[1101px]:leading-[1.45]">{description}</p>
    </li>
  );
}
