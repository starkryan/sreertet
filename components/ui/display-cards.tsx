"use client";

import { cn } from "@/lib/utils";
import { Facebook, MessageCircle, MessagesSquare } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Facebook className="size-4 text-blue-300" />,
  title = "Facebook",
  description = "Your OTP is 123456",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
}
: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-28 sm:h-36 w-[16rem] sm:w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-muted/70 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-white/20 hover:bg-muted [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="relative inline-block rounded-full bg-blue-800 p-1">
          {icon}
        </span>
        <p className={cn("text-base sm:text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-sm sm:text-lg">{description}</p>
      <p className="text-xs sm:text-sm text-muted-foreground">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      icon: <Facebook className="size-4 text-blue-300" />,
      title: "Facebook",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className: "[grid-area:stack] hover:-translate-y-5 sm:hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <MessageCircle className="size-4 text-green-300" />,
      title: "WhatsApp",
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
      className: "[grid-area:stack] translate-x-10 sm:translate-x-16 translate-y-5 sm:translate-y-10 hover:-translate-y-0 sm:hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <MessagesSquare className="size-4 text-purple-300" />,
      title: "Discord",
      iconClassName: "text-purple-500",
      titleClassName: "text-purple-500",
      className: "[grid-area:stack] translate-x-20 sm:translate-x-32 translate-y-10 sm:translate-y-20 hover:translate-y-5 sm:hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 px-4 py-4 sm:px-0 sm:py-0">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}